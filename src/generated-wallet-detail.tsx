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
import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";

import { addressCardDataUri, phraseCardDataUri } from "./phrase-card";
import type { WalletResult } from "./types";
import { buildWalletResult, generateMnemonic } from "./wallet";

interface GeneratedWalletDetailProps {
  onRecoveryPhraseAction: (result: WalletResult) => ReactElement;
  revealRecoveryPhraseAsPrimary?: boolean;
}

function buildMarkdown(result: WalletResult, revealed: boolean): string {
  const phrase = phraseCardDataUri(
    result.mnemonic.split(" "),
    revealed,
    environment.appearance,
  );
  const addresses = addressCardDataUri(result.chains, environment.appearance);
  const hint = revealed
    ? "_Anyone with these words controls the wallet. Press **⌘S** to hide._"
    : "_Hidden for safety. Press **⌘S** to reveal._";

  return `![Recovery phrase](${phrase})

${hint}

![Public addresses](${addresses})`;
}

export function GeneratedWalletDetail({
  onRecoveryPhraseAction,
  revealRecoveryPhraseAsPrimary = false,
}: GeneratedWalletDetailProps) {
  const wordCount =
    getPreferenceValues<ExtensionPreferences>().wordCount ?? "12";
  const [result, setResult] = useState<WalletResult>();
  const [revealed, setRevealed] = useState(false);

  const generateWallet = useCallback((): WalletResult => {
    const wallet = buildWalletResult(
      generateMnemonic(Number(wordCount) as 12 | 24),
    );
    setRevealed(false);
    setResult(wallet);
    return wallet;
  }, [wordCount]);

  const regenerateWallet = useCallback(async () => {
    const wallet = generateWallet();
    await showToast({
      message: `EVM ${wallet.chains.evm.address.slice(0, 12)}…`,
      style: Toast.Style.Success,
      title: "New wallet generated",
    });
  }, [generateWallet]);

  useEffect(() => {
    generateWallet();
  }, [generateWallet]);

  const revealRecoveryPhraseAction = (
    <Action
      icon={revealed ? Icon.EyeDisabled : Icon.Eye}
      onAction={() => setRevealed((current) => !current)}
      shortcut={Keyboard.Shortcut.Common.Save}
      title={revealed ? "Hide Recovery Phrase" : "Reveal Recovery Phrase"}
    />
  );

  return (
    <Detail
      actions={
        result ? (
          <ActionPanel>
            <ActionPanel.Section title="Wallet">
              {revealRecoveryPhraseAsPrimary
                ? revealRecoveryPhraseAction
                : null}
              {!revealRecoveryPhraseAsPrimary
                ? onRecoveryPhraseAction(result)
                : null}
              <Action
                icon={Icon.ArrowClockwise}
                onAction={regenerateWallet}
                shortcut={Keyboard.Shortcut.Common.Refresh}
                title="Generate New Wallet"
              />
              {revealRecoveryPhraseAsPrimary
                ? onRecoveryPhraseAction(result)
                : null}
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
            {!revealRecoveryPhraseAsPrimary ? (
              <ActionPanel.Section>
                {revealRecoveryPhraseAction}
              </ActionPanel.Section>
            ) : null}
          </ActionPanel>
        ) : undefined
      }
      isLoading={!result}
      markdown={result ? buildMarkdown(result, revealed) : ""}
    />
  );
}
