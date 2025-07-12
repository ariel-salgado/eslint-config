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
				'perfectionist/sort-exports': [
					'error',
					{
						order: 'asc',
						type: 'line-length',
						groups: [
							'type-export',
							'value-export',
						],
						newlinesBetween: 1,
					},
				],
				'perfectionist/sort-imports': [
					'error',
					{
						type: 'line-length',
						order: 'asc',
						groups: [
							'type-default',
							'type-named',
							'side-effect',
							'external-default',
							'external-named',
							'internal',
							'parent',
							'sibling',
							'index',
						],
						customGroups: [
							{
								groupName: 'type-default',
								selector: 'type',
								modifiers: ['default'],
							},
							{
								groupName: 'type-named',
								selector: 'type',
								modifiers: ['named'],
							},
							{
								groupName: 'external-default',
								selector: 'external',
								modifiers: ['default'],
							},
							{
								groupName: 'external-named',
								selector: 'external',
								modifiers: ['named'],
							},
						],
						newlinesBetween: 'always',
						sortSideEffects: true,
					},
				],
				'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'line-length' }],
			},
		},
	];
}
