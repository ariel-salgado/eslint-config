import {
	node,
	pnpm,
	test,
	toml,
	yaml,
	jsdoc,
	jsonc,
	morgan,
	regexp,
	svelte,
	combine,
	ignores,
	imports,
	unicorn,
	comments,
	disables,
	markdown,
	stylistic,
	javascript,
	typescript,
	tailwindcss,
	perfectionist,
	sort_ts_config,
	sort_package_json,
} from '../src';

import { writeFile } from 'node:fs/promises';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';

const configs = await combine(
	{
		plugins: {
			'': {
				rules: Object.fromEntries(builtinRules),
			},
		},
	},
	comments(),
	disables(),
	ignores(),
	imports(),
	javascript(),
	jsdoc(),
	jsonc(),
	markdown(),
	morgan(),
	node(),
	perfectionist(),
	pnpm(),
	regexp(),
	sort_package_json(),
	sort_ts_config(),
	stylistic(),
	svelte(),
	tailwindcss(),
	test(),
	toml(),
	typescript(),
	unicorn(),
	yaml(),
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
