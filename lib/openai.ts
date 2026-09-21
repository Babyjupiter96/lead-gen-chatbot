import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOutreachMessage(lead: {
  business_name: string;
  industry: string | null;
  city: string | null;
  rating: number | null;
  review_count: number | null;
  has_website: boolean;
}): Promise<{ message: string; score: number }> {
  const prompt = `You are a professional web design and digital marketing agency reaching out to local businesses.

Generate a personalized outreach message for this business:
- Business Name: ${lead.business_name}
- Industry: ${lead.industry || "local business"}
- City: ${lead.city || "their area"}
- Google Rating: ${lead.rating ?? "unknown"}
- Review Count: ${lead.review_count ?? "unknown"}
- Has Website: ${lead.has_website ? "Yes" : "No"}

Write a 3-4 sentence outreach message that:
1. References their specific business name and industry
2. ${!lead.has_website ? "Emphasizes that they currently have no website and what they're missing out on" : "Suggests how their online presence could be improved"}
3. Mentions a concrete benefit relevant to their industry (e.g., online booking for salons, menu for restaurants, portfolio for contractors)
4. Ends with a clear, low-pressure call to action

Also provide a qualification score from 1-10 based on:
- No website = +3 points
- Low review count (under 20) = +2 points
- Rating between 3.5-4.5 (not perfect, room to grow) = +1 point
- Industry that benefits from web presence (restaurants, salons, contractors, etc.) = +2 points
- High rating (4.5+) = +1 point (they have happy customers worth showcasing)
- Low rating (under 3) = -1 point (less likely to invest)

Return ONLY valid JSON in this exact format:
{
  "message": "your outreach message here",
  "score": 7
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content);
  return {
    message: parsed.message,
    score: Math.min(10, Math.max(1, Math.round(parsed.score))),
  };
}
