import type { OptionsFiles, OptionsOverrides, OptionsStylistic, TypedFlatConfigItem, OptionsHasTypeScript } from '../types';

import { GLOB_SVELTE } from '../globs';
import { ensure_packages, interop_default } from '../utils';

export async function svelte(
	options: OptionsHasTypeScript & OptionsOverrides & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SVELTE],
		overrides = {},
		stylistic = true,
	} = options;

	const {
		indent = 4,
		quotes = 'single',
	} = typeof stylistic === 'boolean' ? {} : stylistic;

	await ensure_packages([
		'eslint-plugin-svelte',
	]);

	const [
		plugin_svelte,
		parser_svelte,
	] = await Promise.all([
		interop_default(import('eslint-plugin-svelte')),
		interop_default(import('svelte-eslint-parser')),
	] as const);

	return [
		{
			name: 'ariel/svelte/setup',
			plugins: {
				svelte: plugin_svelte,
			},
		},
		{
			files,
			languageOptions: {
				parser: parser_svelte,
				parserOptions: {
					extraFileExtensions: ['.svelte'],
					parser: options.typescript
						? await interop_default(import('@typescript-eslint/parser')) as any
						: null,
				},
			},
			name: 'ariel/svelte',
			processor: plugin_svelte.processors['.svelte'],
			rules: {
				'no-undef': 'off',
				'no-unused-vars': ['error', {
					args: 'none',
					caughtErrors: 'none',
					ignoreRestSiblings: true,
					vars: 'all',
					varsIgnorePattern: '^(\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)',
				}],

				'svelte/comment-directive': 'error',
				'svelte/no-at-debug-tags': 'warn',
				'svelte/no-at-html-tags': 'error',
				'svelte/no-dupe-else-if-blocks': 'error',
				'svelte/no-dupe-style-properties': 'error',
				'svelte/no-dupe-use-directives': 'error',
				'svelte/no-dynamic-slot-name': 'error',
				'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
				'svelte/no-inner-declarations': 'error',
				'svelte/no-not-function-handler': 'error',
				'svelte/no-object-in-text-mustaches': 'error',
				'svelte/no-reactive-functions': 'error',
				'svelte/no-reactive-literals': 'error',
				'svelte/no-shorthand-style-property-overrides': 'error',
				'svelte/no-unknown-style-directive-property': 'error',
				'svelte/no-unused-svelte-ignore': 'error',
				'svelte/no-useless-mustaches': 'error',
				'svelte/require-store-callbacks-use-set-param': 'error',
				'svelte/sort-attributes': 'error',
				'svelte/system': 'error',
				'svelte/valid-each-key': 'error',

				'unused-imports/no-unused-vars': [
					'error',
					{
						args: 'after-used',
						argsIgnorePattern: '^_',
						vars: 'all',
						varsIgnorePattern: '^(_|\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)',
					},
				],

				...stylistic
					? {
							'style/indent': 'off',
							'style/no-trailing-spaces': 'off',
							'svelte/derived-has-same-inputs-outputs': 'error',
							'svelte/html-closing-bracket-spacing': 'error',
							'svelte/html-quotes': ['error', { prefer: quotes === 'backtick' ? 'double' : quotes }],
							'svelte/indent': ['error', { alignAttributesVertically: true, indent }],
							'svelte/mustache-spacing': 'error',
							'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
							'svelte/no-trailing-spaces': 'error',
							'svelte/spaced-html-comment': 'error',
						}
					: {},

				...overrides,
			},
		},
	];
}
