import type { OptionsFiles, TailwindCSSOptions, TypedFlatConfigItem, OptionsHasTailwindCSS } from '../types';

import { GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & TailwindCSSOptions & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SVELTE],
		overrides = {},
		entryPoint = 'src/app.css',
	} = options;

	await ensure_packages([
		'tailwindcss',
		'eslint-plugin-better-tailwindcss',
	]);

	const plugin_tailwindcss = await interop_default(import('eslint-plugin-better-tailwindcss'));

	return [
		{
			name: 'ariel/tailwindcss',
			plugins: {
				tailwindcss: plugin_tailwindcss,
			},
			files,
			rules: {
				...plugin_tailwindcss.configs.recommended.rules,
				'tailwindcss/enforce-consistent-line-wrapping': 'off',
				'tailwindcss/no-unregistered-classes': [
					'error',
					{
						detectComponentClasses: true,
					},
				],
			},
			settings: {
				'better-tailwindcss': {
					entryPoint,
				},
			},
			...overrides,
		},
	];
}
