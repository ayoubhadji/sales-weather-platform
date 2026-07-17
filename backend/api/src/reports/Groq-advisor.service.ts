import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetAiAdviceDto } from './dto/get-ai-advice.dto';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Fast + cheap, good enough for this kind of summarization task.
// Swap for 'llama-3.1-8b-instant' if you want it even faster/cheaper.
const MODEL = 'llama-3.3-70b-versatile';

export interface AiAdvice {
  headline: string;
  recommendations: string[];
}

@Injectable()
export class GroqAdvisorService {
  async getBusinessAdvice(
    data: GetAiAdviceDto,
  ): Promise<AiAdvice> {
    if (!process.env.GROQ_API_KEY) {
      throw new InternalServerErrorException(
        'GROQ_API_KEY is not set in the environment',
      );
    }

    const prompt = this.buildPrompt(data);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new InternalServerErrorException(
        `Groq API error (${response.status}): ${errText}`,
      );
    }

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content;

    if (!raw) {
      throw new InternalServerErrorException(
        'Groq returned an empty response',
      );
    }

    let parsed: AiAdvice;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException(
        'Groq response was not valid JSON',
      );
    }

    if (!parsed.headline || !Array.isArray(parsed.recommendations)) {
      throw new InternalServerErrorException(
        'Groq response was missing expected fields',
      );
    }

    return parsed;
  }

  private buildPrompt(data: GetAiAdviceDto): string {
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
      .slice(-14) // don't blow up the prompt on long ranges
      .map((p) => `${p.date}: ${p.revenue.toFixed(2)} DT`)
      .join('\n');

    const categoryLines = (categorySales ?? [])
      .map((c) => `${c.category}: ${c.sales.toFixed(2)} DT`)
      .join('\n');

    return `You are a business analyst for a retail/franchise point-of-sale platform.
Analyze the report data below and give practical, specific advice a franchise
manager can act on this week. Do not restate the raw numbers back verbatim;
interpret them.

Scope: ${franchiseName || 'All franchises'}
Period: ${period}

Summary:
- Revenue: ${summary.revenue.toFixed(2)} DT
- Tickets: ${summary.tickets}
- Average ticket: ${summary.averageTicket.toFixed(2)} DT
- Top product: ${summary.topProduct}

Revenue trend (most recent points):
${trendLines || 'No trend data available'}

Sales by category:
${categoryLines || 'No category data available'}

Respond ONLY with valid JSON in this exact shape, no markdown fences, no extra text:
{
  "headline": "one short sentence capturing the single most important takeaway",
  "recommendations": [
    "specific, actionable recommendation 1",
    "specific, actionable recommendation 2",
    "specific, actionable recommendation 3"
  ]
}
Give between 3 and 5 recommendations. Keep each under 25 words. Be concrete
(mention the category, product, or trend you're referring to) rather than generic.`;
  }
}