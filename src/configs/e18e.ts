import type { OptionsE18e, OptionsProjectType, TypedFlatConfigItem } from '../types';

import { is_in_editor_env } from '../env';
import { plugin_e18e } from '../plugins';

export async function e18e(options: OptionsE18e & OptionsProjectType = {}): Promise<TypedFlatConfigItem[]> {
	const {
		modernization = true,
		type = 'app',
		moduleReplacements = type === 'lib' && is_in_editor_env(),
		overrides = {},
		performanceImprovements = true,
	} = options;

	const configs = plugin_e18e.configs;

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

				...(type === 'lib'
					? {}
					: {
							'e18e/prefer-static-regex': 'off',
						}),

				'e18e/prefer-array-at': 'off',
				'e18e/prefer-array-from-map': 'off',
				'e18e/prefer-array-to-reversed': 'off',
				'e18e/prefer-array-to-sorted': 'off',
				'e18e/prefer-array-to-spliced': 'off',
				'e18e/prefer-spread-syntax': 'off',
				'e18e/ban-dependencies': [
					'error',
					{
						allowed: [
							'lint-staged',
						],
					},
				],

				...overrides,
			},
		},
	];
}
