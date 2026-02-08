import type { OptionsFiles, OptionsHasTypeScript, OptionsOverrides, OptionsTypeScriptWithTypes, TypedFlatConfigItem } from '../types';

import { GLOB_JSX, GLOB_TSX } from '../globs';
import { ensure_packages, interop_default, to_array } from '../utils';

export async function solid(
	options: OptionsHasTypeScript & OptionsOverrides & OptionsFiles & OptionsTypeScriptWithTypes = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_JSX, GLOB_TSX],
		overrides = {},
		typescript = true,
	} = options;

	await ensure_packages([
		'eslint-plugin-solid',
	]);

	const tsconfig_path = options?.tsconfigPath
		? to_array(options.tsconfigPath)
		: undefined;
	const is_type_aware = !!tsconfig_path;

	const [
		plugin_solid,
		parser_ts,
	] = await Promise.all([
		interop_default(import('eslint-plugin-solid')),
		interop_default(import('@typescript-eslint/parser')),
	] as const);

	return [
		{
			name: 'ariel/solid/setup',
			plugins: {
				solid: plugin_solid,
			},
		},
		{
			files,
			languageOptions: {
				parser: parser_ts,
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
					...is_type_aware ? { project: tsconfig_path } : {},
				},
				sourceType: 'module',
			},
			name: 'ariel/solid/rules',
			rules: {
				// reactivity
				'solid/components-return-once': 'warn',
				'solid/event-handlers': ['error', {
					// if true, don't warn on ambiguously named event handlers like `onclick` or `onchange`
					ignoreCase: false,
					// if true, warn when spreading event handlers onto JSX. Enable for Solid < v1.6.
					warnOnSpread: false,
				}],
				// these rules are mostly style suggestions
				'solid/imports': 'error',
				// identifier usage is important
				'solid/jsx-no-duplicate-props': 'error',
				'solid/jsx-no-script-url': 'error',
				'solid/jsx-no-undef': 'error',
				'solid/jsx-uses-vars': 'error',
				'solid/no-destructure': 'error',
				// security problems
				'solid/no-innerhtml': ['error', { allowStatic: true }],
				'solid/no-react-deps': 'error',
				'solid/no-react-specific-props': 'error',
				'solid/no-unknown-namespaces': 'error',
				'solid/prefer-for': 'error',
				'solid/reactivity': 'warn',
				'solid/self-closing-comp': 'error',
				'solid/style-prop': ['error', { styleProps: ['style', 'css'] }],
				...typescript
					? {
							'solid/jsx-no-undef': ['error', { typescriptEnabled: true }],
							'solid/no-unknown-namespaces': 'off',
						}
					: {},
				...overrides,
			},
		},
	];
}
