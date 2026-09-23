import type { ScoreBreakdown, ContactInfo, ThumbnailAnalysis } from "@/types/scoring";
import { scoreAudience } from "./audience";
import { scoreActivity } from "./activity";
import { scoreContact } from "./contact";

export { scoreAudience, scoreActivity, scoreContact };
export { activityLabel } from "./activity";

export interface ScoreLeadInput {
  subscriberCount: number | null;
  lastVideoAt: string | Date | null;
  nicheRelevance?: number;
  /** @deprecated compatibility with existing tests/database terminology. */
  teacherRelevance?: number;
  contacts: ContactInfo[];
  thumbnailOpportunity: ThumbnailAnalysis | null;
}

export interface ScoreLeadResult {
  leadScore: number;
  breakdown: ScoreBreakdown;
}

/** Generic 100-point client opportunity score. */
export function scoreLead(input: ScoreLeadInput): ScoreLeadResult {
  const audience = scoreAudience(input.subscriberCount);
  const activity = scoreActivity(input.lastVideoAt);
  const relevance = input.nicheRelevance ?? input.teacherRelevance ?? 0;
  const nicheRelevance = Math.round((relevance / 100) * 15);
  const contact = scoreContact(input.contacts);
  const thumbnailOpportunity = input.thumbnailOpportunity
    ? Math.round((input.thumbnailOpportunity.score / 100) * 15)
    : 0;

  const breakdown: ScoreBreakdown = {
    audience,
    activity,
    teacherRelevance: nicheRelevance,
    contact,
    thumbnailOpportunity,
  };

  return {
    leadScore: audience + activity + nicheRelevance + contact + thumbnailOpportunity,
    breakdown,
  };
}
