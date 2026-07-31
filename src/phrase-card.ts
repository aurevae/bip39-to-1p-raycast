import type { WalletResult } from "./types";

type Appearance = "light" | "dark";

interface Palette {
  cardBg: string;
  cardStroke: string;
  chipBg: string;
  chipStroke: string;
  divider: string;
  heading: string;
  label: string;
  index: string;
  word: string;
  redact: string;
  pillBg: string;
  pillStroke: string;
  pillText: string;
  accent: string;
}

const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
const SANS = "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif";

const PALETTES: Record<Appearance, Palette> = {
  dark: {
    cardBg: "#161619",
    cardStroke: "#2B2B31",
    chipBg: "#1F1F24",
    chipStroke: "#303036",
    divider: "#2B2B31",
    heading: "#F2F2F5",
    label: "#8E8E96",
    index: "#6C6C74",
    word: "#F5F5F7",
    redact: "#3D3D45",
    pillBg: "#1F1F24",
    pillStroke: "#303036",
    pillText: "#9A9AA2",
    accent: "#F0B35C",
  },
  light: {
    cardBg: "#FFFFFF",
    cardStroke: "#E3E3E8",
    chipBg: "#F6F6F8",
    chipStroke: "#E7E7EC",
    divider: "#ECECF0",
    heading: "#1C1C1E",
    label: "#6E6E76",
    index: "#9C9CA4",
    word: "#1C1C1E",
    redact: "#D5D5DB",
    pillBg: "#F6F6F8",
    pillStroke: "#E7E7EC",
    pillText: "#6E6E76",
    accent: "#C77F1F",
  },
};

const WIDTH = 700;
const PAD = 20;
const HEADER_HEIGHT = 56;
const CHIP_HEIGHT = 48;
const CHIP_GAP = 10;
const COLUMNS = 4;

function lockIcon(x: number, y: number, color: string): string {
  return [
    `<rect x="${x}" y="${y + 5}" width="12" height="9" rx="2.5" fill="${color}"/>`,
    `<path d="M ${x + 2.5} ${y + 5} v -2 a 3.5 3.5 0 0 1 7 0 v 2" fill="none" stroke="${color}" stroke-width="1.8"/>`,
  ].join("");
}

function eyeIcon(x: number, y: number, color: string): string {
  return [
    `<path d="M ${x} ${y + 7} q 6 -6.5 12 0 q -6 6.5 -12 0 Z" fill="none" stroke="${color}" stroke-width="1.6"/>`,
    `<circle cx="${x + 6}" cy="${y + 7}" r="2.2" fill="${color}"/>`,
  ].join("");
}

function header(
  palette: Palette,
  title: string,
  pill: string,
  icon: string,
): string {
  const pillWidth = pill.length * 7 + 20;
  const pillX = WIDTH - PAD - pillWidth;
  return [
    icon,
    `<text x="${PAD + 22}" y="35" font-family="${SANS}" font-size="12" font-weight="600" fill="${palette.heading}">${title}</text>`,
    `<rect x="${pillX}" y="18" width="${pillWidth}" height="22" rx="11" fill="${palette.pillBg}" stroke="${palette.pillStroke}"/>`,
    `<text x="${pillX + pillWidth / 2}" y="33" text-anchor="middle" font-family="${SANS}" font-size="10.5" font-weight="600" fill="${palette.pillText}">${pill}</text>`,
    `<line x1="${PAD}" y1="${HEADER_HEIGHT}" x2="${WIDTH - PAD}" y2="${HEADER_HEIGHT}" stroke="${palette.divider}"/>`,
  ].join("");
}

export function buildPhraseCardSvg(
  words: string[],
  revealed: boolean,
  appearance: Appearance,
): string {
  const palette = PALETTES[appearance];
  const rows = Math.ceil(words.length / COLUMNS);
  const chipWidth = (WIDTH - PAD * 2 - CHIP_GAP * (COLUMNS - 1)) / COLUMNS;
  const gridTop = HEADER_HEIGHT + PAD;
  const gridHeight = rows * CHIP_HEIGHT + (rows - 1) * CHIP_GAP;
  const height = gridTop + gridHeight + PAD;

  const chips = words
    .map((word, index) => {
      const x = PAD + (index % COLUMNS) * (chipWidth + CHIP_GAP);
      const y =
        gridTop + Math.floor(index / COLUMNS) * (CHIP_HEIGHT + CHIP_GAP);
      const parts = [
        `<rect x="${x}" y="${y}" width="${chipWidth}" height="${CHIP_HEIGHT}" rx="10" fill="${palette.chipBg}" stroke="${palette.chipStroke}"/>`,
        `<text x="${x + 12}" y="${y + 17}" font-family="${SANS}" font-size="9.5" font-weight="500" fill="${palette.index}">${String(index + 1).padStart(2, "0")}</text>`,
      ];
      if (revealed) {
        parts.push(
          `<text x="${x + chipWidth / 2}" y="${y + 33}" text-anchor="middle" font-family="${MONO}" font-size="14.5" font-weight="600" fill="${palette.word}">${word}</text>`,
        );
      } else {
        parts.push(
          `<rect x="${x + chipWidth / 2 - 27}" y="${y + 26}" width="54" height="7" rx="3.5" fill="${palette.redact}"/>`,
        );
      }
      return parts.join("");
    })
    .join("");

  const icon = revealed
    ? eyeIcon(PAD, 20, palette.accent)
    : lockIcon(PAD, 20, palette.accent);
  const pill = revealed ? "VISIBLE" : "HIDDEN";
  const count = `${words.length} WORDS`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" font-family="${SANS}">`,
    `<rect width="${WIDTH}" height="${height}" rx="16" fill="${palette.cardBg}" stroke="${palette.cardStroke}"/>`,
    header(palette, `Recovery Phrase · ${count}`, pill, icon),
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

interface ChainRow {
  name: string;
  ticker: string;
  color: string;
  detail: string;
  address: string;
}

function chainRows(chains: WalletResult["chains"]): ChainRow[] {
  return [
    {
      name: "Ethereum",
      ticker: "ETH",
      color: "#627EEA",
      detail: chains.evm.path,
      address: chains.evm.address,
    },
    {
      name: "Bitcoin",
      ticker: "BTC",
      color: "#F7931A",
      detail: `${chains.btc.type} · ${chains.btc.path}`,
      address: chains.btc.address,
    },
    {
      name: "Solana",
      ticker: "SOL",
      color: "#9945FF",
      detail: chains.sol.path,
      address: chains.sol.address,
    },
  ];
}

export function buildAddressCardSvg(
  chains: WalletResult["chains"],
  appearance: Appearance,
): string {
  const palette = PALETTES[appearance];
  const rows = chainRows(chains);
  const ROW_HEIGHT = 58;
  const gridTop = HEADER_HEIGHT;
  const height = gridTop + rows.length * ROW_HEIGHT + PAD - 8;

  const body = rows
    .map((row, index) => {
      const y = gridTop + index * ROW_HEIGHT;
      const badgeY = y + (ROW_HEIGHT - 30) / 2;
      const divider =
        index < rows.length - 1
          ? `<line x1="${PAD}" y1="${y + ROW_HEIGHT}" x2="${WIDTH - PAD}" y2="${y + ROW_HEIGHT}" stroke="${palette.divider}"/>`
          : "";
      return [
        `<rect x="${PAD}" y="${badgeY}" width="30" height="30" rx="9" fill="${row.color}"/>`,
        `<text x="${PAD + 15}" y="${badgeY + 19.5}" text-anchor="middle" font-family="${SANS}" font-size="9.5" font-weight="700" fill="#FFFFFF">${row.ticker}</text>`,
        `<text x="${PAD + 42}" y="${y + 26}" font-family="${SANS}" font-size="13" font-weight="600" fill="${palette.heading}">${row.name}</text>`,
        `<text x="${PAD + 42}" y="${y + 44}" font-family="${MONO}" font-size="10.5" fill="${palette.label}">${row.detail}</text>`,
        `<text x="${WIDTH - PAD}" y="${y + 36}" text-anchor="end" font-family="${MONO}" font-size="13.5" fill="${palette.word}">${row.address}</text>`,
        divider,
      ].join("");
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" font-family="${SANS}">`,
    `<rect width="${WIDTH}" height="${height}" rx="16" fill="${palette.cardBg}" stroke="${palette.cardStroke}"/>`,
    `<text x="${PAD}" y="35" font-family="${SANS}" font-size="12" font-weight="600" fill="${palette.heading}">Public Addresses</text>`,
    `<text x="${WIDTH - PAD}" y="35" text-anchor="end" font-family="${SANS}" font-size="10.5" fill="${palette.label}">derived locally</text>`,
    `<line x1="${PAD}" y1="${HEADER_HEIGHT}" x2="${WIDTH - PAD}" y2="${HEADER_HEIGHT}" stroke="${palette.divider}"/>`,
    body,
    `</svg>`,
  ].join("");
}

export function addressCardDataUri(
  chains: WalletResult["chains"],
  appearance: Appearance,
): string {
  const svg = buildAddressCardSvg(chains, appearance);
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
