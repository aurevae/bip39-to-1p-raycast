import { describe, expect, it } from "vitest";

import { buildPhraseCardSvg, phraseCardDataUri } from "../src/phrase-card";

const WORDS =
  "test test test test test test test test test test test junk".split(" ");

describe("phrase card", () => {
  it("never contains the words while hidden", () => {
    const svg = buildPhraseCardSvg(WORDS, false, "dark");
    for (const word of new Set(WORDS)) {
      expect(svg).not.toContain(word);
    }
    expect(svg).toContain("••••••");
  });

  it("keeps the words out of the masked data URI", () => {
    const uri = phraseCardDataUri(WORDS, false, "dark");
    const decoded = Buffer.from(uri.split(",")[1], "base64").toString("utf8");
    for (const word of new Set(WORDS)) {
      expect(decoded).not.toContain(word);
    }
  });

  it("renders every word with its index when revealed", () => {
    const svg = buildPhraseCardSvg(WORDS, true, "light");
    for (const word of new Set(WORDS)) {
      expect(svg).toContain(`>${word}<`);
    }
    expect(svg).toContain(">01<");
    expect(svg).toContain(">12<");
  });

  it("lays out 12 words in 3 rows and 24 words in 6 rows", () => {
    const twentyFour = buildPhraseCardSvg(
      Array.from({ length: 24 }, () => "abandon"),
      true,
      "dark",
    );
    expect(buildPhraseCardSvg(WORDS, true, "dark")).toContain(
      'viewBox="0 0 700 168"',
    );
    expect(twentyFour).toContain('viewBox="0 0 700 312"');
  });
});
