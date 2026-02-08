import type { TypedFlatConfigItem } from '../types';

import { plugin_perfectionist } from '../plugins';

export async function perfectionist(): Promise<TypedFlatConfigItem[]> {
	return [
		{
			name: 'ariel/perfectionist/setup',
			plugins: {
				perfectionist: plugin_perfectionist,
			},
			rules: {
				'perfectionist/sort-exports': [
					'error',
					{
						order: 'asc',
						type: 'alphabetical',
						groups: [
							'type-export',
							'value-export',
						],
						newlinesBetween: 1,
					},
				],
				// OCD ... Sorry ...
				'perfectionist/sort-imports': [
					'error',
					{
						type: 'alphabetical',
						order: 'asc',
						groups: [
							// Types
							'type-wildcard',
							'type-default',
							'type-named',

							// Side effects
							'side-effect-style',
							'side-effect',

							// Value wildcards
							'value-wildcard-builtin',
							{ newlinesBetween: 0 },
							'value-wildcard-external',
							{ newlinesBetween: 0 },
							'value-wildcard-internal',
							{ newlinesBetween: 0 },
							'value-wildcard-parent',
							{ newlinesBetween: 0 },
							'value-wildcard-sibling',
							{ newlinesBetween: 0 },
							'value-wildcard-index',
							{ newlinesBetween: 1 },

							// Value defaults
							'value-default-builtin',
							{ newlinesBetween: 0 },
							'value-default-external',
							{ newlinesBetween: 0 },
							'value-default-internal',
							{ newlinesBetween: 0 },
							'value-default-parent',
							{ newlinesBetween: 0 },
							'value-default-sibling',
							{ newlinesBetween: 0 },
							'value-default-index',
							{ newlinesBetween: 1 },

							// Value named
							'value-named-builtin',
							{ newlinesBetween: 0 },
							'value-named-external',
							{ newlinesBetween: 0 },
							'value-named-internal',
							{ newlinesBetween: 0 },
							'value-named-parent',
							{ newlinesBetween: 0 },
							'value-named-sibling',
							{ newlinesBetween: 0 },
							'value-named-index',
						],
						customGroups: [
							// Types
							{ groupName: 'type-wildcard', selector: 'type', modifiers: ['wildcard'] },
							{ groupName: 'type-default', selector: 'type', modifiers: ['default'] },
							{ groupName: 'type-named', selector: 'type', modifiers: ['named'] },

							// Side-effect styles
							{ groupName: 'side-effect-style', selector: 'side-effect-style' },

							// Side-effects
							{ groupName: 'side-effect', selector: 'side-effect', modifiers: ['value'] },

							// Value wildcards
							{ groupName: 'value-wildcard-builtin', selector: 'builtin', modifiers: ['value', 'wildcard'] },
							{ groupName: 'value-wildcard-external', selector: 'external', modifiers: ['value', 'wildcard'] },
							{ groupName: 'value-wildcard-internal', selector: 'internal', modifiers: ['value', 'wildcard'] },
							{ groupName: 'value-wildcard-parent', selector: 'parent', modifiers: ['value', 'wildcard'] },
							{ groupName: 'value-wildcard-sibling', selector: 'sibling', modifiers: ['value', 'wildcard'] },
							{ groupName: 'value-wildcard-index', selector: 'index', modifiers: ['value', 'wildcard'] },

							// Value defaults
							{ groupName: 'value-default-builtin', selector: 'builtin', modifiers: ['value', 'default'] },
							{ groupName: 'value-default-external', selector: 'external', modifiers: ['value', 'default'] },
							{ groupName: 'value-default-internal', selector: 'internal', modifiers: ['value', 'default'] },
							{ groupName: 'value-default-parent', selector: 'parent', modifiers: ['value', 'default'] },
							{ groupName: 'value-default-sibling', selector: 'sibling', modifiers: ['value', 'default'] },
							{ groupName: 'value-default-index', selector: 'index', modifiers: ['value', 'default'] },

							// Value named
							{ groupName: 'value-named-builtin', selector: 'builtin', modifiers: ['value', 'named'] },
							{ groupName: 'value-named-external', selector: 'external', modifiers: ['value', 'named'] },
							{ groupName: 'value-named-internal', selector: 'internal', modifiers: ['value', 'named'] },
							{ groupName: 'value-named-parent', selector: 'parent', modifiers: ['value', 'named'] },
							{ groupName: 'value-named-sibling', selector: 'sibling', modifiers: ['value', 'named'] },
							{ groupName: 'value-named-index', selector: 'index', modifiers: ['value', 'named'] },
						],
						newlinesBetween: 1,
						sortSideEffects: true,
					},
				],
				'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'alphabetical' }],
				'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'alphabetical' }],
			},
		},
	];
}
