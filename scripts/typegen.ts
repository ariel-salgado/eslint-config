import { writeFile } from 'node:fs/promises';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { defineConfig } from '../src/factory';
import { PRESET_FULL_ON } from '../src/presets';

const configs = await defineConfig(PRESET_FULL_ON)
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

await writeFile('src/typegen.d.ts', dts);
