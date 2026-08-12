/** Canonical terms that must not be translated incorrectly. */
export const TERMINOLOGY: Record<
  string,
  { canonical: string; doNotTranslate: boolean; translations?: Record<string, string> }
> = {
  "binary search": { canonical: "Binary Search", doNotTranslate: true },
  "binary search tree": { canonical: "Binary Search Tree", doNotTranslate: true },
  "data structure": { canonical: "Data Structure", doNotTranslate: false, translations: { hi: "डेटा संरचना" } },
  algorithm: { canonical: "Algorithm", doNotTranslate: false, translations: { hi: "एल्गोरिदम" } },
};

export function preserveTerminology(text: string, langCode: string): string {
  let result = text;
  for (const [key, term] of Object.entries(TERMINOLOGY)) {
    const regex = new RegExp(key, "gi");
    if (term.doNotTranslate) {
      result = result.replace(regex, term.canonical);
    } else if (term.translations?.[langCode]) {
      result = result.replace(regex, term.translations[langCode]);
    }
  }
  return result;
}

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
