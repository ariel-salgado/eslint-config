import type { OptionsConfig } from './types';

// @keep-sorted
export const PRESET_FULL_ON: OptionsConfig = {
	gitignore: true,
	imports: true,
	jsdoc: true,
	jsonc: true,
	jsx: {
		a11y: true,
	},
	markdown: true,
	nextjs: true,
	node: true,
	pnpm: true,
	react: true,
	regexp: true,
	solid: true,
	stylistic: {
		experimental: true,
	},
	svelte: true,
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
	jsx: false,
	markdown: false,
	nextjs: false,
	node: false,
	pnpm: false,
	react: false,
	regexp: false,
	solid: false,
	stylistic: false,
	svelte: false,
	test: false,
	toml: false,
	typescript: false,
	e18e: false,
	unicorn: false,
	yaml: false,
};
