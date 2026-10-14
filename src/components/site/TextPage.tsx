import type { ReactNode } from "react";

export function TextPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl">{title}</h1>
      <div className="kolam-rule mt-4 w-20" />
      <div className="mt-8 space-y-4 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
