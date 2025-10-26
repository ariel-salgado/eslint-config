import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem } from '../types';

import { GLOB_SRC } from '../globs';
import { ensure_packages, interop_default } from '../utils';

function normalize_rules(rules: Record<string, any>): Record<string, any> {
	return Object.fromEntries(
		Object.entries(rules).map(([key, value]) =>
			[key, typeof value === 'string' ? [value] : value],
		),
	);
}

export async function nextjs(
	options: OptionsOverrides & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SRC],
		overrides = {},
	} = options;

	await ensure_packages([
		'@next/eslint-plugin-next',
	]);

	const plugin_nextjs = await interop_default(import('@next/eslint-plugin-next'));

	return [
		{
			name: 'ariel/nextjs/setup',
			plugins: {
				next: plugin_nextjs,
			},
		},
		{
			files,
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
				},
				sourceType: 'module',
			},
			name: 'ariel/nextjs/rules',
			rules: {
				...normalize_rules(plugin_nextjs.configs.recommended.rules!),
				...normalize_rules(plugin_nextjs.configs['core-web-vitals'].rules!),
				...overrides,
			},
			settings: {
				react: {
					version: 'detect',
				},
			},
		},
	];
}
