import type { OptionsConfig } from './types';

// @keep-sorted
export const PRESET_FULL_ON: OptionsConfig = {
	gitignore: true,
	imports: true,
	jsdoc: true,
	jsonc: true,
	markdown: true,
	node: true,
	pnpm: true,
	regexp: true,
	stylistic: {
		experimental: true,
	},
	svelte: true,
	tailwindcss: true,
	test: true,
	toml: true,
	typescript: {
		tsconfigPath: 'tsconfig.json',
	},
	e18e: true,
	unicorn: true,
	yaml: true,
};

export const PRESET_FULL_OFF: OptionsConfig = {
	gitignore: false,
	imports: false,
	jsdoc: false,
	jsonc: false,
	markdown: false,
	node: false,
	pnpm: false,
	regexp: false,
	stylistic: false,
	svelte: false,
	tailwindcss: false,
	test: false,
	toml: false,
	typescript: false,
	e18e: false,
	unicorn: false,
	yaml: false,
};
