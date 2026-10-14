import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

const dict = {
  brand: { en: "Jaffna Tamil Matrimony", ta: "யாழ் தமிழ் திருமண சேவை" },
  home: { en: "Home", ta: "முகப்பு" },
  search: { en: "Search Profiles", ta: "வரன் தேடல்" },
  about: { en: "About", ta: "எம்மைப் பற்றி" },
  contact: { en: "Contact", ta: "தொடர்பு" },
  login: { en: "Login", ta: "உள்நுழை" },
  register: { en: "Register", ta: "பதிவு செய்" },
  heroKicker: { en: "Trusted Tamil Matrimony in Jaffna", ta: "யாழ்ப்பாணத்தில் நம்பகமான தமிழ் திருமண சேவை" },
  heroTitle: { en: "Find a meaningful match, with family at the heart of it.", ta: "குடும்பத்தின் ஆசியுடன் அர்த்தமுள்ள வாழ்க்கைத் துணை." },
  heroBody: {
    en: "A professionally managed matrimony centre. Every profile is verified and presented by our team, with privacy respected at every step.",
    ta: "தொழில்முறையாக நிர்வகிக்கப்படும் திருமண நிலையம். ஒவ்வொரு வரனும் எமது குழுவால் சரிபார்க்கப்படுகிறது.",
  },
  findMatch: { en: "Find Your Match", ta: "வரன் தேடுங்கள்" },
  gender: { en: "Gender", ta: "பால்" },
  bride: { en: "Bride", ta: "மணமகள்" },
  groom: { en: "Groom", ta: "மணமகன்" },
  any: { en: "Any", ta: "அனைத்தும்" },
  area: { en: "Area", ta: "பிரதேசம்" },
  caste: { en: "Caste", ta: "சாதி" },
  birthYear: { en: "Birth year", ta: "பிறந்த ஆண்டு" },
  from: { en: "From", ta: "இருந்து" },
  to: { en: "To", ta: "வரை" },
  reset: { en: "Reset filters", ta: "மீட்டமை" },
  sort: { en: "Sort", ta: "வரிசை" },
  newest: { en: "Newest", ta: "புதியவை" },
  youngest: { en: "Youngest first", ta: "இளையவர் முதலில்" },
  oldest: { en: "Oldest first", ta: "மூத்தவர் முதலில்" },
  results: { en: "profiles found", ta: "வரன்கள் கிடைத்தன" },
  view: { en: "View Profile", ta: "விவரம் பார்க்க" },
  like: { en: "Shortlist", ta: "விருப்பம்" },
  liked: { en: "Shortlisted", ta: "விரும்பப்பட்டது" },
  howTitle: { en: "How it works", ta: "செயல்முறை" },
  featured: { en: "Featured profiles", ta: "சிறப்பு வரன்கள்" },
  whyTitle: { en: "Why families choose us", ta: "ஏன் எம்மைத் தேர்வு செய்கிறார்கள்" },
  ctaTitle: { en: "Begin with a conversation at our centre.", ta: "எமது நிலையத்தில் ஒரு உரையாடலுடன் ஆரம்பியுங்கள்." },
  age: { en: "Age", ta: "வயது" },
  education: { en: "Education", ta: "கல்வி" },
  occupation: { en: "Occupation", ta: "தொழில்" },
  height: { en: "Height", ta: "உயரம்" },
  star: { en: "Star", ta: "நட்சத்திரம்" },
  requestPhoto: { en: "Request photo", ta: "புகைப்படம் கோருக" },
  requestContact: { en: "Request contact via centre", ta: "நிலையம் மூலம் தொடர்பு கோருக" },
  photoPrivate: { en: "Photo on request", ta: "கோரிக்கையின் பேரில் புகைப்படம்" },
  hidden: { en: "Shared after approval", ta: "அனுமதியின் பின் வழங்கப்படும்" },
  yathakam: { en: "Yathakam", ta: "யாதகம்" },
  signInNote: { en: "Sign-in arrives in the next phase — this action is a preview.", ta: "உள்நுழைவு அடுத்த கட்டத்தில் — இது முன்னோட்டம்." },
  privacy: { en: "Privacy Policy", ta: "தனியுரிமைக் கொள்கை" },
  terms: { en: "Terms & Conditions", ta: "விதிமுறைகள்" },
  contactTitle: { en: "Nainai Amman Matrimony Service 💞", ta: "நயினை அம்மன் திருமண சேவை 💞" },
  contactSub: { en: "Open to all castes · Registration is free", ta: "சகல சாதியினருக்குமான சேவை · பதிவு கட்டணம் இலவசம்" },
  contactPhone: { en: "Phone / WhatsApp", ta: "தொலைபேசி / WhatsApp" },
  contactAddress: { en: "Address", ta: "முகவரி" },
  contactAddressVal: { en: "Near Irupalai Junction, Palsalai", ta: "இருபாலை சந்தி, பால்சாலைக்கு அருகில்" },
  contactFee: { en: "Registration Fee", ta: "பதிவு கட்டணம்" },
  contactFeeVal: { en: "Free", ta: "இலவசம்" },
  contactService: { en: "Service", ta: "சேவை" },
  contactServiceVal: { en: "All castes welcome", ta: "சகல சாதியினருக்கும்" },
  contactCall: { en: "Call: 0763119485", ta: "அழைக்க: 0763119485" },
  formTitle: { en: "Registration Form", ta: "பதிவு படிவம்" },
  formSub: { en: "Free registration · All castes welcome", ta: "பதிவுக் கட்டணம் இலவசம் · சகல சாதியினருக்கும்" },
  formName: { en: "Full Name", ta: "பெயர்" },
  formNamePh: { en: "Your full name", ta: "உங்கள் பெயர்" },
  formGender: { en: "Gender", ta: "பால்" },
  formGenderPh: { en: "Select", ta: "தேர்வு செய்க" },
  formGroomOpt: { en: "Groom", ta: "மணமகன்" },
  formBrideOpt: { en: "Bride", ta: "மணமகள்" },
  formDob: { en: "Date of Birth", ta: "பிறந்த திகதி" },
  formStar: { en: "Birth Star", ta: "நட்சத்திரம்" },
  formStarPh: { en: "e.g. Rohini", ta: "உ.ம்: ரோகிணி" },
  formCaste: { en: "Caste", ta: "சாதி" },
  formCastePh: { en: "Your caste", ta: "உங்கள் சாதி" },
  formArea: { en: "Hometown", ta: "சொந்த இடம்" },
  formAreaPh: { en: "e.g. Jaffna", ta: "உ.ம்: யாழ்ப்பாணம்" },
  formOccupation: { en: "Occupation", ta: "தொழில்" },
  formOccupationPh: { en: "Your occupation", ta: "உங்கள் தொழில்" },
  formPhone: { en: "Phone Number", ta: "தொலைபேசி" },
  formNotes: { en: "Additional Notes", ta: "கூடுதல் குறிப்பு" },
  formNotesPh: { en: "Horoscope details, photo info, expectations...", ta: "ஜாதக குறிப்பு, புகைப்படம் விவரம், எதிர்பார்ப்பு..." },
  formSubmit: { en: "Send via WhatsApp", ta: "WhatsApp மூலம் அனுப்பு" },
  formSentTitle: { en: "WhatsApp is opening!", ta: "WhatsApp திறக்கப்படுகிறது!" },
  formSentBody: { en: "Your details are ready. Please send the message.", ta: "உங்கள் விவரங்கள் தயாராக உள்ளன. அனுப்பி வையுங்கள்." },
  formSentReset: { en: "Register again", ta: "மீண்டும் பதிவு செய்ய" },
  formPhotoProfile: { en: "Photo of Bride / Groom", ta: "மணமகன் / மணமகள் புகைப்படம்" },
  formPhotoYathakam1: { en: "Yathakam — Page 1 (Rasi)", ta: "யாதகம் — பக்கம் 1 (ராசி)"},
  formPhotoYathakam2: { en: "Yathakam — Page 2 (Amsam)", ta: "யாதகம் — பக்கம் 2 (அம்சம்)"},
  formPhotoHint: { en: "After submitting, please also send these photos on WhatsApp.", ta: "அனுப்பிய பிறகு இந்த புகைப்படங்களையும் WhatsApp மூலம் அனுப்பவும்." },
} as const;

export type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict[k].en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "ta" || s === "en") setLangState(s);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
