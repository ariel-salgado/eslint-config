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

	function get_rules(name: keyof typeof plugin_nextjs.configs): Record<string, any> {
		const rules = plugin_nextjs.configs?.[name]?.rules;

		if (!rules) {
			throw new Error(`[@ariel-salgado/eslint-config] Failed to find config ${name} in @next/eslint-plugin-next`);
		}

		return normalize_rules(rules);
	}

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
				...get_rules('recommended'),
				...get_rules('core-web-vitals'),

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
