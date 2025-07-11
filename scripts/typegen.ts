import { writeFile } from 'node:fs/promises'
import { flatConfigsToRulesDTS } from 'eslint-typegen/core'
import { builtinRules } from 'eslint/use-at-your-own-risk'

import {
	combine,
	comments,
	ignores,
	imports,
	javascript
} from '../src';

const configs = await combine(
	{
		plugins: {
			'': {
				rules: Object.fromEntries(builtinRules),
			},
		},
	},
	comments(),
	ignores(),
	imports(),
	javascript()
)

const config_names = configs.map(i => i.name).filter(Boolean) as string[]

let dts = await flatConfigsToRulesDTS(configs, {
	includeAugmentation: false,
})

dts += `
// Names of all the configs
export type config_names = ${config_names.map(i => `'${i}'`).join(' | ')}
`

await writeFile('src/typegen.d.ts', dts)