// Traditional South Indian square charts: 12 outer cells around a 2x2 centre.
export const rasi = ["மீனம்", "மேடம்", "இடபம்", "மிதுனம்", "கடகம்", "சிங்கம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனு", "மகரம்", "கும்பம்"];
// grid positions [row, col] on a 4x4 grid, clockwise from top-left
const pos: [number, number][] = [
  [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [3, 1], [2, 1],
];

type Chart = Record<number, string>;

// Read-only chart, or an editable one (type planets straight into each box) when onChange is given.
export function YathakamChart({ chart, label, sublabel, onChange }: { chart: Chart; label: string; sublabel?: string; onChange?: (c: Chart) => void }) {
  return (
    <div className="overflow-hidden rounded-sm shadow-md" style={{ border: "2.5px solid #d4700a" }}>
      {/* decorative header strip */}
      <div className="kolam-rule" />
      <div className="mx-auto grid aspect-[4/3] w-full grid-cols-4 grid-rows-4 bg-card">
        {pos.map(([r, c], i) => (
          <div
            key={i}
            style={{ gridRow: r, gridColumn: c, borderColor: "#d4700a", borderWidth: 1 }}
            className="relative flex min-h-0 min-w-0 flex-col border bg-chart-cell p-1 sm:p-2"
          >
            <div className="flex flex-1 items-center justify-center">
              {onChange ? (
                <textarea
                  aria-label={`${label} ${rasi[i]}`}
                  value={chart[i + 1] ?? ""}
                  placeholder={String((i + 4) % 12 + 1)}
                  maxLength={120}
                  onChange={(e) => onChange({ ...chart, [i + 1]: e.target.value })}
                  className="h-full w-full min-w-0 resize-none bg-transparent text-center text-xs font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground focus:bg-amber-50 sm:text-sm"
                  style={{ color: "#3d1f00" }}
                />
              ) : (
                <span
                  className="whitespace-pre-wrap break-words text-center text-xs font-semibold sm:text-sm"
                  style={{ color: chart[i + 1]?.trim() ? "#3d1f00" : "transparent" }}
                >
                  {chart[i + 1]?.trim() || "·"}
                </span>
              )}
            </div>
          </div>
        ))}
        {/* centre cell */}
        <div
          style={{ gridRow: "2 / 4", gridColumn: "2 / 4", borderColor: "#d4700a", borderWidth: 1, background: "linear-gradient(135deg, #fff8ee 0%, #fff3e0 100%)" }}
          className="flex flex-col items-center justify-center border"
        >
          <span className="font-display text-2xl font-bold tracking-wide sm:text-3xl" style={{ color: "#c45000" }}>{label}</span>
          {sublabel && <span className="mt-1 font-sans text-[11px] font-medium tracking-widest uppercase" style={{ color: "#a06030" }}>{sublabel}</span>}
        </div>
      </div>
      <div className="kolam-rule" />
    </div>
  );
}

export function YathakamCharts({ chart, amsam, id }: { chart: Chart; amsam?: Chart | undefined; id?: string }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <YathakamChart chart={chart} label="ராசி" sublabel={id} />
      </div>
      <div>
        <YathakamChart chart={amsam ?? {}} label="அம்சம்" sublabel={id} />
      </div>
    </div>
  );
}
