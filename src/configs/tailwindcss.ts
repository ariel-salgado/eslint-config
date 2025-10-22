import type { OptionsFiles, TailwindCSSOptions, TypedFlatConfigItem, OptionsHasTailwindCSS } from '../types';

import { GLOB_HTML, GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & TailwindCSSOptions & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_HTML, GLOB_SVELTE],
		overrides = {},
		entryPoint = 'src/app.css',
		printWidth = 80,
	} = options;

	await ensure_packages([
		'eslint-plugin-better-tailwindcss',
	]);

	const plugin_tailwindcss = await interop_default(import('eslint-plugin-better-tailwindcss'));

	return [
		{
			name: 'ariel/tailwindcss/setup',
			plugins: {
				tailwindcss: plugin_tailwindcss,
			},
		},
		{
			files,
			name: 'ariel/tailwindcss/rules',
			rules: {
				...plugin_tailwindcss.configs.recommended.rules,
				'tailwindcss/enforce-consistent-line-wrapping': [
					'error',
					{
						printWidth,
					},
				],
				'tailwindcss/enforce-consistent-important-position': 'error',
				'tailwindcss/enforce-shorthand-classes': 'error',
				'tailwindcss/no-deprecated-classes': 'error',
				'tailwindcss/no-unregistered-classes': [
					'error',
					{
						detectComponentClasses: true,
					},
				],
				...overrides,
			},
			settings: {
				'better-tailwindcss': {
					entryPoint,
				},
			},
		},
	];
}
