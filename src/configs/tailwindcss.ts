import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem, OptionsHasTailwindCSS } from '../types';

import { GLOB_CSS, GLOB_HTML, GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & OptionsOverrides & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_CSS, GLOB_SVELTE, GLOB_HTML],
		overrides = {},
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
			},
			...overrides,
		},
	];
}
