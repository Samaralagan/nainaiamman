// Profile shape and display helpers. Member records live in the database (members table).
export type Profile = {
  id: string;
  gender: "bride" | "groom";
  birthDate: string; // YYYY-MM-DD
  birthTime: string;
  area: string;
  caste: string;
  education: string;
  occupation: string;
  heightCm: number;
  star: string;
  sevvai: string;
  paavam: string;
  maritalStatus: string;
  expectations: string;
  address: string;
  chart: Record<number, string>; // 12 rasi cells, 1 = Meenam (top-left), clockwise
  amsam?: Record<number, string>; // entered separately, never inferred from rasi
  createdAt: string;
};

const stars = ["அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்"];
const areas = ["Nallur", "Kokuvil", "Chunnakam", "Point Pedro", "Chavakachcheri", "Tellippalai", "Karainagar", "Manipay", "Kopay", "Vavuniya"];
const castes = ["Vellalar", "Karaiyar", "Koviar", "Thattar", "Not specified"];
const edu = ["BSc Engineering", "MBBS", "BCom", "BA (Hons)", "Diploma in Nursing", "LLB", "BSc IT", "Chartered Accountant"];
const occ = ["Software Engineer", "Doctor", "Teacher", "Accountant", "Nurse", "Lawyer", "Bank Officer", "Business"];
const planets = ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி", "ராகு", "கேது", "லக்னம்"];

function seeded(n: number) {
  let x = n * 9301 + 49297;
  return () => ((x = (x * 9301 + 49297) % 233280) / 233280);
}

export const profiles: Profile[] = Array.from({ length: 24 }, (_, i) => {
  const r = seeded(i + 7);
  const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)] as T;
  const gender = i % 2 === 0 ? "bride" : "groom";
  const year = 1988 + Math.floor(r() * 14);
  const month = 1 + Math.floor(r() * 12);
  const day = 1 + Math.floor(r() * 28);
  const chart: Record<number, string> = {};
  planets.forEach((p) => {
    const c = 1 + Math.floor(r() * 12);
    chart[c] = chart[c] ? `${chart[c]} ${p}` : p;
  });
  return {
    id: `JTM${String(1001 + i)}`,
    gender,
    birthDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    birthTime: `${String(1 + Math.floor(r() * 12)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")} ${r() > 0.5 ? "AM" : "PM"}`,
    area: pick(areas),
    caste: pick(castes),
    education: pick(edu),
    occupation: pick(occ),
    heightCm: gender === "bride" ? 150 + Math.floor(r() * 18) : 163 + Math.floor(r() * 20),
    star: pick(stars),
    sevvai: r() > 0.6 ? "உண்டு" : "இல்லை",
    paavam: `${Math.floor(r() * 60)}`,
    maritalStatus: "Never married",
    expectations:
      gender === "bride"
        ? "Educated, well-mannered groom from a respectful family, preferably working in Sri Lanka or abroad."
        : "Educated, family-oriented bride. Horoscope matching preferred.",
    address: `${pick(areas)}, Jaffna`,
    chart,
    createdAt: `2026-0${1 + (i % 9)}-1${i % 10}`,
  };
});

export const allAreas = areas;
export const allCastes = castes;

export const ageOf = (p: Profile) => {
  const b = new Date(p.birthDate);
  const n = new Date("2026-10-07");
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
};

export const heightLabel = (cm: number) => {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}′${inches % 12}″ · ${cm} cm`;
};
