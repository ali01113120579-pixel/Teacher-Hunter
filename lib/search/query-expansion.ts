/**
 * Expands a client-search query into a few deterministic variants.
 * No AI call: this keeps discovery cheap and works for any niche.
 */
const MAX_QUERIES = 6;

const ARABIC_DISCOVERY_WORDS = ["شركة", "براند", "متجر", "مركز", "عيادة", "مؤسسة"];
const ENGLISH_DISCOVERY_WORDS = ["business", "brand", "company", "studio", "clinic", "agency"];

export function expandSearchQuery(rawQuery: string): string[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const queries = new Set<string>([query]);
  const isArabic = /[\u0600-\u06FF]/.test(query);
  const words = isArabic ? ARABIC_DISCOVERY_WORDS : ENGLISH_DISCOVERY_WORDS;

  for (const word of words) {
    if (queries.size >= MAX_QUERIES) break;
    if (!query.toLowerCase().includes(word.toLowerCase())) queries.add(`${query} ${word}`);
  }

  if (queries.size < MAX_QUERIES) queries.add(isArabic ? `${query} تواصل` : `${query} contact`);
  if (queries.size < MAX_QUERIES) queries.add(isArabic ? `${query} انستجرام` : `${query} instagram`);

  return Array.from(queries).slice(0, MAX_QUERIES);
}
