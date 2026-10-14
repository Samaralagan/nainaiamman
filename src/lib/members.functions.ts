import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { Profile } from "@/lib/profiles";

type Row = Database["public"]["Tables"]["members"]["Row"];

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const COLS = "code,gender,birth_date,birth_time,area,caste,education,occupation,height_cm,star,sevvai,paavam,marital_status,expectations,address,chart,amsam_chart,created_at";

const toProfile = (r: Omit<Row, "owner_id" | "is_published">): Profile => ({
  id: r.code,
  gender: r.gender as Profile["gender"],
  birthDate: r.birth_date,
  birthTime: r.birth_time,
  area: r.area,
  caste: r.caste,
  education: r.education,
  occupation: r.occupation,
  heightCm: r.height_cm,
  star: r.star,
  sevvai: r.sevvai,
  paavam: r.paavam,
  maritalStatus: r.marital_status,
  expectations: r.expectations,
  address: r.address,
  chart: (r.chart ?? {}) as Record<number, string>,
  amsam: (r.amsam_chart ?? {}) as Record<number, string>,
  createdAt: r.created_at,
});

export const listMembers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("members").select(COLS).eq("is_published", true).order("created_at", { ascending: false });
  if (error) { console.error(error); return [] as Profile[]; }
  return (data ?? []).map(toProfile);
});

export const getMember = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient().from("members").select(COLS).eq("code", data.id).eq("is_published", true).maybeSingle();
    if (error) console.error(error);
    return row ? toProfile(row) : null;
  });
