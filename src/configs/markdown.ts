import type { OptionsComponentExts, OptionsFiles, OptionsMarkdown, TypedFlatConfigItem } from '../types';

import { mergeProcessors, processorPassThrough } from 'eslint-merge-processors';
import { GLOB_MARKDOWN, GLOB_MARKDOWN_CODE, GLOB_MARKDOWN_IN_MARKDOWN } from '../globs';
import { interop_default } from '../utils';

export async function markdown(
	options: OptionsFiles & OptionsComponentExts & OptionsMarkdown = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		componentExts = [],
		files = [GLOB_MARKDOWN],
		gfm = true,
		overrides = {},
		overridesMarkdown = {},
	} = options;

	const markdown = await interop_default(import('@eslint/markdown'));

	return [
		{
			name: 'ariel/markdown/setup',
			plugins: {
				markdown,
			},
		},
		{
			files,
			ignores: [GLOB_MARKDOWN_IN_MARKDOWN],
			name: 'ariel/markdown/processor',
			processor: mergeProcessors([
				markdown.processors!.markdown,
				processorPassThrough,
			]),
		},
		{
			files,
			language: gfm ? 'markdown/gfm' : 'markdown/commonmark',
			name: 'ariel/markdown/parser',
		},
		{
			files,
			name: 'ariel/markdown/rules',
			rules: {
				...markdown.configs.recommended.at(0)?.rules,
				'markdown/no-missing-label-refs': 'off',
				...overridesMarkdown,
			},
		},
		{
			files,
			name: 'ariel/markdown/disables/markdown',
			rules: {
				'command/command': 'off',
				'no-irregular-whitespace': 'off',
				'perfectionist/sort-exports': 'off',
				'perfectionist/sort-imports': 'off',
				'regexp/no-legacy-features': 'off',
				'regexp/no-missing-g-flag': 'off',
				'regexp/no-useless-dollar-replacements': 'off',
				'regexp/no-useless-flag': 'off',
				'style/indent': 'off',
			},
		},
		{
			files: [
				GLOB_MARKDOWN_CODE,
				...componentExts.map(ext => `${GLOB_MARKDOWN}/**/*.${ext}`),
			],
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						impliedStrict: true,
					},
				},
			},
			name: 'ariel/markdown/disables/code',
			rules: {
				'ariel/no-top-level-await': 'off',

				'no-alert': 'off',
				'no-console': 'off',
				'no-labels': 'off',
				'no-lone-blocks': 'off',
				'no-restricted-syntax': 'off',
				'no-undef': 'off',
				'no-unused-expressions': 'off',
				'no-unused-labels': 'off',
				'no-unused-vars': 'off',

				'node/prefer-global/process': 'off',

				'style/comma-dangle': 'off',
				'style/eol-last': 'off',
				'style/padding-line-between-statements': 'off',

				'ts/consistent-type-imports': 'off',
				'ts/explicit-function-return-type': 'off',
				'ts/no-namespace': 'off',
				'ts/no-redeclare': 'off',
				'ts/no-require-imports': 'off',
				'ts/no-unused-expressions': 'off',
				'ts/no-unused-vars': 'off',
				'ts/no-use-before-define': 'off',

				'unicode-bom': 'off',
				'unused-imports/no-unused-imports': 'off',
				'unused-imports/no-unused-vars': 'off',

				...overrides,
			},
		},
	];
}
