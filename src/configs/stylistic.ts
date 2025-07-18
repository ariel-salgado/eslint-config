import type { StylisticConfig, StylisticOptions, TypedFlatConfigItem } from '../types';

import { plugin_ariel } from '../plugins';
import { interop_default } from '../utils';

export const defaults: StylisticConfig = {
	indent: 'tab',
	quotes: 'single',
	semi: true,
};

export async function stylistic(
	options: StylisticOptions = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		indent,
		overrides = {},
		quotes,
		semi,
	} = {
		...defaults,
		...options,
	};

	const plugin_stylistic = await interop_default(import('@stylistic/eslint-plugin'));

	const config = plugin_stylistic.configs.customize({
		indent,
		pluginName: 'style',
		quotes,
		semi,
	});

	return [
		{
			name: 'ariel/stylistic',
			plugins: {
				ariel: plugin_ariel,
				style: plugin_stylistic,
			},
			rules: {
				...config.rules,

				'ariel/consistent-chaining': 'error',
				'ariel/consistent-list-newline': 'error',
				'ariel/if-newline': 'error',
				'style/generator-star-spacing': ['error', { after: true, before: false }],
				'style/yield-star-spacing': ['error', { after: true, before: false }],

				...overrides,
			},
		},
	];
}
