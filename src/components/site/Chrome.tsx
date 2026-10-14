import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex shrink-0 rounded-md border text-xs font-medium" role="group" aria-label="Language">
      {(["en", "ta"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1.5 transition-colors ${lang === l ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {l === "en" ? "EN" : "தமிழ்"}
        </button>
      ))}
    </div>
  );
}

export function Logo() {
  const { t } = useI18n();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5">
      <img src="/logo.png" alt={t("brand")} className="h-auto w-[200px] shrink-0 object-contain" />
    </Link>
  );
}

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const anchorLinks = [
    { href: "/", k: "home" },
    { href: "/#search", k: "search" },
    { href: "/#about", k: "about" },
    { href: "/#contact", k: "contact" },
  ] as const;
  const { user, isAdmin } = useAuth();
  const out = async () => { await supabase.auth.signOut(); };
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:flex lg:justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {anchorLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {t(l.k)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          {user ? (
            <>
              <Link to={isAdmin ? "/admin" : "/account"} className="hidden px-2 text-sm font-medium hover:text-primary sm:block">{isAdmin ? "Admin" : "My Account"}</Link>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:block">{(user.user_metadata?.["username"] as string) || user.email?.split("@")[0]}</span>
              <button onClick={out} className="hidden rounded-md border px-4 py-2 text-sm font-medium hover:border-saffron sm:block">Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden text-sm font-medium text-foreground hover:text-primary sm:block px-2">{t("login")}</Link>
            </>
          )}
          <button className="lg:hidden p-1" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-3 lg:hidden">
          {anchorLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm">{t(l.k)}</a>
          ))}
          {user && <Link to={isAdmin ? "/admin" : "/account"} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">{isAdmin ? "Admin" : "My Account"}</Link>}
          {user ? (
            <button onClick={() => { setOpen(false); out(); }} className="mt-2 w-full rounded-md border py-2 text-sm font-medium">Logout</button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="mt-2 block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground">{t("login")}</Link>
          )}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Kasthuriyar Road, Jaffna, Sri Lanka</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-muted-foreground">
          <a href="/#search" className="hover:text-foreground">{t("search")}</a>
          <a href="/#about" className="hover:text-foreground">{t("about")}</a>
          <a href="/#contact" className="hover:text-foreground">{t("contact")}</a>
          <Link to="/privacy" className="hover:text-foreground">{t("privacy")}</Link>
          <Link to="/terms" className="hover:text-foreground">{t("terms")}</Link>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 {t("brand")}</div>
    </footer>
  );
}
