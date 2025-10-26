import type { OptionsFiles, OptionsStylistic, TailwindCSSOptions, TypedFlatConfigItem, OptionsHasTailwindCSS } from '../types';

import { GLOB_JSX, GLOB_TSX, GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & TailwindCSSOptions & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SVELTE, GLOB_JSX, GLOB_TSX],
		overrides = {},
		entryPoint = 'src/app.css',
		printWidth = 100,
		stylistic = true,
	} = options;

	const {
		indent = 'tab',
	} = typeof stylistic === 'boolean' ? {} : stylistic;

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
						indent,
						printWidth,
						preferSingleLine: true,
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
