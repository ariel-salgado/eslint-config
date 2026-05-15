import type { OptionsFiles, OptionsHasTailwindCSS, OptionsStylistic, TailwindCSSOptions, TypedFlatConfigItem } from '../types';

import { has_svelte, is_in_turbo } from '../env';
import { GLOB_HTML, GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default, resolve_cwd_list } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & TailwindCSSOptions & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_HTML, GLOB_SVELTE],
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

	const cwds = resolve_cwd_list(cwd);

	const rules = {
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
		'tailwindcss/enforce-consistent-variant-order': 'error',
		...overrides,
	};

	return [
		{
			name: 'ariel/tailwindcss/setup',
			plugins: {
				tailwindcss: plugin_tailwindcss,
			},
		},
		...cwds.map((path, i) => ({
			files,
			name: cwds.length > 1 ? `ariel/tailwindcss/rules/workspace-${i + 1}` : 'ariel/tailwindcss/rules',
			...(has_svelte() && {
				languageOptions: {
					parser: svelte_eslint_parser,
				},
			}),
			rules: rules as any,
			settings: {
				'better-tailwindcss': {
					entryPoint,
					cwd: is_in_turbo() ? '.' : path,
				},
			},
		}),
		),
	];
}
