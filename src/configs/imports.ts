import type { OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '../types';

import { plugin_ariel, plugin_import } from '../plugins';

export async function imports(options: OptionsOverrides & OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> {
	const {
		overrides = {},
		stylistic = true,
	} = options;

	return [
		{
			name: 'ariel/imports/rules',
			plugins: {
				ariel: plugin_ariel,
				import: plugin_import,
			},
			rules: {
				'ariel/import-dedupe': 'error',
				'ariel/no-import-dist': 'error',
				'ariel/no-import-node-modules-by-path': 'error',

				'import/consistent-type-specifier-style': ['error', 'top-level'],
				'import/first': 'error',
				'import/no-duplicates': 'error',
				'import/no-mutable-exports': 'error',
				'import/no-named-default': 'error',
				'import/no-default-export': 'off',

				...stylistic
					? {
							'import/newline-after-import': ['error', { count: 1 }],
						}
					: {},

				...overrides,
			},
		},
	];
};
