import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createUserAccount, listUserAccounts, resetUserPassword } from "@/lib/users.functions";

type U = { id: string; username: string | null; full_name: string; phone: string; created_at: string; isAdmin: boolean };

export function Users() {
  const [rows, setRows] = useState<U[]>([]);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ username: "", password: "", full_name: "", phone: "", admin: false });
  const load = useCallback(() => { listUserAccounts().then((r) => setRows(r as U[])).catch((e) => toast.error(e.message)); }, []);
  useEffect(load, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createUserAccount({ data: f });
      toast.success(`Account "${f.username.toLowerCase()}" created`);
      setF({ username: "", password: "", full_name: "", phone: "", admin: false });
      load();
    } catch (err: any) { toast.error(err.message); }
    setBusy(false);
  };

  const reset = async (u: U) => {
    const password = window.prompt(`New password for ${u.username ?? u.full_name} (min 6 characters)`);
    if (!password) return;
    try { await resetUserPassword({ data: { id: u.id, password } }); toast.success("Password changed"); }
    catch (err: any) { toast.error(err.message); }
  };

  const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={create} className="space-y-3 rounded-md border p-5">
        <h2 className="text-lg font-semibold">Create user account</h2>
        <input required placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} className={input} maxLength={30} />
        <input required placeholder="Password (min 6)" minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={input} />
        <input placeholder="Full name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} className={input} maxLength={100} />
        <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} maxLength={20} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.admin} onChange={(e) => setF({ ...f, admin: e.target.checked })} /> Make this an admin</label>
        <button disabled={busy} className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-ember disabled:opacity-60">Create account</button>
        <p className="text-xs text-muted-foreground">Usernames: 3–30 letters, numbers, dot, dash or underscore. Give the username and password to the member.</p>
      </form>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-cream text-xs text-muted-foreground"><tr><th className="p-3">Username</th><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Role</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{u.username ?? "—"}</td>
                <td className="p-3">{u.full_name || "—"}</td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3">{u.isAdmin ? "Admin" : "Member"}</td>
                <td className="p-3 text-right"><button onClick={() => reset(u)} className="rounded-md border px-3 py-1 text-xs hover:border-saffron">Reset password</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
