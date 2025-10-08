## Features

This is my personal ESlint configuration, based on the [`@antfu/eslint-config`](https://github.com/antfu/eslint-config).
It only deviates for some minor tweaks and personal preferences.

This config adds optional rules for Tailwind, by using [`eslint-plugin-better-tailwindcss`](https://github.com/schoero/eslint-plugin-better-tailwindcss/tree/main)

Some of the main features, inherited directly from `@antfu/eslint-config`:

- Svelte and TypeScript support
- Linting for JSON, YAML, Markdown
- Uses the easily extensible [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- Includes [ESLint Stylistic](https://github.com/eslint-stylistic/eslint-stylistic) to format code and enforce a preconfigured style
- ... and many more

## Setup

### Installation

```bash
pnpm i -D eslint @ariel-salgado/eslint-config
```

### Basic usage

```js
// eslint.config.js
import defineConfig from '@ariel-salgado/eslint-config';

export default defineConfig();
```

#### Setting options and using custom rules

It is possible to add custom rules with the following configuration.

```js
// eslint.config.js
import defineConfig from '@ariel-salgado/eslint-config';

export default defineConfig({
	type: 'app',
	svelte: true,
	typescript: true,
	tailwindcss: true,
});
```

## VS Code Support

If you use VS Code, you should manually enable support for ESLint flat config.

Install [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

Add the following settings to your `.vscode/settings.json`:

```jsonc
{
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}
```

## Neovim Support

Using Neovim +0.11 you should setup your ESLint LSP, and then update your configuration to apply the settings:

```lua
vim.lsp.enable({
	"eslint",
})

vim.lsp.config("eslint", {
	filetypes = {
		"javascript",
		"javascriptreact",
		"javascript.jsx",
		"typescript",
		"typescriptreact",
		"typescript.tsx",
		"vue",
		"html",
		"markdown",
		"json",
		"jsonc",
		"yaml",
		"toml",
		"xml",
		"gql",
		"graphql",
		"astro",
		"svelte",
		"css",
		"less",
		"scss",
		"pcss",
		"postcss",
	},
	settings = {
		rulesCustomizations = {
			{ rule = "style/*", severity = "off", fixable = true },
			{ rule = "format/*", severity = "off", fixable = true },
			{ rule = "*-indent", severity = "off", fixable = true },
			{ rule = "*-spacing", severity = "off", fixable = true },
			{ rule = "*-spaces", severity = "off", fixable = true },
			{ rule = "*-order", severity = "off", fixable = true },
			{ rule = "*-dangle", severity = "off", fixable = true },
			{ rule = "*-newline", severity = "off", fixable = true },
			{ rule = "*quotes", severity = "off", fixable = true },
			{ rule = "*semi", severity = "off", fixable = true },
			{ rule = "*/indent", severity = "off", fixable = true },
		},
	},
})
```
