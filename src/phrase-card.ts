type Appearance = "light" | "dark";

interface Palette {
  cardBg: string;
  chipBg: string;
  chipStroke: string;
  index: string;
  word: string;
  hiddenWord: string;
}

const PALETTES: Record<Appearance, Palette> = {
  dark: {
    cardBg: "#1C1C1E",
    chipBg: "#2C2C2E",
    chipStroke: "#3A3A3C",
    index: "#8E8E93",
    word: "#F2F2F7",
    hiddenWord: "#6C6C70",
  },
  light: {
    cardBg: "#F2F2F7",
    chipBg: "#FFFFFF",
    chipStroke: "#E2E2E7",
    index: "#8E8E93",
    word: "#1C1C1E",
    hiddenWord: "#A0A0A5",
  },
};

const WIDTH = 700;
const PADDING = 16;
const GAP = 8;
const CHIP_HEIGHT = 40;
const COLUMNS = 4;
const RADIUS = 14;
const HIDDEN_LABEL = "••••••";

export function buildPhraseCardSvg(
  words: string[],
  revealed: boolean,
  appearance: Appearance,
): string {
  const palette = PALETTES[appearance];
  const rows = Math.ceil(words.length / COLUMNS);
  const chipWidth = (WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const height = PADDING * 2 + rows * CHIP_HEIGHT + (rows - 1) * GAP;

  const chips = words
    .map((word, index) => {
      const x = PADDING + (index % COLUMNS) * (chipWidth + GAP);
      const y = PADDING + Math.floor(index / COLUMNS) * (CHIP_HEIGHT + GAP);
      return [
        `<rect x="${x}" y="${y}" width="${chipWidth}" height="${CHIP_HEIGHT}" rx="10" fill="${palette.chipBg}" stroke="${palette.chipStroke}"/>`,
        `<text x="${x + 14}" y="${y + 26}" font-size="12" fill="${palette.index}">${String(index + 1).padStart(2, "0")}</text>`,
        `<text x="${x + 42}" y="${y + 26}" font-size="16" font-weight="600" fill="${revealed ? palette.word : palette.hiddenWord}">${revealed ? word : HIDDEN_LABEL}</text>`,
      ].join("");
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" font-family="ui-monospace, 'SF Mono', Menlo, monospace">`,
    `<rect width="${WIDTH}" height="${height}" rx="${RADIUS}" fill="${palette.cardBg}"/>`,
    chips,
    `</svg>`,
  ].join("");
}

export function phraseCardDataUri(
  words: string[],
  revealed: boolean,
  appearance: Appearance,
): string {
  const svg = buildPhraseCardSvg(words, revealed, appearance);
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
