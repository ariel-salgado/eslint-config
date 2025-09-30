import type { OptionsUnicorn, TypedFlatConfigItem } from '../types';

import { plugin_unicorn } from '../plugins';

export async function unicorn(options: OptionsUnicorn = {}): Promise<TypedFlatConfigItem[]> {
	const {
		allRecommended = false,
		overrides = {},
	} = options;
	return [
		{
			name: 'ariel/unicorn/rules',
			plugins: {
				unicorn: plugin_unicorn,
			},
			rules: {
				...(allRecommended
					? plugin_unicorn.configs.recommended.rules
					: {
						'unicorn/consistent-empty-array-spread': 'error',
						'unicorn/consistent-function-scoping': [
							'error',
							{ checkArrowFunctions: false },
						],
						'unicorn/custom-error-definition': 'error',
						'unicorn/filename-case': [
							'error',
							{
								cases: { kebabCase: true, pascalCase: true },
								ignore: [/^[A-Z]+\..*$/, /import_map\.json/],
							},
						],
						'unicorn/error-message': 'error',
						'unicorn/escape-case': 'error',
						'unicorn/new-for-builtins': 'error',
						'unicorn/no-instanceof-builtins': 'error',
						'unicorn/no-new-array': 'error',
						'unicorn/no-new-buffer': 'error',
						'unicorn/no-useless-undefined': [
							'error',
							{ checkArguments: false, checkArrowFunctionBody: false },
						],
						'unicorn/number-literal-case': 'error',
						'unicorn/prefer-classlist-toggle': 'error',
						'unicorn/prefer-dom-node-text-content': 'error',
						'unicorn/prefer-includes': 'error',
						'unicorn/prefer-node-protocol': 'error',
						'unicorn/prefer-number-properties': 'error',
						'unicorn/prefer-string-starts-ends-with': 'error',
						'unicorn/prefer-type-error': 'error',
						'unicorn/throw-new-error': 'error',
					}),
				...overrides,
			},
		},
	];
}
