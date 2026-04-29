import type { OptionsE18e, TypedFlatConfigItem } from '../types';
import type { Linter } from 'eslint';

import { is_in_editor_env } from '../env';
import { plugin_e18e } from '../plugins';

export async function e18e(options: OptionsE18e = {}): Promise<TypedFlatConfigItem[]> {
	const {
		modernization = true,
		moduleReplacements = is_in_editor_env(),
		overrides = {},
		performanceImprovements = true,
	} = options;

	// TODO: better type needed on the e18e side
	const configs = plugin_e18e.configs as Record<string, Linter.Config>;

	return [
		{
			name: 'ariel/e18e/rules',
			plugins: {
				e18e: plugin_e18e,
			},
			rules: {
				...modernization ? { ...configs.modernization.rules } : {},
				...moduleReplacements ? { ...configs.moduleReplacements!.rules } : {},
				...performanceImprovements ? { ...configs.performanceImprovements!.rules } : {},
				...overrides,

				'e18e/prefer-array-to-reversed': 'off',
				'e18e/prefer-array-to-sorted': 'off',
				'e18e/prefer-array-to-spliced': 'off',
				'e18e/prefer-spread-syntax': 'off',
				'e18e/ban-dependencies': ['warn', {
					allowed: [
						'lint-staged',
					],
				}],
			},
		},
	];
}
