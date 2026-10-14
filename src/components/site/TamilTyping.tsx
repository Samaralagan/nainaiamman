import { useRef, useState } from "react";
import { KB_CONS, KB_SIGNS, KB_VOWELS, transliterate } from "@/lib/tamil";

type Field = HTMLInputElement | HTMLTextAreaElement;

const isField = (el: EventTarget | null): el is Field =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && ["text", "search", ""].includes(el.type) && !el.dataset["notamil"]);

// Writes a value so React controlled inputs notice the change.
function setNative(el: Field, value: string, caret: number) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.setSelectionRange(caret, caret);
}

// Converts the English letters just before `caret` into Tamil. Returns the new caret, or null if nothing changed.
function convertBefore(el: Field, caret: number, extra = ""): number | null {
  const before = el.value.slice(0, caret);
  const m = before.match(/[A-Za-z]+$/);
  if (!m) return null;
  const ta = transliterate(m[0]) + extra;
  const next = before.slice(0, m.index) + ta + el.value.slice(caret);
  const pos = (m.index ?? 0) + ta.length;
  setNative(el, next, pos);
  return pos;
}

/**
 * Wrap form fields to type Tamil in them: type English letters (phonetic) and press Space to turn the word
 * into Tamil, or tap letters on the on-screen Tamil keyboard. Ctrl+Space switches Tamil typing on/off.
 */
export function TamilTyping({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(true);
  const [kb, setKb] = useState(false);
  const last = useRef<Field | null>(null);

  const insert = (text: string) => {
    const el = last.current;
    if (!el || !el.isConnected) return;
    el.focus();
    const s = el.selectionStart ?? el.value.length;
    const e = el.selectionEnd ?? s;
    if (el.maxLength > 0 && el.value.length - (e - s) + text.length > el.maxLength) return;
    setNative(el, el.value.slice(0, s) + text + el.value.slice(e), s + text.length);
  };
  const backspace = () => {
    const el = last.current;
    if (!el || !el.isConnected) return;
    el.focus();
    const s = el.selectionStart ?? 0;
    const e = el.selectionEnd ?? s;
    if (e > s) return setNative(el, el.value.slice(0, s) + el.value.slice(e), s);
    if (s === 0) return;
    // delete one whole character (surrogate-safe)
    const chars = Array.from(el.value.slice(0, s));
    chars.pop();
    const head = chars.join("");
    setNative(el, head + el.value.slice(s), head.length);
  };

  const key = (t: string, wide = false) => (
    <button
      key={t}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => insert(t)}
      className={`rounded border bg-card px-2 py-1 text-base hover:bg-gold hover:text-foreground ${wide ? "min-w-16" : "min-w-9"}`}
    >
      {t === "்" || KB_SIGNS.includes(t) ? `◌${t}` : t}
    </button>
  );

  return (
    <div
      onFocus={(e) => { if (isField(e.target)) last.current = e.target; }}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === " ") { e.preventDefault(); setOn((v) => !v); return; }
        if (!on || e.ctrlKey || e.metaKey || e.altKey || e.nativeEvent.isComposing) return;
        const el = e.target;
        if (e.key === " " && isField(el)) {
          const caret = el.selectionStart ?? el.value.length;
          if (convertBefore(el, caret, " ") !== null) e.preventDefault();
        }
      }}
      onBlur={(e) => {
        if (!on || !isField(e.target)) return;
        const el = e.target;
        convertBefore(el, el.value.length);
      }}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm">
        <label className="flex items-center gap-2 font-medium">
          <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
          தமிழ் typing
        </label>
        <button
          type="button"
          onClick={() => setKb((v) => !v)}
          className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gold"
          aria-expanded={kb}
        >
          {kb ? "Hide Tamil keyboard" : "Show Tamil keyboard"}
        </button>
        <span className="text-xs text-muted-foreground">
          {on ? "Type in English letters (e.g. vanakkam) and press Space — it turns into Tamil. Ctrl+Space turns this off." : "Off — typing normally. Ctrl+Space turns it on."}
        </span>
      </div>

      <div className="mt-4">{children}</div>

      {kb && (
        <div className="sticky bottom-0 z-20 mt-3 space-y-2 rounded-md border-2 border-saffron bg-card p-3 shadow-sm" role="group" aria-label="Tamil keyboard">
          <div className="flex flex-wrap gap-1">{KB_VOWELS.map((t) => key(t))}</div>
          <div className="flex flex-wrap gap-1">{KB_CONS.map((t) => key(t))}</div>
          <div className="flex flex-wrap gap-1">
            {KB_SIGNS.map((t) => key(t))}
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(" ")} className="min-w-24 rounded border bg-card px-2 py-1 text-sm hover:bg-gold">Space</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={backspace} className="min-w-16 rounded border bg-card px-2 py-1 text-sm hover:bg-gold">⌫</button>
          </div>
          <p className="text-xs text-muted-foreground">Click a box first, then tap letters. Tap a consonant then a sign (◌ா ◌ி …) to build a syllable.</p>
        </div>
      )}
    </div>
  );
}
