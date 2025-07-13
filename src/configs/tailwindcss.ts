import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem, OptionsHasTailwindCSS } from '../types';

import { GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function tailwindcss(
	options: OptionsHasTailwindCSS & OptionsOverrides & OptionsFiles & {
		userRules?: Record<string, any>;
	} = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SVELTE],
		overrides = {},
		userRules = {},
	} = options;

	await ensure_packages([
		'tailwindcss',
		'eslint-plugin-better-tailwindcss',
	]);

	const plugin_tailwindcss = await interop_default(import('eslint-plugin-better-tailwindcss'));

	const tailwindcss_user_rules = Object.entries(userRules)
		.filter(([key]) => key.startsWith('tailwindcss/'))
		.reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {} as Record<string, any>);

	return [
		{
			name: 'ariel/tailwindcss',
			plugins: {
				tailwindcss: plugin_tailwindcss,
			},
			files,
			rules: {
				...plugin_tailwindcss.configs.recommended.rules,
				...tailwindcss_user_rules,
			},
			...overrides,
		},
	];
}
