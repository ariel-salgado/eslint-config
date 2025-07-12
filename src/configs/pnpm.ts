import type { TypedFlatConfigItem } from '../types';

import { interop_default } from '../utils';

export async function pnpm(): Promise<TypedFlatConfigItem[]> {
	const [
		plugin_pnpm,
		yaml_parser,
		jsonc_parser,
	] = await Promise.all([
		interop_default(import('eslint-plugin-pnpm')),
		interop_default(import('yaml-eslint-parser')),
		interop_default(import('jsonc-eslint-parser')),
	]);

	return [
		{
			files: [
				'package.json',
				'**/package.json',
			],
			languageOptions: {
				parser: jsonc_parser,
			},
			name: 'ariel/pnpm/package-json',
			plugins: {
				pnpm: plugin_pnpm,
			},
			rules: {
				'pnpm/json-enforce-catalog': 'error',
				'pnpm/json-prefer-workspace-settings': 'error',
				'pnpm/json-valid-catalog': 'error',
			},
		},
		{
			files: ['pnpm-workspace.yaml'],
			languageOptions: {
				parser: yaml_parser,
			},
			name: 'ariel/pnpm/pnpm-workspace-yaml',
			plugins: {
				pnpm: plugin_pnpm,
			},
			rules: {
				'pnpm/yaml-no-duplicate-catalog-item': 'error',
				'pnpm/yaml-no-unused-catalog-item': 'error',
			},
		},
	];
}
