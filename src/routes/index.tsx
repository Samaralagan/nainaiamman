import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ShieldCheck, Users, Lock, HeartHandshake } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useI18n } from "@/lib/i18n";
import { listMembers } from "@/lib/members.functions";
import { withRetry } from "@/lib/retry";
import { ProfileCard } from "@/components/site/ProfileCard";
import { Filters, emptyFilters } from "@/components/site/Filters";
import { ageOf } from "@/lib/profiles";

export const Route = createFileRoute("/")(({
  loader: () => withRetry(() => listMembers()),
  head: () => ({
    meta: [
      { title: "Jaffna Tamil Matrimony — Trusted Tamil Matches in Jaffna" },
      { name: "description", content: "A professionally managed Tamil matrimony centre in Jaffna. Verified profiles, yathakam details and family-first matchmaking." },
      { property: "og:title", content: "Jaffna Tamil Matrimony — Trusted Tamil Matches" },
      { property: "og:description", content: "Verified Tamil matrimonial profiles managed by our Jaffna centre." },
    ],
  }),
  component: Home,
}));

const steps = [
  { en: "Create or receive your profile at the centre", ta: "நிலையத்தில் உங்கள் சுயவிவரத்தைப் பதிவு செய்யுங்கள்" },
  { en: "Search suitable profiles", ta: "பொருத்தமான வரன்களைத் தேடுங்கள்" },
  { en: "Shortlist a profile", ta: "விரும்பிய வரனைத் தெரிவு செய்யுங்கள்" },
  { en: "Request photo or contact through the centre", ta: "நிலையம் மூலம் புகைப்படம்/தொடர்பு கோருங்கள்" },
  { en: "Connect after approval", ta: "அனுமதியின் பின் இணையுங்கள்" },
];

const why = [
  { icon: ShieldCheck, en: ["Verified profiles", "Every member is met and verified by our staff."], ta: ["சரிபார்க்கப்பட்ட வரன்கள்", "ஒவ்வொரு உறுப்பினரும் நேரில் சரிபார்க்கப்படுகிறார்."] },
  { icon: Lock, en: ["Privacy first", "Photos and phone numbers are shared only after approval."], ta: ["தனியுரிமை முதன்மை", "அனுமதியின் பின்னரே புகைப்படம், தொலைபேசி வழங்கப்படும்."] },
  { icon: Users, en: ["Family-centred", "We work with parents and families, the Tamil way."], ta: ["குடும்ப மையம்", "பெற்றோருடனும் குடும்பத்துடனும் இணைந்து செயல்படுகிறோம்."] },
  { icon: HeartHandshake, en: ["Horoscope aware", "Yathakam details presented clearly for matching."], ta: ["யாதக பொருத்தம்", "யாதக விவரங்கள் தெளிவாக வழங்கப்படுகின்றன."] },
];

function RegisterForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", gender: "", dob: "", star: "", caste: "", area: "", occupation: "", phone: "", notes: "" });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const [photoProfile, setPhotoProfile] = useState<string | null>(null);
  const [photoY1, setPhotoY1] = useState<string | null>(null);
  const [photoY2, setPhotoY2] = useState<string | null>(null);

  const readFile = (file: File, setter: (s: string) => void) => {
    const r = new FileReader();
    r.onload = (e) => setter(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const photoNote = [photoProfile && "profile photo", (photoY1 || photoY2) && "yathakam photo(s)"].filter(Boolean).join(" + ");
    const msg = [
      `Name: ${form.name}`,
      `Gender: ${form.gender}`,
      `DOB: ${form.dob}`,
      `Star: ${form.star}`,
      `Caste: ${form.caste}`,
      `Area: ${form.area}`,
      `Occupation: ${form.occupation}`,
      `Phone: ${form.phone}`,
      form.notes ? `Notes: ${form.notes}` : "",
      photoNote ? `Photos to follow: ${photoNote}` : "",
    ].filter(Boolean).join("%0A");
    window.open(`https://wa.me/94763119485?text=${msg}`, "_blank");
    setSent(true);
  };

  const field = "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron";
  const lbl = "block text-xs font-medium text-ember mb-1";

  const PhotoUpload = ({ label, preview, onChange }: { label: string; preview: string | null; onChange: (s: string) => void }) => (
    <div>
      <p className={lbl}>{label}</p>
      <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gold bg-background p-3 text-center transition hover:border-saffron">
        {preview ? (
          <img src={preview} alt={label} className="max-h-32 w-full rounded object-contain" />
        ) : (
          <>
            <svg className="h-7 w-7 text-muted-foreground group-hover:text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 19v-2.5M16 8l-4-4-4 4M12 4v12" />
            </svg>
            <span className="text-xs text-muted-foreground">{label}</span>
          </>
        )}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, onChange); }} />
      </label>
      {preview && <button type="button" onClick={() => onChange("")} className="mt-1 text-xs text-ember hover:underline">✕ Remove</button>}
    </div>
  );

  if (sent) return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border-2 border-gold bg-cream p-12 text-center">
      <span className="text-4xl">💞</span>
      <p className="font-display text-xl text-ember">{t("formSentTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("formSentBody")}</p>
      {(photoProfile || photoY1 || photoY2) && (
        <p className="rounded-md bg-amber-50 px-4 py-2 text-xs text-amber-800">{t("formPhotoHint")}</p>
      )}
      <button onClick={() => { setSent(false); setPhotoProfile(null); setPhotoY1(null); setPhotoY2(null); }} className="mt-2 text-sm text-ember underline">{t("formSentReset")}</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-md border-2 border-gold bg-cream p-6 space-y-4">
      <div>
        <h3 className="font-display text-xl text-ember">{t("formTitle")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("formSub")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>{t("formName")} *</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("formNamePh")} className={field} />
        </div>
        <div>
          <label className={lbl}>{t("formGender")} *</label>
          <select required value={form.gender} onChange={(e) => set("gender", e.target.value)} className={field}>
            <option value="">{t("formGenderPh")}</option>
            <option value="Groom">{t("formGroomOpt")}</option>
            <option value="Bride">{t("formBrideOpt")}</option>
          </select>
        </div>
        <div>
          <label className={lbl}>{t("formDob")} *</label>
          <input required type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className={field} />
        </div>
        <div>
          <label className={lbl}>{t("formStar")}</label>
          <input value={form.star} onChange={(e) => set("star", e.target.value)} placeholder={t("formStarPh")} className={field} />
        </div>
        <div>
          <label className={lbl}>{t("formCaste")}</label>
          <input value={form.caste} onChange={(e) => set("caste", e.target.value)} placeholder={t("formCastePh")} className={field} />
        </div>
        <div>
          <label className={lbl}>{t("formArea")} *</label>
          <input required value={form.area} onChange={(e) => set("area", e.target.value)} placeholder={t("formAreaPh")} className={field} />
        </div>
        <div>
          <label className={lbl}>{t("formOccupation")}</label>
          <input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder={t("formOccupationPh")} className={field} />
        </div>
        <div>
          <label className={lbl}>{t("formPhone")} *</label>
          <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07XXXXXXXX" className={field} />
        </div>
      </div>
      <div>
        <label className={lbl}>{t("formNotes")}</label>
        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder={t("formNotesPh")} className={`${field} resize-none`} />
      </div>

      {/* Photo uploads */}
      <div className="space-y-3 rounded-md border border-dashed border-gold p-4">
        <PhotoUpload label={t("formPhotoProfile")} preview={photoProfile} onChange={(s) => setPhotoProfile(s || null)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <PhotoUpload label={t("formPhotoYathakam1")} preview={photoY1} onChange={(s) => setPhotoY1(s || null)} />
          <PhotoUpload label={t("formPhotoYathakam2")} preview={photoY2} onChange={(s) => setPhotoY2(s || null)} />
        </div>
        <p className="text-xs text-muted-foreground">{t("formPhotoHint")}</p>
      </div>

      <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-ember py-3 text-sm font-semibold text-white hover:bg-primary">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        {t("formSubmit")}
      </button>
    </form>
  );
}

function Home() {
  const { t, lang } = useI18n();
  const [f, setF] = useState(emptyFilters);
  const [sort, setSort] = useState("newest");
  const profiles = Route.useLoaderData();

  const list = useMemo(() => {
    const r = profiles.filter((p) => {
      const y = Number(p.birthDate.slice(0, 4));
      return (!f.gender || p.gender === f.gender) && (!f.area || p.area === f.area) && (!f.caste || p.caste === f.caste) &&
        (!f.yFrom || y >= Number(f.yFrom)) && (!f.yTo || y <= Number(f.yTo));
    });
    return [...r].sort((a, b) =>
      sort === "youngest" ? ageOf(a) - ageOf(b) : sort === "oldest" ? ageOf(b) - ageOf(a) : b.createdAt.localeCompare(a.createdAt),
    );
  }, [profiles, f.gender, f.area, f.caste, f.yFrom, f.yTo, sort]);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="reveal">
          <p className="text-sm font-medium tracking-wide text-ember">{t("heroKicker")}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">{t("heroTitle")}</h1>
          <div className="kolam-rule mt-6 w-24" />
          <p className="mt-6 max-w-lg text-muted-foreground">{t("heroBody")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#search" className="rounded-md bg-ember px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary">{t("findMatch")}</a>
            <a href="#contact" className="rounded-md border px-6 py-3 text-sm font-medium hover:border-saffron">{t("register")}</a>
          </div>
        </div>
        <div className="reveal relative">
          <img src={hero} alt="Brass lamp with jasmine and marigold on silk saree" width={1280} height={1024} className="aspect-[5/4] w-full rounded-md object-cover" />
          <div className="absolute -bottom-4 -left-4 hidden rounded-md border bg-card px-5 py-3 md:block">
            <div className="font-display text-2xl text-ember">1,200+</div>
            <div className="text-xs text-muted-foreground">{lang === "en" ? "families served since 2008" : "2008 முதல் சேவை பெற்ற குடும்பங்கள்"}</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl">{t("howTitle")}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-5">
          {steps.map((s, i) => (
            <li key={i} className="border-t-2 border-gold pt-4">
              <span className="font-display text-3xl text-saffron">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-sm">{s[lang]}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Search profiles */}
      <section id="search" className="scroll-mt-20 border-y bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-4 text-2xl">{t("search")}</h2>
          <div className="rounded-md border bg-card p-4">
            <Filters value={f} onChange={setF} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span><strong>{list.length}</strong> {t("results")}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-muted-foreground">{t("sort")}
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border bg-background px-2 py-1.5 text-foreground">
                    <option value="newest">{t("newest")}</option>
                    <option value="youngest">{t("youngest")}</option>
                    <option value="oldest">{t("oldest")}</option>
                  </select>
                </label>
                <button onClick={() => setF(emptyFilters)} className="text-ember hover:underline">{t("reset")}</button>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => <ProfileCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl">{t("whyTitle")}</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(({ icon: Icon, ...w }) => (
            <div key={w.en[0]}>
              <Icon className="text-saffron" size={26} />
              <h3 className="mt-3 text-lg">{w[lang][0]}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w[lang][1]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 border-y bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="font-display text-3xl">{t("about")}</h2>
          <div className="kolam-rule mt-3 w-20" />
          <div className="mt-6 space-y-4 text-muted-foreground">
            {lang === "en" ? (
              <>
                <p>Jaffna Tamil Matrimony is a professionally managed matrimony centre serving Tamil families in Jaffna and across the diaspora.</p>
                <p>Our staff meet every member, verify their details and present each profile with care — including yathakam details for horoscope matching. Photos and contact details are only shared with approval.</p>
              </>
            ) : (
              <>
                <p>யாழ் தமிழ் திருமண சேவை யாழ்ப்பாணத்திலும் புலம்பெயர் நாடுகளிலும் உள்ள தமிழ் குடும்பங்களுக்கு சேவை செய்யும் தொழில்முறை திருமண நிலையமாகும்.</p>
                <p>ஒவ்வொரு உறுப்பினரையும் எமது ஊழியர்கள் சந்தித்து விவரங்களைச் சரிபார்க்கின்றனர். புகைப்படங்களும் தொடர்பு விவரங்களும் அனுமதியுடன் மட்டுமே பகிரப்படும்.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 border-t">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-2">

            {/* Info panel */}
            <div>
              <h2 className="font-display text-3xl">{t("contact")}</h2>
              <div className="kolam-rule mt-3 w-20" />
              <p className="mt-6 text-lg font-semibold text-ember">{t("contactTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("contactSub")}</p>
              <dl className="mt-8 space-y-5">
                {[
                  [t("contactPhone"), "0763119485"],
                  [t("contactAddress"), t("contactAddressVal")],
                  [t("contactFee"), t("contactFeeVal")],
                  [t("contactService"), t("contactServiceVal")],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-4 border-t border-dashed border-gold pt-4">
                    <dt className="w-40 shrink-0 text-xs font-medium text-ember">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/94763119485"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp: 0763119485
                </a>
                <a
                  href="tel:0763119485"
                  className="rounded-md border border-ember px-5 py-2.5 text-sm font-medium text-ember hover:bg-cream"
                >
                  📞 {t("contactCall")}
                </a>
              </div>
            </div>

            {/* Registration form */}
            <RegisterForm />
          </div>
        </div>
      </section>
    </>
  );
}
