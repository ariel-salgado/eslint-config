import type { TypedFlatConfigItem } from '../types';

import { plugin_node } from '../plugins';

export async function node(): Promise<TypedFlatConfigItem[]> {
	return [
		{
			name: 'ariel/node',
			plugins: {
				node: plugin_node,
			},
			rules: {
				'node/handle-callback-err': ['error', '^(err|error)$'],
				'node/no-deprecated-api': 'error',
				'node/no-exports-assign': 'error',
				'node/no-new-require': 'error',
				'node/no-path-concat': 'error',
				'node/no-unsupported-features/es-builtins': 'error',
				'node/prefer-global/buffer': ['error', 'never'],
				'node/prefer-global/process': 'off',
				'node/process-exit-as-throw': 'error',
			},
		},
	];
}
