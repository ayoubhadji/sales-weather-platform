import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetAiAdviceDto } from './dto/get-ai-advice.dto';
import { ChatWithAdvisorDto } from './dto/chat-with-advisor.dto';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Fast + cheap, good enough for this kind of summarization task.
// Swap for 'llama-3.1-8b-instant' if you want it even faster/cheaper.
const MODEL = 'llama-3.3-70b-versatile';

// Keep the conversation from growing unbounded — older turns matter less
// than the report context, which is rebuilt fresh on every call anyway.
const MAX_HISTORY_MESSAGES = 12;

export interface AiAdvice {
  headline: string;
  recommendations: string[];
}

interface ReportContext {
  summary: GetAiAdviceDto['summary'];
  revenueTrend?: GetAiAdviceDto['revenueTrend'];
  categorySales?: GetAiAdviceDto['categorySales'];
  startDate?: string;
  endDate?: string;
  franchiseName?: string;
}

@Injectable()
export class GroqAdvisorService {
  async getBusinessAdvice(data: GetAiAdviceDto): Promise<AiAdvice> {
    this.assertApiKey();

    const prompt = this.buildPrompt(data);

    const raw = await this.callGroq(
      [{ role: 'user', content: prompt }],
      true, // force JSON output for this one-shot structured response
    );

    let parsed: AiAdvice;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException('Groq response was not valid JSON');
    }

    if (!parsed.headline || !Array.isArray(parsed.recommendations)) {
      throw new InternalServerErrorException('Groq response was missing expected fields');
    }

    return parsed;
  }

  /**
   * Multi-turn chat, grounded in the same report data every time. The
   * system prompt (built fresh from `data` on each call) carries the
   * report context; `data.messages` carries the actual conversation.
   * The backend has no session/memory — the frontend must resend the
   * full history each time.
   */
  async chatWithAdvisor(data: ChatWithAdvisorDto): Promise<{ reply: string }> {
    this.assertApiKey();

    const systemPrompt = this.buildSystemPrompt(data);
    const history = data.messages.slice(-MAX_HISTORY_MESSAGES);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await this.callGroq(messages, false); // free-form text, not JSON
    return { reply };
  }

  private assertApiKey() {
    if (!process.env.GROQ_API_KEY) {
      throw new InternalServerErrorException('GROQ_API_KEY is not set in the environment');
    }
  }

  private async callGroq(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    forceJson: boolean,
  ): Promise<string> {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.4,
        ...(forceJson ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new InternalServerErrorException(`Groq API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new InternalServerErrorException('Groq returned an empty response');
    }

    return content;
  }

  private formatContext(data: ReportContext): string {
    const { summary, revenueTrend, categorySales, startDate, endDate, franchiseName } = data;

    const period =
      startDate && endDate
        ? `${startDate} to ${endDate}`
        : startDate
        ? `since ${startDate}`
        : endDate
        ? `until ${endDate}`
        : 'all time';

    const trendLines = (revenueTrend ?? [])
      .slice(-14)
      .map((p) => `${p.date}: ${p.revenue.toFixed(2)} DT`)
      .join('\n');

    const categoryLines = (categorySales ?? [])
      .map((c) => `${c.category}: ${c.sales.toFixed(2)} DT`)
      .join('\n');

    return `Scope: ${franchiseName || 'All franchises'}
Period: ${period}

Summary:
- Revenue: ${summary.revenue.toFixed(2)} DT
- Tickets: ${summary.tickets}
- Average ticket: ${summary.averageTicket.toFixed(2)} DT
- Top product: ${summary.topProduct}

Revenue trend (most recent points):
${trendLines || 'No trend data available'}

Sales by category:
${categoryLines || 'No category data available'}`;
  }

  private buildPrompt(data: GetAiAdviceDto): string {
    return `You are a business analyst for a retail/franchise point-of-sale platform.
Analyze the report data below and give practical, specific advice a franchise
manager can act on this week.

${this.formatContext(data)}

STRICT RULES for each recommendation:
- Must cite at least one concrete number from the data above (an exact DT
  amount, a percentage you calculate from the figures, a specific date with
  its value, or a product/category name paired with its actual number).
- Never use vague verbs alone ("promote", "boost", "optimize", "monitor")
  without attaching the number that justifies them.
- Bad (too vague): "Promote Pizza", "Boost FAST_FOOD sales", "Monitor the July 12th spike"
- Good (specific): "Pizza generated 420 DT (34% of total revenue) — feature
  it in the top menu slot", "FAST_FOOD sales dropped 18% after July 10 —
  investigate stock or staffing that day", "July 12th hit 610 DT, 2.3x the
  period average — replicate whatever drove that (promotion, weather, event)"

Respond ONLY with valid JSON in this exact shape, no markdown fences, no extra text:
{
  "headline": "one short sentence capturing the single most important takeaway, with a number in it",
  "recommendations": [
    "specific, actionable recommendation 1 — must include a number",
    "specific, actionable recommendation 2 — must include a number",
    "specific, actionable recommendation 3 — must include a number"
  ]
}
Give between 3 and 5 recommendations. Keep each under 30 words.`;
  }

  private buildSystemPrompt(data: ChatWithAdvisorDto): string {
    return `You are a business analyst assistant embedded in a retail/franchise
point-of-sale platform's reporting page. You are chatting with a franchise
manager or admin who is looking at the report data below.

${this.formatContext(data)}

Answer their questions conversationally, grounded in this data. Whenever you
make a claim or suggestion, cite the specific number that backs it up (an
exact DT amount, a percentage you calculate, or a specific date with its
value) rather than vague statements like "sales are strong" or "consider
promoting this product" with nothing behind them. If they ask about
something the data doesn't cover, say so plainly instead of guessing. Keep
replies concise (a few sentences, or a short list) unless they ask for more
detail. Do not respond with JSON — plain conversational text only.`;
  }
}