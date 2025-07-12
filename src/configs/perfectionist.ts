import type { TypedFlatConfigItem } from '../types';

import { plugin_perfectionist } from '../plugins';

export async function perfectionist(): Promise<TypedFlatConfigItem[]> {
	return [
		{
			name: 'ariel/perfectionist',
			plugins: {
				perfectionist: plugin_perfectionist,
			},
			rules: {
				'perfectionist/sort-exports': ['error', { order: 'asc', type: 'line-length' }],
				'perfectionist/sort-imports': [
					'error',
					{
						type: 'line-length',
						order: 'asc',
						groups: [
							'type',
							'side-effect',
							'sibling',
							'parent',
							'index',
							'external',
							'internal',
						],
						newlinesBetween: 'always',
						sortSideEffects: true,
					},
				],
				'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'line-length' }],
				'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'line-length' }],
			},
		},
	];
}
