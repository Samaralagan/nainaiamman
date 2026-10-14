import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { YathakamChart } from "@/components/site/Yathakam";
import { Users } from "@/components/site/AdminUsers";
import { TamilTyping } from "@/components/site/TamilTyping";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Jaffna Tamil Matrimony" },
      { name: "description", content: "Manage member profiles and photo or contact requests." },
      { property: "og:title", content: "Admin Panel — Jaffna Tamil Matrimony" },
      { property: "og:description", content: "Centre staff tools for managing profiles and requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

type M = {
  code: string; gender: string; birth_date: string; birth_time: string; area: string; caste: string;
  education: string; occupation: string; height_cm: number; star: string; sevvai: string; paavam: string;
  marital_status: string; expectations: string; address: string; chart: Record<string, string>; amsam_chart: Record<string, string>; is_published: boolean;
};
type Req = { id: string; user_id: string; member_code: string; kind: string; status: string; created_at: string };

const empty = (code: string): M => ({
  code, gender: "bride", birth_date: "", birth_time: "", area: "", caste: "", education: "", occupation: "",
  height_cm: 160, star: "", sevvai: "", paavam: "", marital_status: "Never married", expectations: "", address: "", chart: {}, amsam_chart: {}, is_published: true,
});

function Admin() {
  const { isAdmin, roleReady } = useAuth();
  const [tab, setTab] = useState<"requests" | "members" | "users">("requests");
  if (!roleReady) return <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">This area is for centre staff.</p>
        <Link to="/account" className="mt-6 inline-block text-ember hover:underline">Go to my account</Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl">Admin Panel</h1>
      <div className="kolam-rule mt-3 w-20" />
      <div className="mt-6 flex gap-1 border-b">
        {(["requests", "members", "users"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize ${tab === k ? "border-saffron text-foreground" : "border-transparent text-muted-foreground"}`}>
            {k === "requests" ? "Requests" : k === "members" ? "Member profiles" : "User accounts"}
          </button>
        ))}
      </div>
      {tab === "requests" ? <Requests /> : tab === "members" ? <Members /> : <Users />}
    </div>
  );
}

function Requests() {
  const [rows, setRows] = useState<(Req & { name: string; phone: string })[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const load = useCallback(async () => {
    const { data } = await supabase.from("requests").select("id,user_id,member_code,kind,status,created_at").order("created_at", { ascending: false });
    const list = (data ?? []) as Req[];
    const ids = [...new Set(list.map((r) => r.user_id))];
    const { data: ps } = ids.length ? await supabase.from("profiles").select("id,full_name,phone").in("id", ids) : { data: [] };
    const map = new Map((ps ?? []).map((p) => [p.id, p]));
    setRows(list.map((r) => ({ ...r, name: map.get(r.user_id)?.full_name ?? "—", phone: map.get(r.user_id)?.phone ?? "" })));
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("requests").update({ status }).eq("id", id);
    if (error) { toast.error("Could not update request"); return; }
    toast.success(`Request ${status}`);
    load();
  };
  const shown = rows.filter((r) => filter === "all" || r.status === "pending");
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Photo and contact requests</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "pending" | "all")} className="rounded-md border bg-background px-2 py-1.5 text-sm">
          <option value="pending">Pending only</option>
          <option value="all">All</option>
        </select>
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No requests to show.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-xs text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Requested by</th><th className="p-3">Profile</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y">
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3">{r.name}<div className="text-xs text-muted-foreground">{r.phone}</div></td>
                  <td className="p-3"><Link to="/profile/$id" params={{ id: r.member_code }} className="font-semibold text-ember hover:underline">{r.member_code}</Link></td>
                  <td className="p-3 capitalize">{r.kind}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3 whitespace-nowrap text-right">
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => set(r.id, "approved")} className="mr-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-ember">Approve</button>
                        <button onClick={() => set(r.id, "rejected")} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:border-saffron">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Members() {
  const [rows, setRows] = useState<M[]>([]);
  const [editing, setEditing] = useState<{ m: M; isNew: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from("members").select("*").order("code", { ascending: true });
    setRows((data ?? []) as unknown as M[]);
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  const nextCode = () => {
    const max = rows.reduce((a, r) => Math.max(a, parseInt(r.code.replace(/\D/g, ""), 10) || 0), 1000);
    return `JTM${max + 1}`;
  };
  const toggle = async (m: M) => {
    const { error } = await supabase.from("members").update({ is_published: !m.is_published }).eq("code", m.code);
    if (error) { toast.error("Could not update"); return; }
    load();
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Member profiles ({rows.length})</h2>
        <button disabled={!loaded} onClick={() => setEditing({ m: empty(nextCode()), isNew: true })} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-ember disabled:opacity-50">Add profile</button>
      </div>
      {editing && <MemberForm key={editing.m.code} init={editing.m} isNew={editing.isNew} onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />}
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted-foreground">
            <tr><th className="p-3">ID</th><th className="p-3">Gender</th><th className="p-3">Born</th><th className="p-3">Area</th><th className="p-3">Occupation</th><th className="p-3">Visible</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((m) => (
              <tr key={m.code}>
                <td className="p-3 font-semibold text-ember">{m.code}</td>
                <td className="p-3 capitalize">{m.gender}</td>
                <td className="p-3 whitespace-nowrap">{m.birth_date}</td>
                <td className="p-3">{m.area}</td>
                <td className="p-3">{m.occupation}</td>
                <td className="p-3">
                  <button onClick={() => toggle(m)} className={`rounded px-2 py-0.5 text-xs font-medium ${m.is_published ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>{m.is_published ? "Published" : "Hidden"}</button>
                </td>
                <td className="p-3 text-right"><button onClick={() => setEditing({ m, isNew: false })} className="text-xs font-medium text-ember hover:underline">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MemberForm({ init, isNew, onDone, onCancel }: { init: M; isNew: boolean; onDone: () => void; onCancel: () => void }) {
  const [m, setM] = useState<M>(init);
  const [busy, setBusy] = useState(false);
  const f = (k: keyof M) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setM({ ...m, [k]: e.target.value });
  const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const label = "block text-xs text-muted-foreground mb-1";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const clean = (c: Record<string, string>) => {
      const o: Record<string, string> = {};
      Object.entries(c).forEach(([k, v]) => { if (v.trim()) o[k] = v.trim(); });
      return o;
    };
    const row = { ...m, chart: clean(m.chart), amsam_chart: clean(m.amsam_chart), height_cm: Number(m.height_cm) || 0 };
    const { error } = isNew
      ? await supabase.from("members").insert(row)
      : await supabase.from("members").update(row).eq("code", m.code);
    setBusy(false);
    if (error) { toast.error("Could not save profile"); return; }
    toast.success(isNew ? `${m.code} added` : `${m.code} updated`);
    onDone();
  };

  const text = (k: keyof M, name: string, type = "text") => (
    <div><label className={label}>{name}</label><input className={input} type={type} value={String(m[k])} onChange={f(k)} maxLength={120} required={k === "birth_date"} data-notamil={k === "birth_time" ? "1" : undefined} /></div>
  );
  return (
    <form onSubmit={save} className="mt-4 space-y-4 rounded-md border bg-cream p-4">
      <h3 className="text-lg">{isNew ? "New profile" : "Edit profile"} {m.code}</h3>
      <TamilTyping>
      <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div><label className={label}>Gender</label><select className={input} value={m.gender} onChange={f("gender")}><option value="bride">Bride</option><option value="groom">Groom</option></select></div>
        {text("birth_date", "Date of birth", "date")}
        {text("birth_time", "Time of birth")}
        {text("area", "Area")}
        {text("caste", "Caste")}
        {text("education", "Education")}
        {text("occupation", "Occupation")}
        {text("height_cm", "Height (cm)", "number")}
        {text("star", "Star (நட்சத்திரம்)")}
        {text("sevvai", "Sevvai (செவ்வாய்)")}
        {text("paavam", "Paavam")}
        {text("marital_status", "Marital status")}
      </div>
      {text("address", "Address")}
      <div><label className={label}>Expectations</label><textarea className={input} rows={2} maxLength={500} value={m.expectations} onChange={f("expectations")} /></div>
      <div>
        <div className={label}>Yathakam</div>
        <div className="grid gap-6 md:grid-cols-2">
          <YathakamChart chart={m.chart} label="கிரகநிலை" onChange={(c) => setM({ ...m, chart: c as Record<string, string> })} />
          <YathakamChart chart={m.amsam_chart} label="நவாம்சநிலை" onChange={(c) => setM({ ...m, amsam_chart: c as Record<string, string> })} />
        </div>
      </div>
      </div>
      </TamilTyping>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={m.is_published} onChange={(e) => setM({ ...m, is_published: e.target.checked })} /> Show on the public site</label>
      <div className="flex gap-2">
        <button disabled={busy} className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-ember disabled:opacity-60">Save</button>
        <button type="button" onClick={onCancel} className="rounded-md border px-5 py-2 text-sm font-medium">Cancel</button>
      </div>
    </form>
  );
}
