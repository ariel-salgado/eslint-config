import type {
	OptionsComponentExts,
	OptionsFiles,
	OptionsOverrides,
	OptionsProjectType,
	OptionsTypeScriptParserOptions,
	OptionsTypeScriptWithTypes,
	TypedFlatConfigItem,
} from '../types';

import process from 'node:process';

import { GLOB_JSX, GLOB_MARKDOWN, GLOB_TS } from '../globs';
import { plugin_ariel } from '../plugins';
import { interop_default, rename_rules } from '../utils';

export async function typescript(
	options: OptionsFiles & OptionsComponentExts & OptionsOverrides & OptionsTypeScriptWithTypes & OptionsTypeScriptParserOptions & OptionsProjectType = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		componentExts = [],
		overrides = {},
		overridesTypeAware = {},
		parserOptions = {},
		type = 'app',
	} = options;

	const files = options.files ?? [
		GLOB_TS,
		GLOB_JSX,
		...componentExts.map(ext => `**/*.${ext}`),
	];

	const files_type_aware = options.filesTypeAware ?? [GLOB_TS, GLOB_JSX];
	const ignores_type_aware = options.ignoresTypeAware ?? [
		`${GLOB_MARKDOWN}/**`,
	];
	const tsconfig_path = options?.tsconfigPath
		? options.tsconfigPath
		: undefined;
	const is_type_aware = !!tsconfig_path;

	const type_aware_rules: TypedFlatConfigItem['rules'] = {
		'dot-notation': 'off',
		'no-implied-eval': 'off',
		'ts/await-thenable': 'error',
		'ts/dot-notation': ['error', { allowKeywords: true }],
		'ts/no-floating-promises': 'error',
		'ts/no-for-in-array': 'error',
		'ts/no-implied-eval': 'error',
		'ts/no-misused-promises': 'error',
		'ts/no-unnecessary-type-assertion': 'error',
		'ts/no-unsafe-argument': 'error',
		'ts/no-unsafe-assignment': 'error',
		'ts/no-unsafe-call': 'error',
		'ts/no-unsafe-member-access': 'error',
		'ts/no-unsafe-return': 'error',
		'ts/promise-function-async': 'error',
		'ts/restrict-plus-operands': 'error',
		'ts/restrict-template-expressions': 'error',
		'ts/return-await': ['error', 'in-try-catch'],
		'ts/strict-boolean-expressions': ['error', { allowNullableBoolean: true, allowNullableObject: true }],
		'ts/switch-exhaustiveness-check': 'error',
		'ts/unbound-method': 'error',
	};

	const [
		plugin_ts,
		parser_ts,
	] = await Promise.all([
		interop_default(import('@typescript-eslint/eslint-plugin')),
		interop_default(import('@typescript-eslint/parser')),
	] as const);

	function make_parser(type_aware: boolean, files: string[], ignores?: string[]): TypedFlatConfigItem {
		return {
			files,
			...ignores ? { ignores } : {},
			languageOptions: {
				parser: parser_ts,
				parserOptions: {
					extraFileExtensions: componentExts.map(ext => `.${ext}`),
					sourceType: 'module',
					...type_aware
						? {
								projectService: {
									allowDefaultProject: ['./*.js'],
									defaultProject: tsconfig_path,
								},
								tsconfigRootDir: process.cwd(),
							}
						: {},
					...parserOptions,
				},
			},
			name: `ariel/typescript/${type_aware ? 'type-aware-parser' : 'parser'}`,
		};
	}

	return [
		{
			name: 'ariel/typescript/setup',
			plugins: {
				ariel: plugin_ariel,
				ts: plugin_ts,
			},
		},
		...is_type_aware
			? [
					make_parser(false, files),
					make_parser(true, files_type_aware, ignores_type_aware),
				]
			: [
					make_parser(false, files),
				],
		{
			files,
			name: 'ariel/typescript/rules',
			rules: {
				...rename_rules(
					plugin_ts.configs['eslint-recommended'].overrides![0].rules!,
					{ '@typescript-eslint': 'ts' },
				),
				...rename_rules(
					plugin_ts.configs.strict.rules!,
					{ '@typescript-eslint': 'ts' },
				),
				'no-dupe-class-members': 'off',
				'no-redeclare': 'off',
				'no-use-before-define': 'off',
				'no-useless-constructor': 'error',
				'ts/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
				'ts/consistent-type-definitions': ['error', 'interface'],
				'ts/consistent-type-imports': ['error', {
					disallowTypeAnnotations: false,
					fixStyle: 'separate-type-imports',
					prefer: 'type-imports',
				}],

				'ts/method-signature-style': ['error', 'property'],
				'ts/no-dupe-class-members': 'error',
				'ts/no-dynamic-delete': 'off',
				'ts/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
				'ts/no-explicit-any': 'off',
				'ts/no-extraneous-class': 'off',
				'ts/no-import-type-side-effects': 'error',
				'ts/no-invalid-void-type': 'off',
				'ts/no-non-null-assertion': 'off',
				'ts/no-redeclare': ['error', { builtinGlobals: false }],
				'ts/no-require-imports': 'error',
				'ts/no-unused-expressions': ['error', {
					allowShortCircuit: true,
					allowTaggedTemplates: true,
					allowTernary: true,
				}],
				'ts/no-unused-vars': 'off',
				'ts/no-use-before-define': ['error', { classes: false, functions: false, variables: true }],
				'ts/no-useless-constructor': 'off',
				'ts/no-wrapper-object-types': 'error',
				'ts/triple-slash-reference': 'off',
				'ts/unified-signatures': 'off',

				...(type === 'lib'
					? {
							'ts/explicit-function-return-type': ['error', {
								allowExpressions: true,
								allowHigherOrderFunctions: true,
								allowIIFEs: true,
							}],
						}
					: {}
				),
				...overrides,
			},
		},
		...is_type_aware
			? [{
					files: files_type_aware,
					ignores: ignores_type_aware,
					name: 'ariel/typescript/rules-type-aware',
					rules: {
						...type_aware_rules,
						...overridesTypeAware,
					},
				}]
			: [],
	];
}
