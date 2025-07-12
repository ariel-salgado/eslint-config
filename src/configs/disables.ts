import type { TypedFlatConfigItem } from '../types';

import { GLOB_SRC, GLOB_SRC_EXT } from '../globs';

export async function disables(): Promise<TypedFlatConfigItem[]> {
	return [
		{
			files: [`**/scripts/${GLOB_SRC}`],
			name: 'ariel/disables/scripts',
			rules: {
				'no-console': 'off',
				'ts/explicit-function-return-type': 'off',
			},
		},
		{
			files: ['**/*.d.?([cm])ts'],
			name: 'ariel/disables/dts',
			rules: {
				'eslint-comments/no-unlimited-disable': 'off',
				'no-restricted-syntax': 'off',
				'unused-imports/no-unused-vars': 'off',
			},
		},
		{
			files: ['**/*.js', '**/*.cjs'],
			name: 'ariel/disables/cjs',
			rules: {
				'ts/no-require-imports': 'off',
			},
		},
		{
			files: [`**/*.config.${GLOB_SRC_EXT}`, `**/*.config.*.${GLOB_SRC_EXT}`],
			name: 'ariel/disables/config-files',
			rules: {
				'no-console': 'off',
				'ts/explicit-function-return-type': 'off',
			},
		},
	];
}
