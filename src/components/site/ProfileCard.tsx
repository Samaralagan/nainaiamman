import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ageOf, heightLabel, type Profile } from "@/lib/profiles";
import { useLikes } from "@/lib/likes";

function GenderAvatar({ gender, size = 26 }: { gender: string; size?: number }) {
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

export function ProfileCard({ p }: { p: Profile }) {
  const { t } = useI18n();
  const { isLiked, toggle } = useLikes();
  const liked = isLiked(p.id);
  return (
    <article className="group flex flex-col rounded-md border bg-card transition-shadow hover:shadow-[0_6px_24px_-12px_var(--saffron)]">
      <div className="flex items-center gap-3 border-b p-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border ${p.gender === "bride" ? "border-rose-300 bg-rose-50 text-rose-400" : "border-blue-200 bg-blue-50 text-blue-400"}`}>
          <GenderAvatar gender={p.gender} size={26} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wider text-ember">{p.id}</div>
          <div className="truncate font-display text-lg">{t(p.gender)} · {ageOf(p)}</div>
          <div className="text-xs text-muted-foreground">{t("photoPrivate")}</div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 text-sm">
        {[
          [t("area"), p.area],
          [t("caste"), p.caste],
          [t("education"), p.education],
          [t("occupation"), p.occupation],
          [t("height"), heightLabel(p.heightCm)],
          [t("star"), p.star],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="truncate">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex gap-2 p-4 pt-0">
        <Link to="/profile/$id" params={{ id: p.id }} className="flex-1 rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground hover:bg-ember">
          {t("view")}
        </Link>
        <button
          onClick={() => toggle(p.id)}
          aria-pressed={liked}
          className={`flex items-center gap-1.5 rounded-md border px-3 text-sm transition-colors ${liked ? "border-saffron bg-accent text-ember" : "hover:border-saffron"}`}
        >
          {liked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          <span className="hidden sm:inline">{liked ? t("liked") : t("like")}</span>
        </button>
      </div>
    </article>
  );
}
