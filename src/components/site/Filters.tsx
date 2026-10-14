import { useI18n } from "@/lib/i18n";
import { allAreas, allCastes } from "@/lib/profiles";

export type FilterState = { gender: string; area: string; caste: string; yFrom: string; yTo: string };
export const emptyFilters: FilterState = { gender: "", area: "", caste: "", yFrom: "", yTo: "" };
const years = Array.from({ length: 25 }, (_, i) => String(1980 + i));

const sel = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function Filters({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  const { t } = useI18n();
  const set = (k: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <label className="text-xs text-muted-foreground">{t("gender")}
        <select className={sel} value={value.gender} onChange={set("gender")}>
          <option value="">{t("any")}</option>
          <option value="bride">{t("bride")}</option>
          <option value="groom">{t("groom")}</option>
        </select>
      </label>
      <label className="text-xs text-muted-foreground">{t("area")}
        <select className={sel} value={value.area} onChange={set("area")}>
          <option value="">{t("any")}</option>
          {allAreas.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">{t("caste")}
        <select className={sel} value={value.caste} onChange={set("caste")}>
          <option value="">{t("any")}</option>
          {allCastes.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">{t("birthYear")} · {t("from")}
        <select className={sel} value={value.yFrom} onChange={set("yFrom")}>
          <option value="">{t("any")}</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">{t("birthYear")} · {t("to")}
        <select className={sel} value={value.yTo} onChange={set("yTo")}>
          <option value="">{t("any")}</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </label>
    </div>
  );
}
