import type { StylisticConfig, StylisticOptions, TypedFlatConfigItem } from '../types';

import { plugin_ariel } from '../plugins';
import { interop_default } from '../utils';

export const defaults: StylisticConfig = {
	experimental: false,
	indent: 'tab',
	jsx: true,
	quotes: 'single',
	semi: true,
};

export async function stylistic(
	options: StylisticOptions = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		experimental,
		indent,
		jsx,
		overrides = {},
		quotes,
		semi,
	} = {
		...defaults,
		...options,
	};

	const plugin_stylistic = await interop_default(import('@stylistic/eslint-plugin'));

	const config = plugin_stylistic.configs.customize({
		experimental,
		indent,
		jsx,
		pluginName: 'style',
		quotes,
		semi,
	}) as TypedFlatConfigItem;

	return [
		{
			name: 'ariel/stylistic/rules',
			plugins: {
				ariel: plugin_ariel,
				style: plugin_stylistic,
			},
			rules: {
				...config.rules,

				...experimental
					? {}
					: {
							'ariel/consistent-list-newline': 'error',
						},

				'ariel/curly': 'error',
				'ariel/if-newline': 'error',
				'ariel/consistent-chaining': 'error',

				'style/generator-star-spacing': ['error', { after: true, before: false }],
				'style/yield-star-spacing': ['error', { after: true, before: false }],

				...overrides,
			},
		},
	];
}
