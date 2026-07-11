interface ModerationResult {
  flagged: boolean;
  confidence: number;
  category?: string;
}

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|casino|viagra)\b/i,
  /(https?:\/\/[^\s]+){3,}/i,
  /(.)\1{10,}/,
];

export async function moderateContent(content: string): Promise<ModerationResult> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: content }),
      });
      if (res.ok) {
        const data = await res.json();
        const result = data.results?.[0];
        if (result) {
          return {
            flagged: result.flagged,
            confidence: result.flagged ? 0.9 : 0.1,
            category: Object.entries(result.categories || {})
              .filter(([, v]) => v)
              .map(([k]) => k)[0],
          };
        }
      }
    } catch {
      // Fall through to rule-based moderation
    }
  }

  const flagged = SPAM_PATTERNS.some((p) => p.test(content));
  return { flagged, confidence: flagged ? 0.75 : 0.05, category: flagged ? 'spam' : undefined };
}
