import type { TypedFlatConfigItem } from '../types';

import { plugin_comments } from '../plugins';

export async function comments(): Promise<TypedFlatConfigItem[]> {
	return [
		{
			name: 'ariel/eslint-comments/rules',
			plugins: {
				'eslint-comments': plugin_comments,
			},
			rules: {
				'eslint-comments/no-aggregating-enable': 'error',
				'eslint-comments/no-duplicate-disable': 'error',
				'eslint-comments/no-unlimited-disable': 'error',
				'eslint-comments/no-unused-enable': 'error',
			},
		},
	];
}
