// src/app/api/articles/categorize/route.ts
/**
 * ARTICLE CATEGORIZATION API
 * Endpoint to trigger intelligent article categorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { categorizeAllArticles, categorizeArticle } from '@/lib/categorization-engine';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

const categorizeRequestSchema = z.object({
  articleId: z.string().uuid().optional(),
  mode: z.enum(['single', 'batch']).default('single'),
});

/**
 * POST /api/articles/categorize
 * Categorize articles (single or batch)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    await requireRole('admin');

    const body = await req.json();
    const validation = categorizeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 422 }
      );
    }

    const { articleId, mode } = validation.data;

    if (mode === 'single' && articleId) {
      // Categorize single article
      const { createSupabaseContext } = await import('@/lib/supabase/context');
      const { data: ctx } = await createSupabaseContext({ auth: 'admin' });

      if (!ctx) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }

      const supabase = ctx.supabase as any;

      // Fetch article
      const { data: article, error: fetchError } = await supabase
        .from('articles')
        .select('id, title, excerpt, content_html, category_id, tags, meta_description')
        .eq('id', articleId)
        .single();

      if (fetchError || !article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Categorize
      const result = await categorizeArticle(article);

      return NextResponse.json(
        {
          success: true,
          article: {
            id: articleId,
            currentCategory: article.category_id,
            suggestedCategory: result.categoryName,
            confidence: result.confidence,
            scores: result.scores,
            reasoning: result.reasoning,
          },
        },
        { status: 200 }
      );
    } else if (mode === 'batch') {
      // Categorize all articles
      const results = await categorizeAllArticles();

      const summary = {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        averageConfidence:
          results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) /
          results.filter(r => r.success).length,
        results: results.slice(0, 50), // Return first 50 for brevity
      };

      return NextResponse.json(
        {
          success: true,
          summary,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error: any) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: error.message || 'Categorization failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/articles/categorize
 * Trigger batch categorization (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole('admin');

    const results = await categorizeAllArticles();

    const summary = {
      timestamp: new Date().toISOString(),
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      averageConfidence:
        results.filter(r => r.success).length > 0
          ? (results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) /
              results.filter(r => r.success).length)
          : 0,
      byCategory: results.reduce(
        (acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentResults: results.slice(0, 20),
    };

    return NextResponse.json({ success: true, summary }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to categorize articles' },
      { status: 500 }
    );
  }
}
