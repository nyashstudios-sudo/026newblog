interface STKPushParams {
  phone: string;
  amount: number;
  accountReference: string;
  description: string;
}

interface STKPushResult {
  checkoutRequestId: string;
  merchantRequestId: string;
}

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('M-Pesa credentials not configured');

  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const baseUrl =
    process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const res = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) throw new Error('Failed to get M-Pesa access token');
  const data = await res.json();
  return data.access_token;
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('254')) return cleaned;
  return `254${cleaned}`;
}

export async function initiateSTKPush(params: STKPushParams): Promise<STKPushResult> {
  if (!process.env.MPESA_CONSUMER_KEY) {
    // Sandbox mock for development
    return {
      checkoutRequestId: `MOCK-${Date.now()}`,
      merchantRequestId: `MRQ-${Date.now()}`,
    };
  }

  const token = await getAccessToken();
  const baseUrl =
    process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: params.amount,
      PartyA: formatPhone(params.phone),
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formatPhone(params.phone),
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: params.accountReference,
      TransactionDesc: params.description,
    }),
  });

  if (!res.ok) throw new Error('M-Pesa STK push failed');
  const data = await res.json();
  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  };
}

export async function initiateB2CPayment(params: {
  phone: string;
  amount: number;
  remarks: string;
}): Promise<{ conversationId: string; originatorConversationId: string }> {
  if (!process.env.MPESA_CONSUMER_KEY) {
    return {
      conversationId: `MOCK-B2C-${Date.now()}`,
      originatorConversationId: `ORQ-${Date.now()}`,
    };
  }

  const token = await getAccessToken();
  const baseUrl =
    process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const res = await fetch(`${baseUrl}/mpesa/b2c/v1/paymentrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: params.amount,
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: formatPhone(params.phone),
      Remarks: params.remarks,
      QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/timeout`,
      ResultURL: `${process.env.MPESA_CALLBACK_URL}/result`,
      Occasion: '026Newsblog Payout',
    }),
  });

  if (!res.ok) throw new Error('M-Pesa B2C payment failed');
  const data = await res.json();
  return {
    conversationId: data.ConversationID,
    originatorConversationId: data.OriginatorConversationID,
  };
}
