/** Lead scoring model. The teacherRelevance key is kept in the DB for compatibility; it now represents niche fit. */
export interface ScoreBreakdown {
  [key: string]: number;
  audience: number;
  activity: number;
  teacherRelevance: number;
  contact: number;
  thumbnailOpportunity: number;
}

export interface ContactInfo {
  type: "whatsapp" | "phone" | "email" | "website";
  value: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface ThumbnailAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}
