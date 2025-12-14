import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem } from '../types';

import { GLOB_TESTS } from '../globs';
import { is_in_editor_env } from '../env';
import { interop_default } from '../utils';

let _plugin_test: any;

export async function test(
	options: OptionsFiles & OptionsOverrides = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = GLOB_TESTS,
		overrides = {},
	} = options;

	const [
		plugin_vitest,
		plugin_no_only_tests,
	] = await Promise.all([
		interop_default(import('@vitest/eslint-plugin')),
		// @ts-expect-error missing types
		interop_default(import('eslint-plugin-no-only-tests')),
	] as const);

	_plugin_test = _plugin_test || {
		...plugin_vitest,
		rules: {
			...plugin_vitest.rules,
			...plugin_no_only_tests.rules,
		},
	};

	return [
		{
			name: 'ariel/test/setup',
			plugins: {
				test: _plugin_test,
			},
		},
		{
			files,
			name: 'ariel/test/rules',
			rules: {
				'test/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
				'test/no-identical-title': 'error',
				'test/no-import-node-test': 'error',
				'test/no-only-tests': is_in_editor_env() ? 'warn' : 'error',

				'test/prefer-hooks-in-order': 'error',
				'test/prefer-lowercase-title': 'error',

				// Disables
				...{
					'ariel/no-top-level-await': 'off',
					'no-unused-expressions': 'off',
					'node/prefer-global/process': 'off',
					'ts/explicit-function-return-type': 'off',
				},

				...overrides,
			},
		},
	];
}
