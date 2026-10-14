// Phonetic English → Tamil typing (e.g. "vanakkam" → "வணக்கம்").
const CONS: [string, string][] = [
  ["ksh", "க்ஷ"], ["ng", "ங"], ["nj", "ஞ"], ["sh", "ஷ"], ["ch", "ச"], ["th", "த"], ["dh", "த"], ["zh", "ழ"],
  ["k", "க"], ["g", "க"], ["c", "ச"], ["s", "ச"], ["j", "ஜ"], ["t", "ட"], ["d", "ட"], ["T", "ட"], ["D", "ட"],
  ["N", "ண"], ["n", "ந"], ["w", "ந"], ["p", "ப"], ["b", "ப"], ["m", "ம"], ["y", "ய"], ["r", "ர"], ["l", "ல"],
  ["v", "வ"], ["L", "ள"], ["R", "ற"], ["h", "ஹ"], ["S", "ஸ"], ["f", "ஃப"],
];
// [latin, independent vowel, vowel sign]
const VOW: [string, string, string][] = [
  ["aa", "ஆ", "ா"], ["ai", "ஐ", "ை"], ["au", "ஔ", "ௌ"], ["ae", "ஏ", "ே"], ["ee", "ஈ", "ீ"], ["ii", "ஈ", "ீ"],
  ["oo", "ஊ", "ூ"], ["uu", "ஊ", "ூ"], ["ow", "ஔ", "ௌ"], ["oa", "ஓ", "ோ"],
  ["a", "அ", ""], ["i", "இ", "ி"], ["u", "உ", "ு"], ["e", "எ", "ெ"], ["o", "ஒ", "ொ"],
  ["A", "ஆ", "ா"], ["I", "ஈ", "ீ"], ["U", "ஊ", "ூ"], ["E", "ஏ", "ே"], ["O", "ஓ", "ோ"],
];
const PULLI = "்";

function matchAt<T extends [string, ...unknown[]]>(list: T[], s: string, i: number): T | undefined {
  return list.find((e) => s.startsWith(e[0], i));
}

export function transliterate(word: string): string {
  let out = "";
  let i = 0;
  let prevCons = false; // previous token was a consonant carrying a pending pulli
  while (i < word.length) {
    const c = matchAt(CONS, word, i);
    if (c) {
      if (prevCons) out += PULLI;
      let g = c[1];
      if (c[0] === "n" && i > 0) g = "ன";
      out += g;
      i += c[0].length;
      prevCons = true;
      continue;
    }
    const v = matchAt(VOW, word, i);
    if (v) {
      out += prevCons ? v[2] : v[1];
      i += v[0].length;
      prevCons = false;
      continue;
    }
    if (prevCons) { out += PULLI; prevCons = false; }
    out += word[i];
    i++;
  }
  if (prevCons) out += PULLI;
  return out;
}

export const KB_VOWELS = ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ", "ஃ"];
export const KB_SIGNS = ["ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"];
export const KB_CONS = ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன", "ஜ", "ஷ", "ஸ", "ஹ", "க்ஷ", "ஸ்ரீ"];
