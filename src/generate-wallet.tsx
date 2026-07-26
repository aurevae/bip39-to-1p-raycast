import {
  Action,
  ActionPanel,
  Detail,
  environment,
  getPreferenceValues,
  Icon,
  Keyboard,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";

import { phraseCardDataUri } from "./phrase-card";
import type { WalletResult } from "./types";
import { buildWalletResult, generateMnemonic } from "./wallet";

interface Preferences {
  wordCount?: "12" | "24";
}

function buildMarkdown(result: WalletResult, revealed: boolean): string {
  const card = phraseCardDataUri(
    result.mnemonic.split(" "),
    revealed,
    environment.appearance,
  );
  const hint = revealed
    ? "_Never share these words. Press **⌘S** to hide them again._"
    : "_The recovery phrase is hidden. Press **⌘S** to reveal it._";

  return `# Recovery Phrase

![Recovery phrase](${card})

${hint}

### BTC \`${result.chains.btc.address}\`

### ETH \`${result.chains.evm.address}\`

### SOL \`${result.chains.sol.address}\``;
}

export default function Command() {
  const wordCount = getPreferenceValues<Preferences>().wordCount ?? "12";
  const [result, setResult] = useState<WalletResult>();
  const [revealed, setRevealed] = useState(false);

  function generateWallet(): WalletResult {
    const wallet = buildWalletResult(
      generateMnemonic(Number(wordCount) as 12 | 24),
    );
    setRevealed(false);
    setResult(wallet);
    return wallet;
  }

  async function regenerateWallet() {
    const wallet = generateWallet();
    await showToast({
      message: `EVM ${wallet.chains.evm.address.slice(0, 12)}…`,
      style: Toast.Style.Success,
      title: "New wallet generated",
    });
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
                concealed
                content={result.mnemonic}
                shortcut={{ modifiers: ["cmd", "shift"], key: "m" }}
                title="Copy Recovery Phrase"
              />
              <Action
                icon={Icon.ArrowClockwise}
                onAction={regenerateWallet}
                shortcut={Keyboard.Shortcut.Common.Refresh}
                title="Generate New Wallet"
              />
            </ActionPanel.Section>
            <ActionPanel.Section title="Public Addresses">
              <Action.CopyToClipboard
                content={result.chains.btc.address}
                shortcut={{ modifiers: ["cmd", "shift"], key: "b" }}
                title="Copy BTC Address"
              />
              <Action.CopyToClipboard
                content={result.chains.evm.address}
                shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
                title="Copy ETH Address"
              />
              <Action.CopyToClipboard
                content={result.chains.sol.address}
                shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
                title="Copy SOL Address"
              />
            </ActionPanel.Section>
            <ActionPanel.Section>
              <Action
                icon={revealed ? Icon.EyeDisabled : Icon.Eye}
                onAction={() => setRevealed((current) => !current)}
                shortcut={Keyboard.Shortcut.Common.Save}
                title={
                  revealed ? "Hide Recovery Phrase" : "Reveal Recovery Phrase"
                }
              />
            </ActionPanel.Section>
          </ActionPanel>
        ) : undefined
      }
      isLoading={!result}
      markdown={result ? buildMarkdown(result, revealed) : ""}
    />
  );
}
