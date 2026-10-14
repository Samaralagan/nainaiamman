import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

// Shortlist and photo/contact requests, stored on the signed-in member's account.
type Kind = "photo" | "contact";
const Ctx = createContext<{
  isLiked: (id: string) => boolean;
  toggle: (id: string) => void;
  hasRequested: (id: string, kind: Kind) => boolean;
  request: (id: string, kind: Kind) => void;
}>({ isLiked: () => false, toggle: () => {}, hasRequested: () => false, request: () => {} });

export function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [ids, setIds] = useState<string[]>([]);
  const [reqs, setReqs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setIds([]); setReqs([]); return; }
    supabase.from("likes").select("member_code").then(({ data }) => setIds((data ?? []).map((r) => r.member_code)));
    supabase.from("requests").select("member_code,kind").eq("user_id", user.id).then(({ data }) => setReqs((data ?? []).map((r) => `${r.member_code}:${r.kind}`)));
  }, [user]);

  const needLogin = () => { toast("Please log in to continue"); nav({ to: "/auth" }); };

  const toggle = async (id: string) => {
    if (!user) return needLogin();
    const liked = ids.includes(id);
    setIds((c) => (liked ? c.filter((x) => x !== id) : [...c, id]));
    const { error } = liked
      ? await supabase.from("likes").delete().eq("user_id", user.id).eq("member_code", id)
      : await supabase.from("likes").insert({ user_id: user.id, member_code: id });
    if (error) { toast.error("Could not update shortlist"); setIds((c) => (liked ? [...c, id] : c.filter((x) => x !== id))); return; }
    toast.success(liked ? `${id} removed from shortlist` : `${id} added to shortlist`);
  };

  const request = async (id: string, kind: Kind) => {
    if (!user) return needLogin();
    if (reqs.includes(`${id}:${kind}`)) return;
    const { error } = await supabase.from("requests").insert({ user_id: user.id, member_code: id, kind });
    if (error) { toast.error("Could not send request"); return; }
    setReqs((c) => [...c, `${id}:${kind}`]);
    toast.success("Request sent. The centre will review it.");
  };

  return (
    <Ctx.Provider value={{ isLiked: (id) => ids.includes(id), toggle, hasRequested: (id, k) => reqs.includes(`${id}:${k}`), request }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLikes = () => useContext(Ctx);
