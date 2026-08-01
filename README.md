# BIP39 Wallet Generator for 1Password

Generate a 12- or 24-word BIP39 recovery phrase locally and derive EVM, Bitcoin
Native SegWit, and Solana addresses. Review the wallet on screen, or save it
directly to a 1Password Crypto Wallet item.

In the 1Password flow the recovery phrase starts masked and is never copied to
the clipboard automatically, written to disk, or included in process arguments.
It is sent to `op item create` through stdin and stored in a concealed
1Password field.

## Requirements

- macOS and Raycast
- For **Generate Wallet to 1Password** only:
  - 1Password 8 desktop app
  - 1Password CLI (`op`)
  - **1Password → Settings → Developer → Connect with 1Password CLI** enabled

## Raycast commands

### Generate Wallet

Raycast command: **BIP39 Wallet Generator for 1Password → Generate Wallet**

Generates a wallet locally and displays it. Opening the command immediately
generates the wallet and shows the EVM, Bitcoin Native SegWit, and Solana
addresses with their derivation paths. The recovery phrase is rendered as a
numbered word grid that starts **masked** — press <kbd>Command</kbd> +
<kbd>S</kbd> to reveal or hide it. Copying the phrase uses concealed clipboard
mode, so it is excluded from Raycast's clipboard
history (third-party clipboard managers may still record it unless they honor
the concealed-pasteboard convention). The recovery phrase length is controlled
by extension preferences. This command never invokes the 1Password CLI.

Shortcuts:

| Action                       | Shortcut                                             |
| ---------------------------- | ---------------------------------------------------- |
| Reveal / hide phrase         | <kbd>Command</kbd> + <kbd>S</kbd>                    |
| Copy recovery phrase         | <kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> |
| Copy ETH/EVM address         | <kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> |
| Copy BTC address             | <kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> |
| Copy SOL address             | <kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> |
| Generate new wallet          | <kbd>Command</kbd> + <kbd>R</kbd>                    |

Because this command displays the recovery phrase on screen and allows copying
it to the clipboard, use it only in a private environment and store the phrase
securely yourself. For wallets you plan to keep, prefer **Generate Wallet to
1Password**, which saves the phrase without requiring a clipboard copy.

### Generate Wallet to 1Password

Raycast command: **BIP39 Wallet Generator for 1Password → Generate Wallet to 1Password**

Generates a new wallet locally, lets you review it, and then saves the same
wallet directly to 1Password. The command:

1. Generates a new 12- or 24-word BIP39 recovery phrase.
2. Shows the same masked recovery phrase and public-address preview as
   **Generate Wallet**. You can reveal or hide the phrase, regenerate the
   wallet, and copy public addresses.
3. After **Save to 1Password** is selected, checks that the 1Password CLI is
   installed and authenticated and loads the available vaults.
4. Collects the item title and target vault.
5. Creates a 1Password Crypto Wallet item for the wallet shown in the preview,
   containing the concealed recovery
   phrase, public addresses, derivation paths, and safety notes.

The command form contains:

| Field               | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| **Item Title**      | Name of the new item in 1Password. Defaults to `Wallet Seed <date> <time>`. |
| **1Password Vault** | Selects the target vault. The last selected vault is remembered.     |

The vault list is cached, so after the first run the form opens instantly
while the list refreshes in the background. If the 1Password authorization has
expired when saving, the command re-triggers the 1Password prompt and retries
automatically.

Available actions:

| View                 | Action                         | Description                                                 |
| -------------------- | ------------------------------ | ----------------------------------------------------------- |
| Wallet preview       | **Save to 1Password**          | Opens the 1Password item form for the displayed wallet.     |
| Wallet form          | **Save to 1Password**          | Saves the displayed wallet to the selected vault.           |
| Saved result         | **Open in 1Password**          | Opens the newly created item in the 1Password desktop app.  |
| Saved result         | **Copy BTC/ETH/SOL Address**   | Copies a public address (⌘⇧B / ⌘⇧E / ⌘⇧L).                  |
| Setup error          | **Retry**                      | Checks the CLI, authentication, and vault list again.       |
| Missing CLI          | **Open Extension Preferences** | Opens the setting for a custom absolute `op` CLI path.      |
| Authentication error | **Open 1Password Settings**    | Opens 1Password settings so CLI integration can be enabled. |

The result view displays only the saved item name, vault, and public
addresses. It never displays the recovery phrase.

## Extension preferences

| Preference                 | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Recovery Phrase Length** | Generates 12 words by default. Can be changed to 24 words for both Raycast commands. |
| **1Password CLI Path**     | Optional absolute path to the `op` binary.                                           |

## Development

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

The extension looks for `op` at `/opt/homebrew/bin/op` and
`/usr/local/bin/op`. A custom absolute path can be set in extension preferences.

## Security model

- **Generate Wallet** runs entirely locally and never invokes the 1Password
  CLI. It displays the recovery phrase on screen, so run it only in a trusted,
  private environment.
- **Generate Wallet to 1Password** uses the same preview and starts with the
  recovery phrase masked. Revealing it is optional; saving does not copy it to
  the clipboard. The phrase exists only in process memory until `op` finishes,
  and the JSON template is passed over stdin. Only public addresses and
  1Password item metadata appear in the saved result view.
- No transaction or message signing is implemented.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution.
