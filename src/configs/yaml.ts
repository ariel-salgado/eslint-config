import type { OptionsFiles, OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '../types';

import { GLOB_YAML } from '../globs';
import { interop_default } from '../utils';

export async function yaml(
	options: OptionsOverrides & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_YAML],
		overrides = {},
		stylistic = true,
	} = options;

	const {
		indent = 2,
		quotes = 'single',
	} = typeof stylistic === 'boolean' ? {} : stylistic;

	const [
		plugin_yaml,
		parser_yaml,
	] = await Promise.all([
		interop_default(import('eslint-plugin-yml')),
		interop_default(import('yaml-eslint-parser')),
	] as const);

	return [
		{
			name: 'ariel/yaml/setup',
			plugins: {
				yaml: plugin_yaml,
			},
		},
		{
			files,
			languageOptions: {
				parser: parser_yaml,
			},
			name: 'ariel/yaml/rules',
			rules: {
				'style/spaced-comment': 'off',

				'yaml/block-mapping': 'error',
				'yaml/block-sequence': 'error',
				'yaml/no-empty-key': 'error',
				'yaml/no-empty-sequence-entry': 'error',
				'yaml/no-irregular-whitespace': 'error',
				'yaml/plain-scalar': 'error',

				...stylistic
					? {
							'yaml/block-mapping-question-indicator-newline': 'error',
							'yaml/block-sequence-hyphen-indicator-newline': 'error',
							'yaml/flow-mapping-curly-newline': 'error',
							'yaml/flow-mapping-curly-spacing': 'error',
							'yaml/flow-sequence-bracket-newline': 'error',
							'yaml/flow-sequence-bracket-spacing': 'error',
							'yaml/indent': ['error', typeof indent === 'number' ? indent : indent === 'tab' ? 'tab' : 2],
							'yaml/key-spacing': 'error',
							'yaml/no-tab-indent': 'error',
							'yaml/quotes': ['error', { avoidEscape: true, prefer: quotes === 'backtick' ? 'single' : quotes }],
							'yaml/spaced-comment': 'error',
						}
					: {},

				...overrides,
			},
		},
	];
}
