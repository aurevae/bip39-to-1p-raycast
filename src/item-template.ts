import type { WalletResult } from "./types";

export function buildNoteContent(result: WalletResult, title: string): string {
  return [
    title,
    "",
    "Chains:",
    `- EVM address: ${result.chains.evm.address}`,
    `  path: ${result.chains.evm.path}`,
    `- BTC address: ${result.chains.btc.address}`,
    `  type: ${result.chains.btc.type}`,
    `  path: ${result.chains.btc.path}`,
    `- SOL address: ${result.chains.sol.address}`,
    `  path: ${result.chains.sol.path}`,
    "",
    "Notes:",
    ...result.notes,
  ].join("\n");
}

export function buildItemTemplate(result: WalletResult, title: string) {
  const walletSection = { id: "wallet", label: "Wallet" };
  return {
    title,
    category: "CUSTOM",
    category_id: "115",
    sections: [walletSection],
    fields: [
      {
        id: "notesPlain",
        type: "STRING",
        purpose: "NOTES",
        label: "notesPlain",
        value: buildNoteContent(result, title),
      },
      {
        id: "recoveryPhrase",
        type: "CONCEALED",
        label: "recovery phrase",
        value: result.mnemonic,
      },
      { id: "password", type: "CONCEALED", label: "password", value: "" },
      {
        id: "walletAddress",
        section: walletSection,
        type: "STRING",
        label: "wallet address",
        value: result.chains.evm.address,
      },
      {
        id: "btcAddress",
        section: walletSection,
        type: "STRING",
        label: "BTC address",
        value: result.chains.btc.address,
      },
      {
        id: "solAddress",
        section: walletSection,
        type: "STRING",
        label: "SOL address",
        value: result.chains.sol.address,
      },
    ],
  };
}
