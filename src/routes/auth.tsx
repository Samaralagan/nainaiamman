import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usernameToEmail } from "@/lib/username";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login or Register — Jaffna Tamil Matrimony" },
      { name: "description", content: "Sign in to shortlist profiles and request photos or contact details." },
      { property: "og:title", content: "Login — Jaffna Tamil Matrimony" },
      { property: "og:description", content: "Member sign-in for Jaffna Tamil Matrimony." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user, isAdmin, roleReady } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  useEffect(() => {
    const h = window.location.hostname;
    setShowDemo(import.meta.env.DEV || h === "localhost" || h.startsWith("id-preview--") || h.endsWith(".lovableproject.com"));
  }, []);
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  useEffect(() => {
    if (user && roleReady) nav({ to: isAdmin ? "/admin" : "/account", replace: true });
  }, [user, isAdmin, roleReady, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(form.username), password: form.password });
    if (error) toast.error("Wrong username or password");
    setBusy(false);
  };

  const input = "w-full rounded-md border bg-background px-3 py-2.5 text-sm";
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl">{t("login")}</h1>
      <div className="kolam-rule mt-3 w-20" />
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input required autoComplete="username" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={input} maxLength={30} />
        <input required type="password" autoComplete="current-password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />
        <button disabled={busy} className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-ember disabled:opacity-60">
          {t("login")}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">No account yet? Accounts are created by our centre. Please visit or contact us to register.</p>
      {showDemo && (
        <div className="mt-10 rounded-md border border-gold-soft bg-cream p-4 text-sm">
          <div className="font-semibold">Demo logins (testing only)</div>
          {([
            ["Admin", "admin", "Admin@12345"],
            ["Normal user", "member", "Member@12345"],
          ] as [string, string, string][]).map(([role, username, pw]) => (
            <div key={role} className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{role}</div>
                <div>Username: {username}</div>
                <div>Password: {pw}</div>
              </div>
              <button type="button" onClick={() => setForm({ username, password: pw })} className="shrink-0 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:border-saffron">Fill in</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
