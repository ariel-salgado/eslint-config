import fs from 'node:fs/promises';

import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { defineConfig } from '../src/factory';

const configs = await defineConfig({
	imports: true,
	jsx: {
		a11y: true,
	},
	jsonc: true,
	markdown: true,
	nextjs: true,
	react: true,
	solid: true,
	pnpm: true,
	regexp: true,
	stylistic: true,
	gitignore: true,
	svelte: true,
	typescript: {
		tsconfigPath: 'tsconfig.json',
	},
	unicorn: true,
	yaml: true,
	toml: true,
	test: true,
})
	.prepend(
		{
			plugins: {
				'': {
					rules: Object.fromEntries(builtinRules.entries()),
				},
			},
		},
	);

const config_names = configs.map(i => i.name).filter(Boolean) as string[];

let dts = await flatConfigsToRulesDTS(configs, {
	includeAugmentation: false,
});

dts += `
// Names of all the configs
export type ConfigNames = ${config_names.map(i => `'${i}'`).join(' | ')}
`;

await fs.writeFile('src/typegen.d.ts', dts);
