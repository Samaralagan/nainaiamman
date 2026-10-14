import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/username";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
  if (!data?.length) throw new Error("Admins only");
}

export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      username: z.string().refine(isValidUsername, "Username: 3-30 letters, numbers, . _ -"),
      password: z.string().min(6).max(72),
      full_name: z.string().max(100).default(""),
      phone: z.string().max(20).default(""),
      admin: z.boolean().default(false),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const username = normalizeUsername(data.username);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: usernameToEmail(username),
      password: data.password,
      email_confirm: true,
      user_metadata: { username, full_name: data.full_name, phone: data.phone },
    });
    if (error) throw new Error(error.message.includes("already") ? "That username is taken" : error.message);
    if (data.admin) await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    return { id: created.user.id, username };
  });

export const listUserAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("id, username, full_name, phone, created_at").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    const admins = new Set((roles ?? []).map((r: any) => r.user_id));
    return (profiles ?? []).map((p: any) => ({ ...p, isAdmin: admins.has(p.id) }));
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), password: z.string().min(6).max(72) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
