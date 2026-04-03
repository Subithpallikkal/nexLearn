/** Pad integers for exam UI (e.g. 003) */
export function pad3(n: number) {
  return String(n).padStart(3, "0");
}

/** API total_time: minutes if ≤300 else seconds bucket */
export function displayTotalTime(totalTime: number) {
  const minutes = totalTime > 300 ? Math.floor(totalTime / 60) : totalTime;
  return `${String(minutes).padStart(2, "0")}:00`;
}

export function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Inner HTML of one <li> → plain text (nested tags removed). */
function listItemInnerToText(inner: string): string {
  return inner
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** API may return instructions as HTML (`<ol><li>…</li></ol>`). */
function instructionLinesFromHtml(html: string): string[] {
  const lines: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const t = listItemInnerToText(m[1]);
    if (t) lines.push(t);
  }
  return lines;
}

function looksLikeInstructionHtml(s: string): boolean {
  return /<\s*li[\s/>]/i.test(s);
}

/** Other HTML blocks without <li> (e.g. <p>) — strip tags and split on newlines. */
function instructionLinesFromTaggedPlain(html: string): string[] {
  const plain = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ol|ul|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
  const lines = plain.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines;
}

export function parseInstructionLines(text: string): string[] {
  if (!text?.trim()) return [];
  const trimmed = text.trim();

  if (looksLikeInstructionHtml(trimmed)) {
    const fromLi = instructionLinesFromHtml(trimmed);
    if (fromLi.length > 0) return fromLi;
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    const fromTags = instructionLinesFromTaggedPlain(trimmed);
    if (fromTags.length > 0) return fromTags;
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const numbered = trimmed
    .split(/(?=\d+\.\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return numbered.length > 1 ? numbered : [trimmed];
}
