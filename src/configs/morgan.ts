import type { TypedFlatConfigItem } from '../types';

import { plugin_morgan } from '../plugins';

export async function morgan(): Promise<TypedFlatConfigItem[]> {
	return [
		{
			...plugin_morgan.configs.recommended,
			name: 'ariel/morgan/rules',
		},
	];
}
