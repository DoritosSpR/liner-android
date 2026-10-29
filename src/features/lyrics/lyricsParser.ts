export interface ParsedLyrics {
  format: "synced" | "unsynced";
  lines: { startMs: number; endMs: number; text: string }[];
  unsyncedText?: string;
}

export function parseRawLyrics(raw: string): ParsedLyrics {
  if (!raw || raw.trim().length === 0) {
    return { format: "unsynced", lines: [], unsyncedText: "" };
  }

  const richsync = tryParseRichsync(raw);
  if (richsync) return richsync;

  const mxm = tryParseMxm(raw);
  if (mxm) return mxm;

  const lrc = tryParseLrc(raw);
  if (lrc) return lrc;

  return { format: "unsynced", lines: [], unsyncedText: raw.trim() };
}

function tryParseRichsync(raw: string): ParsedLyrics | null {
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.lines)) return null;
    return {
      format: "synced",
      lines: data.lines.map((line: any) => ({
        startMs: line.startMs ?? 0,
        endMs: line.endMs ?? 0,
        text: line.text ?? "",
      })),
    };
  } catch {
    return null;
  }
}

function tryParseMxm(raw: string): ParsedLyrics | null {
  const lines: { startMs: number; endMs: number; text: string }[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^(\d{2}):(\d{2})\.(\d{3})\s+(.*)$/);
    if (match) {
      const startMs =
        parseInt(match[1], 10) * 60_000 +
        parseInt(match[2], 10) * 1_000 +
        parseInt(match[3], 10);
      lines.push({ startMs, endMs: startMs + 5000, text: match[4] });
    }
  }
  return lines.length > 0 ? { format: "synced", lines } : null;
}

function tryParseLrc(raw: string): ParsedLyrics | null {
  const lines: { startMs: number; endMs: number; text: string }[] = [];
  const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/;
  for (const line of raw.split("\n")) {
    const match = line.match(lrcRegex);
    if (match) {
      const startMs =
        parseInt(match[1], 10) * 60_000 +
        parseInt(match[2], 10) * 1_000 +
        (match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0);
      lines.push({ startMs, endMs: startMs + 5000, text: match[4] });
    }
  }
  return lines.length > 0 ? { format: "synced", lines } : null;
}

export function applyLyricsOffset(lines: { startMs: number; endMs: number }[], offsetMs: number): { startMs: number; endMs: number }[] {
  return lines.map((line) => ({
    startMs: line.startMs + offsetMs,
    endMs: line.endMs + offsetMs,
  }));
}
