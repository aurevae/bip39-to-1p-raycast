import {
  Action,
  ActionPanel,
  Detail,
  Form,
  getPreferenceValues,
  Icon,
  open,
  openExtensionPreferences,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";

import {
  getCliPath,
  isSignedIn,
  listVaults,
  saveWallet,
  signIn,
} from "./one-password";
import type { SavedItem, Vault, WalletResult } from "./types";
import { buildWalletResult, generateMnemonic } from "./wallet";

interface FormValues {
  title: string;
  vaultId: string;
  confirm: boolean;
}

interface Preferences {
  wordCount?: "12" | "24";
}

function ResultView({
  result,
  saved,
}: {
  result: WalletResult;
  saved: SavedItem;
}) {
  const markdown = `# Saved to 1Password

The recovery phrase is concealed in **${saved.title}** in the **${saved.vault}** vault.

## Public addresses

| Chain | Address | Derivation path |
| --- | --- | --- |
| EVM | \`${result.chains.evm.address}\` | \`${result.chains.evm.path}\` |
| BTC | \`${result.chains.btc.address}\` | \`${result.chains.btc.path}\` |
| SOL | \`${result.chains.sol.address}\` | \`${result.chains.sol.path}\` |

The recovery phrase is intentionally not displayed or copied to the clipboard.`;

  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.Open
            title="Open in 1Password"
            target={`onepassword://view-item/?i=${saved.id}`}
          />
        </ActionPanel>
      }
      markdown={markdown}
    />
  );
}

export default function Command() {
  const { push } = useNavigation();
  const wordCount = getPreferenceValues<Preferences>().wordCount ?? "12";
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setupError, setSetupError] = useState<string>();

  async function loadVaults() {
    setIsLoading(true);
    setSetupError(undefined);
    try {
      getCliPath();
      if (!(await isSignedIn())) {
        await signIn();
      }
      setVaults(await listVaults());
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadVaults();
  }, []);

  async function submit(values: FormValues) {
    if (!values.confirm) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Confirm that you understand the recovery risk",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking 1Password…",
    });
    try {
      if (!(await isSignedIn()))
        throw new Error(
          "1Password authorization expired. Reload and authenticate again.",
        );
      toast.title = "Generating wallet locally…";
      const result = buildWalletResult(
        generateMnemonic(Number(wordCount) as 12 | 24),
      );
      toast.title = "Saving recovery phrase to 1Password…";
      const saved = await saveWallet(
        result,
        values.title.trim(),
        values.vaultId,
      );
      toast.style = Toast.Style.Success;
      toast.title = "Wallet saved to 1Password";
      push(<ResultView result={result} saved={saved} />);
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Wallet was not saved";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  if (setupError) {
    const cliMissing =
      setupError.includes("CLI") || setupError.includes("not found");
    return (
      <Detail
        actions={
          <ActionPanel>
            <Action icon={Icon.Repeat} onAction={loadVaults} title="Retry" />
            {cliMissing ? (
              <Action
                icon={Icon.Gear}
                onAction={openExtensionPreferences}
                title="Open Extension Preferences"
              />
            ) : (
              <Action
                icon={Icon.Gear}
                onAction={() => open("onepassword://settings")}
                title="Open 1Password Settings"
              />
            )}
          </ActionPanel>
        }
        markdown={`# 1Password setup required

${setupError}

Install the 1Password CLI and enable **1Password → Settings → Developer → Connect with 1Password CLI**, then retry.`}
      />
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            icon={Icon.Wallet}
            onSubmit={submit}
            title="Generate and Save to 1Password"
          />
        </ActionPanel>
      }
      isLoading={isLoading}
    >
      <Form.Description text="The recovery phrase is generated locally and saved directly to 1Password. It is never displayed in Raycast." />
      <Form.TextField
        defaultValue="My Wallet Seed v1"
        id="title"
        placeholder="My Wallet Seed v1"
        title="Item Title"
      />
      <Form.Dropdown id="vaultId" title="1Password Vault">
        {vaults.map((vault) => (
          <Form.Dropdown.Item
            key={vault.id}
            title={vault.name}
            value={vault.id}
          />
        ))}
      </Form.Dropdown>
      <Form.Separator />
      <Form.Checkbox
        id="confirm"
        label="I understand that anyone with this recovery phrase can control the wallet"
        title="Security Confirmation"
      />
    </Form>
  );
}
