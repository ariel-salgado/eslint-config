import type { OptionsFiles, OptionsHasTailwindCSS, OptionsStylistic, TailwindCSSOptions, TypedFlatConfigItem } from '../types';

import { has_svelte } from '../env';
import { GLOB_HTML, GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default, resolve_cwd_list } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & TailwindCSSOptions & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files,
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

	const resolved_cwds = resolve_cwd_list(cwd);

	const default_files = [GLOB_HTML, GLOB_SVELTE];
	const should_scope_files = resolved_cwds.length > 1 && files === undefined;

	const common_rules: Record<string, any> = {
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
		'tailwindcss/enforce-consistent-variant-order': 'error',
		'tailwindcss/enforce-shorthand-classes': 'error',
		'tailwindcss/no-deprecated-classes': 'error',
		'tailwindcss/no-unknown-classes': [
			'error',
			{ detectComponentClasses: true },
		],
		...overrides,
	};

	const rule_configs: TypedFlatConfigItem[] = resolved_cwds.map((cwd_path, i) => {
		const block_files = should_scope_files
			? default_files.map(g => `${cwd_path}/${g}`)
			: (files ?? default_files);

		return {
			files: block_files,
			name: resolved_cwds.length > 1 ? `ariel/tailwindcss/rules/${i}` : 'ariel/tailwindcss/rules',
			...(svelte_eslint_parser && {
				languageOptions: {
					parser: svelte_eslint_parser,
				},
			}),
			rules: common_rules,
			settings: {
				'better-tailwindcss': {
					cwd: cwd_path,
					entryPoint,
				},
			},
		};
	});

	return [
		{
			name: 'ariel/tailwindcss/setup',
			plugins: {
				tailwindcss: plugin_tailwindcss,
			},
		},
		...rule_configs,
	];
}
