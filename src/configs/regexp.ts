import type { OptionsRegExp, OptionsOverrides, TypedFlatConfigItem } from '../types';

import { plugin_regexp } from '../plugins';

export async function regexp(
	options: OptionsRegExp & OptionsOverrides = {},
): Promise<TypedFlatConfigItem[]> {
	const config = plugin_regexp['flat/recommended'] as TypedFlatConfigItem;

	const rules = {
		...config.rules,
	};

	if (options.level === 'warn') {
		for (const key of Object.keys(rules)) {
			if (rules[key] === 'error')
				rules[key] = 'warn';
		}
	}

	return [
		{
			...config,
			name: 'ariel/regexp',
			rules: {
				...rules,
				...options.overrides,
			},
		},
	];
}
