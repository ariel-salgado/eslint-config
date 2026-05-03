import type { OptionsFiles, OptionsHasTailwindCSS, OptionsStylistic, TailwindCSSOptions, TypedFlatConfigItem } from '../types';

import { has_svelte } from '../env';
import { GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & TailwindCSSOptions & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SVELTE],
		overrides = {},
		entryPoint = 'src/app.css',
		printWidth = 100,
		stylistic = true,
		cwd = '.',
	} = options;

	const {
		indent = 'tab',
	} = typeof stylistic === 'boolean' ? {} : stylistic;

	const packages_to_ensure = [
		'eslint-plugin-better-tailwindcss',
	];

	if (has_svelte()) {
		packages_to_ensure.push('svelte-eslint-parser');
	}

	await ensure_packages(packages_to_ensure);

	const plugin_tailwindcss = await interop_default(import('eslint-plugin-better-tailwindcss'));
	const svelte_eslint_parser = has_svelte() ? await interop_default(import('svelte-eslint-parser')) : null;

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
			...(has_svelte() && {
				languageOptions: {
					parser: svelte_eslint_parser,
				},
			}),
			rules: {
				...plugin_tailwindcss.configs.recommended.rules,
				'tailwindcss/enforce-consistent-line-wrapping': [
					'error',
					{
						indent: typeof indent === 'number' ? indent : indent === 'tab' ? 'tab' : 2,
						printWidth,
						preferSingleLine: true,
					},
				],
				'tailwindcss/enforce-consistent-important-position': 'error',
				'tailwindcss/enforce-shorthand-classes': 'error',
				'tailwindcss/no-deprecated-classes': 'error',
				'tailwindcss/no-unknown-classes': [
					'error',
					{
						detectComponentClasses: true,
					},
				],
				'tailwincss/enforce-consistent-variant-order': 'error',
				...overrides,
			},
			settings: {
				'better-tailwindcss': {
					entryPoint,
					cwd,
				},
			},
		},
	];
}
