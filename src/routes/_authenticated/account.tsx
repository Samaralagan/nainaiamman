import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Jaffna Tamil Matrimony" },
      { name: "description", content: "Your shortlisted profiles, photo and contact requests." },
      { property: "og:title", content: "My Account — Jaffna Tamil Matrimony" },
      { property: "og:description", content: "Manage your shortlist and requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

type Row = { code: string; gender: string; area: string; occupation: string };
type Req = { id: string; member_code: string; kind: string; status: string; created_at: string };

const badge: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function Account() {
  const { user, isAdmin } = useAuth();
  const [saved, setSaved] = useState<Row[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const load = async () => {
    if (!user) return;
    const { data: likes } = await supabase.from("likes").select("member_code").eq("user_id", user.id);
    const codes = (likes ?? []).map((l) => l.member_code);
    if (codes.length) {
      const { data } = await supabase.from("members").select("code,gender,area,occupation").in("code", codes);
      setSaved((data ?? []) as Row[]);
    } else setSaved([]);
    const { data: r } = await supabase.from("requests").select("id,member_code,kind,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setReqs((r ?? []) as Req[]);
    const { data: p } = await supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle();
    setName(p?.full_name ?? ""); setPhone(p?.phone ?? "");
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const remove = async (code: string) => {
    if (!user) return;
    await supabase.from("likes").delete().eq("user_id", user.id).eq("member_code", code);
    setSaved((s) => s.filter((x) => x.code !== code));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name.trim().slice(0, 100), phone: phone.trim().slice(0, 20) }).eq("id", user.id);
    if (error) toast.error("Could not save"); else toast.success("Details saved");
  };

  const input = "w-full rounded-md border bg-background px-3 py-2.5 text-sm";
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">My Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        {isAdmin && <Link to="/admin" className="rounded-md border px-4 py-2 text-sm font-medium hover:border-saffron">Go to admin panel</Link>}
      </div>
      <div className="kolam-rule mt-3 w-20" />

      <section className="mt-10">
        <h2 className="text-xl">Shortlisted profiles ({saved.length})</h2>
        {saved.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing shortlisted yet. <Link to="/search" className="text-ember hover:underline">Search profiles</Link></p>
        ) : (
          <ul className="mt-3 divide-y rounded-md border">
            {saved.map((m) => (
              <li key={m.code} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <Link to="/profile/$id" params={{ id: m.code }} className="font-semibold text-ember hover:underline">{m.code}</Link>
                  <span className="ml-3 text-muted-foreground capitalize">{m.gender} · {m.area} · {m.occupation}</span>
                </div>
                <button onClick={() => remove(m.code)} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl">My requests ({reqs.length})</h2>
        {reqs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You have not requested any photos or contact details.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-md border">
            {reqs.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <Link to="/profile/$id" params={{ id: r.member_code }} className="font-semibold text-ember hover:underline">{r.member_code}</Link>
                  <span className="ml-3 capitalize text-muted-foreground">{r.kind} request · {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${badge[r.status] ?? ""}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 max-w-md">
        <h2 className="text-xl">My details</h2>
        <form onSubmit={saveProfile} className="mt-3 space-y-3">
          <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <input className={input} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
          <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-ember">Save</button>
        </form>
      </section>
    </div>
  );
}
