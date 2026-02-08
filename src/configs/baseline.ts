import type { OptionsBaseline, TypedFlatConfigItem } from '../types';

import { has_typescript } from '../env';
import { GLOB_JS, GLOB_JSX, GLOB_TS, GLOB_TSX } from '../globs';
import { plugin_baseline } from '../plugins';

export async function baseline(options: OptionsBaseline | boolean): Promise<TypedFlatConfigItem[]> {
	const {
		level = 'warn',
		...user_options
	} = typeof options === 'boolean' ? {} : options;

	return [
		{
			name: 'ariel/baseline/setup',
			plugins: {
				baseline: plugin_baseline,
			},
		},
		{
			files: has_typescript() ? [GLOB_TS, GLOB_TSX] : [GLOB_JS, GLOB_JSX],
			name: 'ariel/baseline/rules',
			rules: {
				'baseline/use-baseline': [
					level,
					{
						...((has_typescript()
							? plugin_baseline.configs['recommended-ts']({ level }).rules['baseline/use-baseline']
							: plugin_baseline.configs.recommended({ level }).rules['baseline/use-baseline']
						) as Record<string, unknown>),
						...user_options,
					},
				],
			},
		},
	];
}
