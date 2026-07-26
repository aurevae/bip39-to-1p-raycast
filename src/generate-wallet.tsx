import {
  Action,
  ActionPanel,
  Detail,
  getPreferenceValues,
  Icon,
  Keyboard,
} from "@raycast/api";
import { useEffect, useState } from "react";

import type { WalletResult } from "./types";
import { buildWalletResult, generateMnemonic } from "./wallet";

interface Preferences {
  wordCount?: "12" | "24";
}

function buildMarkdown(result: WalletResult): string {
  const words = result.mnemonic.split(" ");
  const wordRows = Array.from(
    { length: Math.ceil(words.length / 4) },
    (_, row) =>
      words
        .slice(row * 4, row * 4 + 4)
        .map((word, column) => {
          const index = row * 4 + column + 1;
          return `${String(index).padStart(2, "0")}. ${word}`.padEnd(13);
        })
        .join(""),
  ).join("\n");

  return `# Wallet Ready

**${words.length}-word BIP39 recovery phrase**

\`\`\`text
${wordRows}
\`\`\`

---

## Public addresses

### ◆ Ethereum

\`${result.chains.evm.address}\`

Derivation path · \`${result.chains.evm.path}\`

---

### ₿ Bitcoin

\`${result.chains.btc.address}\`

Native SegWit · \`${result.chains.btc.path}\`

---

### ◎ Solana

\`${result.chains.sol.address}\`

Derivation path · \`${result.chains.sol.path}\``;
}

export default function Command() {
  const wordCount = getPreferenceValues<Preferences>().wordCount ?? "12";
  const [result, setResult] = useState<WalletResult>();

  function generateWallet() {
    setResult(
      buildWalletResult(generateMnemonic(Number(wordCount) as 12 | 24)),
    );
  }

  useEffect(() => {
    generateWallet();
  }, [wordCount]);

  return (
    <Detail
      actions={
        result ? (
          <ActionPanel>
            <ActionPanel.Section title="Wallet">
              <Action.CopyToClipboard
                content={result.mnemonic}
                shortcut={{ modifiers: ["cmd", "shift"], key: "m" }}
                title="Copy Recovery Phrase"
              />
              <Action
                icon={Icon.ArrowClockwise}
                onAction={generateWallet}
                shortcut={Keyboard.Shortcut.Common.Refresh}
                title="Generate New Wallet"
              />
            </ActionPanel.Section>
            <ActionPanel.Section title="Public Addresses">
              <Action.CopyToClipboard
                content={result.chains.evm.address}
                shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
                title="Copy ETH Address"
              />
              <Action.CopyToClipboard
                content={result.chains.btc.address}
                shortcut={{ modifiers: ["cmd", "shift"], key: "b" }}
                title="Copy BTC Address"
              />
              <Action.CopyToClipboard
                content={result.chains.sol.address}
                shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
                title="Copy SOL Address"
              />
            </ActionPanel.Section>
          </ActionPanel>
        ) : undefined
      }
      isLoading={!result}
      markdown={result ? buildMarkdown(result) : ""}
    />
  );
}
