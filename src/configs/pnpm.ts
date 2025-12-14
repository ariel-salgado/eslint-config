import type { OptionsPnpm, TypedFlatConfigItem } from '../types';

import { findUp } from 'find-up-simple';
import { readFile } from 'node:fs/promises';

import { is_in_editor_env } from '../env';
import { interop_default } from '../utils';

async function detect_catalog_usage(): Promise<boolean> {
	const workspace_file = await findUp('pnpm-workspace.yaml');
	if (!workspace_file) {
		return false;
	}

	const yaml = await readFile(workspace_file, 'utf-8');
	return yaml.includes('catalog:') || yaml.includes('catalogs:');
}

export async function pnpm(
	options: OptionsPnpm,
): Promise<TypedFlatConfigItem[]> {
	const [
		plugin_pnpm,
		plugin_yaml,
		yaml_parser,
		jsonc_parser,
	] = await Promise.all([
		interop_default(import('eslint-plugin-pnpm')),
		interop_default(import('eslint-plugin-yml')),
		interop_default(import('yaml-eslint-parser')),
		interop_default(import('jsonc-eslint-parser')),
	]);

	const {
		catalogs = await detect_catalog_usage(),
		json = true,
		sort = true,
		yaml = true,
	} = options;

	const configs: TypedFlatConfigItem[] = [];

	if (json) {
		configs.push(
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
					...(catalogs
						? {
								'pnpm/json-enforce-catalog': [
									'error',
									{ autofix: !is_in_editor_env() },
								],
							}
						: {}),
					'pnpm/json-prefer-workspace-settings': [
						'error',
						{ autofix: !is_in_editor_env() },
					],
					'pnpm/json-valid-catalog': [
						'error',
						{ autofix: !is_in_editor_env() },
					],
				},
			},
		);
	}

	if (yaml) {
		configs.push({
			files: ['pnpm-workspace.yaml'],
			languageOptions: {
				parser: yaml_parser,
			},
			name: 'ariel/pnpm/pnpm-workspace-yaml',
			plugins: {
				pnpm: plugin_pnpm,
			},
			rules: {
				'pnpm/yaml-enforce-settings': ['error', {
					settings: {
						catalogMode: 'prefer',
						shellEmulator: true,
						trustPolicy: 'no-downgrade',
					},
				}],
				'pnpm/yaml-no-duplicate-catalog-item': 'error',
				'pnpm/yaml-no-unused-catalog-item': 'error',
			},
		});

		if (sort) {
			configs.push({
				files: ['pnpm-workspace.yaml'],
				languageOptions: {
					parser: yaml_parser,
				},
				name: 'ariel/pnpm/pnpm-workspace-yaml-sort',
				plugins: {
					yaml: plugin_yaml,
				},
				rules: {
					'yaml/sort-keys': [
						'error',
						{
							order: [
								// Settings
								// @keep-sorted
								...[
									'cacheDir',
									'catalogMode',
									'cleanupUnusedCatalogs',
									'dedupeDirectDeps',
									'deployAllFiles',
									'enablePrePostScripts',
									'engineStrict',
									'extendNodePath',
									'hoist',
									'hoistPattern',
									'hoistWorkspacePackages',
									'ignoreCompatibilityDb',
									'ignoreDepScripts',
									'ignoreScripts',
									'ignoreWorkspaceRootCheck',
									'managePackageManagerVersions',
									'minimumReleaseAge',
									'minimumReleaseAgeExclude',
									'modulesDir',
									'nodeLinker',
									'nodeVersion',
									'optimisticRepeatInstall',
									'packageManagerStrict',
									'packageManagerStrictVersion',
									'preferSymlinkedExecutables',
									'preferWorkspacePackages',
									'publicHoistPattern',
									'registrySupportsTimeField',
									'requiredScripts',
									'resolutionMode',
									'savePrefix',
									'scriptShell',
									'shamefullyHoist',
									'shellEmulator',
									'stateDir',
									'supportedArchitectures',
									'symlink',
									'tag',
									'trustPolicy',
									'trustPolicyExclude',
									'updateNotifier',
								],

								// Packages and dependencies
								'packages',
								'overrides',
								'patchedDependencies',
								'catalog',
								'catalogs',

								// Other
								// @keep-sorted
								...[
									'allowedDeprecatedVersions',
									'allowNonAppliedPatches',
									'configDependencies',
									'ignoredBuiltDependencies',
									'ignoredOptionalDependencies',
									'neverBuiltDependencies',
									'onlyBuiltDependencies',
									'onlyBuiltDependenciesFile',
									'packageExtensions',
									'peerDependencyRules',
								],
							],
							pathPattern: '^$',
						},
						{
							order: { type: 'asc' },
							pathPattern: '.*',
						},
					],
				},
			});
		}
	}

	return configs;
}
