import type { TypedFlatConfigItem } from '../types';

import { GLOB_EXCLUDE } from '../globs';
import { plugin_ignore } from '../plugins';

export async function ignores(ignores: string[] = []): Promise<TypedFlatConfigItem[]> {
	return [
		{
			name: 'ariel/ignores',
			ignores: [
				...GLOB_EXCLUDE,
				...ignores,
			],
		},
		{
			name: 'ariel/gitignore',
			...plugin_ignore({ strict: false }),
		},
	];
}
