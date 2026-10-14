import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Camera, Phone, Bookmark, BookmarkCheck, UserRound } from "lucide-react";

function GenderAvatar({ gender, size = 48 }: { gender: string; size?: number }) {
  if (gender === "bride") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" />
        <path d="M9 21c1-2 1.5-3.5 3-4.5" strokeWidth="1.4" />
        <path d="M8 10.5c-1.5 1-2.5 1-3.5.5" strokeWidth="1.2" />
        <path d="M16 10.5c1.5 1 2.5 1 3.5.5" strokeWidth="1.2" />
      </svg>
    );
  }
  return <UserRound size={size} />;
}
import { useI18n } from "@/lib/i18n";
import { ageOf, heightLabel } from "@/lib/profiles";
import { getMember } from "@/lib/members.functions";
import { withRetry } from "@/lib/retry";
import { useLikes } from "@/lib/likes";
import { YathakamCharts } from "@/components/site/Yathakam";

export const Route = createFileRoute("/profile/$id")({
  loader: async ({ params }) => {
    const p = await withRetry(() => getMember({ data: { id: params.id } }));
    if (!p) throw notFound();
    return { p };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Profile not found" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.p;
    const title = `${p.id} — ${p.gender === "bride" ? "Bride" : "Groom"}, ${p.area} | Jaffna Tamil Matrimony`;
    const desc = `${p.education}, ${p.occupation}. Star: ${p.star}. View yathakam details.`;
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }] };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl">Profile not found</h1>
      <Link to="/search" className="mt-4 inline-block text-ember">Back to search</Link>
    </div>
  ),
  component: ProfilePage,
});

function ProfilePage() {
  const { p } = Route.useLoaderData();
  const { t } = useI18n();
  const { isLiked, toggle, hasRequested, request } = useLikes();
  const liked = isLiked(p.id);
  const [y, m, d] = p.birthDate.split("-");
  const details: [string, string][] = [
    ["பிறந்த திகதி", `${d}/${m}/${y}`],
    ["பிறந்த நேரம்", p.birthTime],
    ["நட்சத்திரம்", p.star],
    ["செவ்வாய்", p.sevvai],
    ["பாவம்", p.paavam],
    ["உயரம்", heightLabel(p.heightCm)],
    ["கல்வித்தகைமை", p.education],
    ["தொழில்", p.occupation],
    ["முகவரி", p.address],
    ["எதிர்பார்ப்பு", p.expectations],
    ["தொலைபேசி இல", t("hidden")],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <a href="/#search" className="text-sm text-muted-foreground hover:text-foreground">← {t("search")}</a>

      <header className="mt-6 grid gap-6 border-b pb-8 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className={`grid h-28 w-28 place-items-center rounded-full border-2 ${p.gender === "bride" ? "border-rose-300 bg-rose-50 text-rose-400" : "border-blue-200 bg-blue-50 text-blue-400"}`}>
          <GenderAvatar gender={p.gender} size={48} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-wider text-ember">{p.id}</div>
          <h1 className="mt-1 text-3xl">{t(p.gender)} · {ageOf(p)} {t("age")}</h1>
          <p className="mt-2 text-muted-foreground">{p.area} · {p.caste} · {p.occupation}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => toggle(p.id)} className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm ${liked ? "border-saffron bg-accent text-ember" : "hover:border-saffron"}`}>
            {liked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {liked ? t("liked") : t("like")}
          </button>
          <button onClick={() => request(p.id, "photo")} disabled={hasRequested(p.id, "photo")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-ember"><Camera size={16} /> {hasRequested(p.id, "photo") ? "Photo requested" : t("requestPhoto")}</button>
          <button onClick={() => request(p.id, "contact")} disabled={hasRequested(p.id, "contact")} className="flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm text-primary-foreground hover:bg-primary"><Phone size={16} /> {hasRequested(p.id, "contact") ? "Contact requested" : t("requestContact")}</button>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("yathakam")}</h2>
        <div className="kolam-rule mt-2 w-24" />
        <div className="mt-6 grid gap-8">
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border-l-4 border-gold bg-cream p-4">
                <div className="text-xs text-muted-foreground">நட்சத்திரம்</div>
                <div className="mt-1 font-display text-xl">{p.star}</div>
              </div>
              <div className="rounded-md border-l-4 border-ember bg-cream p-4">
                <div className="text-xs text-muted-foreground">செவ்வாய்</div>
                <div className="mt-1 font-display text-xl">{p.sevvai}</div>
              </div>
            </div>
            
          </div>
          <YathakamCharts chart={p.chart} amsam={p.amsam} id={p.id} />
          <dl className="grid content-start gap-x-8 sm:grid-cols-2">
            {details.map(([k, v]) => (
              <div key={k} className={`border-b py-3 ${k === "எதிர்பார்ப்பு" ? "sm:col-span-2" : ""}`}>
                <dt className="text-xs font-medium text-ember">{k}</dt>
                <dd className={`mt-1 ${k === "தொலைபேசி இல" ? "text-muted-foreground italic" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
