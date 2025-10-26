import type { OptionsJSX, TypedFlatConfigItem } from '../types';

import { GLOB_JSX, GLOB_TSX } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function jsx(options: OptionsJSX = {}): Promise<TypedFlatConfigItem[]> {
	const { a11y } = options;

	const base_config: TypedFlatConfigItem = {
		files: [GLOB_JSX, GLOB_TSX],
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		name: 'ariel/jsx/setup',
		plugins: {},
		rules: {},
	};

	if (!a11y) {
		return [base_config];
	}

	await ensure_packages(['eslint-plugin-jsx-a11y']);

	const jsx_a11y_plugin = await interop_default(import('eslint-plugin-jsx-a11y'));
	const a11y_config = jsx_a11y_plugin.flatConfigs.recommended;

	const a11y_rules = {
		...(a11y_config.rules || {}),
		...(typeof a11y === 'object' && a11y.overrides ? a11y.overrides : {}),
	};

	return [
		{
			...base_config,
			...a11y_config,
			files: base_config.files,
			languageOptions: {
				...base_config.languageOptions,
				...a11y_config.languageOptions,
			},
			name: base_config.name,
			plugins: {
				...base_config.plugins,
				'jsx-a11y': jsx_a11y_plugin,
			},
			rules: {
				...base_config.rules,
				...a11y_rules,
			},
		},
	];
}
