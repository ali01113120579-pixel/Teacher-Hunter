import type { YouTubeChannel } from "@/types/youtube";

/**
 * Generic niche-fit score (0-100). It compares the requested search terms
 * with the channel's public title/description and adds light business/creator
 * signals. It is deterministic, fast, and does not require an AI call.
 */
export function estimateNicheRelevance(
  channel: Pick<YouTubeChannel, "title" | "description">,
  query: string,
): number {
  const haystack = `${channel.title} ${channel.description}`.toLowerCase();
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);

  if (queryTerms.length === 0) return 0;

  const uniqueTerms = Array.from(new Set(queryTerms));
  const hits = uniqueTerms.filter((term) => haystack.includes(term)).length;
  const matchRatio = hits / uniqueTerms.length;

  const businessSignals = [
    "contact", "whatsapp", "instagram", "business", "company", "brand", "shop", "store",
    "تواصل", "واتساب", "انستجرام", "شركة", "براند", "متجر", "خدمات",
  ];
  const signalHits = businessSignals.filter((term) => haystack.includes(term)).length;

  return Math.min(100, Math.round(matchRatio * 80) + Math.min(20, signalHits * 4));
}

// Backward-compatible alias for the existing database field and tests.
export const estimateTeacherRelevance = estimateNicheRelevance;

export function relevanceConfidenceLabel(score: number): "High confidence" | "Medium confidence" | "Low confidence" {
  if (score >= 70) return "High confidence";
  if (score >= 40) return "Medium confidence";
  return "Low confidence";
}
