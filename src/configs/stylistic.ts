import type { OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '../types';

import { plugin_ariel } from '../plugins';
import { interop_default } from '../utils';

export const StylisticConfigDefaults: StylisticConfig = {
	experimental: false,
	indent: 'tab',
	quotes: 'single',
	semi: true,
};

export async function stylistic(
	options: StylisticConfig & OptionsOverrides = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		experimental,
		indent,
		overrides = {},
		quotes,
		semi,
	} = {
		...StylisticConfigDefaults,
		...options,
	};

	const plugin_stylistic = await interop_default(import('@stylistic/eslint-plugin'));

	const config = plugin_stylistic.configs.customize({
		experimental,
		indent,
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

				'ariel/consistent-chaining': 'error',

				'ariel/curly': 'error',
				'ariel/if-newline': 'error',
				'ariel/top-level-function': 'error',

				'style/generator-star-spacing': ['error', { after: true, before: false }],
				'style/yield-star-spacing': ['error', { after: true, before: false }],

				...overrides,
			},
		},
	];
}
