import { describe, expect, it } from "vitest";

import { buildItemTemplate } from "../src/item-template";
import { buildWalletResult } from "../src/wallet";

const FIXED_MNEMONIC =
  "test test test test test test test test test test test junk";

describe("1Password template", () => {
  it("stores the recovery phrase in a concealed field", () => {
    const result = buildWalletResult(FIXED_MNEMONIC);
    const template = buildItemTemplate(result, "My Wallet Seed v1");
    const recovery = template.fields.find(
      (field) => field.id === "recoveryPhrase",
    );
    expect(recovery).toMatchObject({
      type: "CONCEALED",
      value: FIXED_MNEMONIC,
    });
  });
});
