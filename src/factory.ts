import type { Linter } from 'eslint';
import type { RuleOptions, ConfigNames } from './typegen';
import type { Awaitable, OptionsConfig, TypedFlatConfigItem } from './types';

import { isPackageExists } from 'local-pkg';
import { FlatConfigComposer } from 'eslint-flat-config-utils';

import { GLOB_SVELTE } from './globs';
import { interop_default } from './utils';
import { has_svelte, has_tailwindcss, is_in_editor_env } from './env';
import {
	node,
	pnpm,
	test,
	toml,
	yaml,
	jsdoc,
	jsonc,
	morgan,
	regexp,
	svelte,
	ignores,
	imports,
	unicorn,
	comments,
	disables,
	markdown,
	stylistic,
	javascript,
	typescript,
	tailwindcss,
	perfectionist,
	sort_ts_config,
	sort_package_json,
} from './configs';

const flat_config_props = [
	'name',
	'languageOptions',
	'linterOptions',
	'processor',
	'plugins',
	'rules',
	'settings',
] satisfies (keyof TypedFlatConfigItem)[];

export const default_plugin_renaming = {
	'@stylistic': 'style',
	'@typescript-eslint': 'ts',
	'better-tailwindcss': 'tailwindcss',
	'import-lite': 'import',
	'n': 'node',
	'vitest': 'test',
	'yml': 'yaml',
};

/**
 * Construct an array of ESLint flat config items.
 *
 * @param {OptionsConfig & TypedFlatConfigItem} options
 *  The options for generating the ESLint configurations.
 * @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs
 *  The user configurations to be merged with the generated configurations.
 * @returns {Promise<TypedFlatConfigItem[]>}
 *  The merged ESLint configurations.
 */
export function ariel(
	options: OptionsConfig & Omit<TypedFlatConfigItem, 'files'> = {},
	...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]
): FlatConfigComposer<TypedFlatConfigItem, ConfigNames> {
	const {
		autoRenamePlugins = true,
		componentExts = [],
		gitignore: enable_git_ignore = true,
		imports: enable_imports = true,
		pnpm: enable_catalogs = false, // TODO: smart detect
		regexp: enable_regexp = true,
		svelte: enable_svelte = has_svelte(),
		tailwindcss: enable_tailwindcss = has_tailwindcss(),
		typescript: enable_typescript = isPackageExists('typescript'),
		unicorn: enable_unicorn = true,
	} = options;

	let is_in_editor = options.isInEditor;

	if (is_in_editor == null) {
		is_in_editor = is_in_editor_env();
		if (is_in_editor)
			// eslint-disable-next-line no-console
			console.log('[@ariel/eslint-config] Detected running in editor, some rules are disabled.');
	}

	const stylistic_options = options.stylistic === false
		? false
		: typeof options.stylistic === 'object'
			? options.stylistic
			: {};

	const configs: Awaitable<TypedFlatConfigItem[]>[] = [];

	if (enable_git_ignore) {
		if (typeof enable_git_ignore !== 'boolean') {
			configs.push(interop_default(import('eslint-config-flat-gitignore')).then(r => [r({
				name: 'ariel/gitignore',
				...enable_git_ignore,
			})]));
		}
		else {
			configs.push(interop_default(import('eslint-config-flat-gitignore')).then(r => [r({
				name: 'ariel/gitignore',
				strict: false,
			})]));
		}
	}

	const extracted_tailwindcss_rules: Record<string, any> = {};
	const cleaned_user_configs: typeof userConfigs = [];

	for (const config of userConfigs) {
		if (config && typeof config === 'object' && 'rules' in config) {
			const { rules, ...restConfig } = config;
			const nonTailwindcssRules: Record<string, any> = {};

			if (rules) {
				for (const [ruleName, ruleConfig] of Object.entries(rules)) {
					if (ruleName.startsWith('tailwindcss/')) {
						extracted_tailwindcss_rules[ruleName] = ruleConfig;
					}
					else {
						nonTailwindcssRules[ruleName] = ruleConfig;
					}
				}
			}

			// Only add back the config if it has non-tailwindcss rules or other properties
			if (Object.keys(nonTailwindcssRules).length > 0 || Object.keys(restConfig).length > 0) {
				cleaned_user_configs.push({
					...restConfig,
					...(Object.keys(nonTailwindcssRules).length > 0 ? { rules: nonTailwindcssRules } : {}),
				});
			}
		}
		else {
			cleaned_user_configs.push(config);
		}
	}

	const typescript_options = resolve_sub_options(options, 'typescript');

	configs.push(
		ignores(options.ignores),
		javascript({
			overrides: get_overrides(options, 'javascript'),
		}),
		comments(),
		node(),
		jsdoc({
			stylistic: stylistic_options,
		}),
		imports({
			stylistic: stylistic_options,
		}),

		// Optional plugins (installed but not enabled by default)
		perfectionist(),
		morgan(),
	);

	if (enable_imports) {
		configs.push(
			imports(enable_imports === true
				? {
						stylistic: stylistic_options,
					}
				: {
						stylistic: stylistic_options,
						...enable_imports,
					}),
		);
	}

	if (enable_unicorn) {
		configs.push(unicorn(enable_unicorn === true ? {} : enable_unicorn));
	}

	if (enable_typescript) {
		configs.push(typescript({
			...typescript_options,
			componentExts,
			overrides: get_overrides(options, 'typescript'),
			type: options.type,
		}));
	}

	if (stylistic_options) {
		configs.push(stylistic({
			...stylistic_options,
			overrides: get_overrides(options, 'stylistic'),
		}));
	}

	if (enable_regexp) {
		configs.push(regexp(typeof enable_regexp === 'boolean' ? {} : enable_regexp));
	}

	if (options.test ?? true) {
		configs.push(test({
			overrides: get_overrides(options, 'test'),
		}));
	}

	if (enable_svelte) {
		configs.push(svelte({
			overrides: get_overrides(options, 'svelte'),
			stylistic: stylistic_options,
			typescript: !!enable_typescript,
		}));
	}

	if (enable_tailwindcss) {
		configs.push(tailwindcss({
			overrides: get_overrides(options, 'tailwindcss'),
			...(enable_svelte
				? {
						files: [GLOB_SVELTE],
						entryPoint: 'src/app.css',
					}
				: {}),
		}));
	}

	if (options.jsonc ?? true) {
		configs.push(
			jsonc({
				overrides: get_overrides(options, 'jsonc'),
				stylistic: stylistic_options,
			}),
			sort_package_json(),
			sort_ts_config(),
		);
	}

	if (enable_catalogs) {
		configs.push(
			pnpm(),
		);
	}

	if (options.yaml ?? true) {
		configs.push(yaml({
			overrides: get_overrides(options, 'yaml'),
			stylistic: stylistic_options,
		}));
	}

	if (options.toml ?? true) {
		configs.push(toml({
			overrides: get_overrides(options, 'toml'),
			stylistic: stylistic_options,
		}));
	}

	if (options.markdown ?? true) {
		configs.push(
			markdown(
				{
					componentExts,
					overrides: get_overrides(options, 'markdown'),
				},
			),
		);
	}

	configs.push(
		disables(),
	);

	if ('files' in options) {
		throw new Error('[@ariel/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');
	}

	// User can optionally pass a flat config item to the first argument
	// We pick the known keys as ESLint would do schema validation
	const merged_config = flat_config_props.reduce((acc, key) => {
		if (key in options)
			acc[key] = options[key] as any;
		return acc;
	}, {} as TypedFlatConfigItem);
	if (Object.keys(merged_config).length)
		configs.push([merged_config]);

	let composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();

	composer = composer
		.append(
			...configs,
			...cleaned_user_configs as any,
		);

	if (autoRenamePlugins) {
		composer = composer
			.renamePlugins(default_plugin_renaming);
	}

	if (is_in_editor) {
		composer = composer
			.disableRulesFix([
				'unused-imports/no-unused-imports',
				'test/no-only-tests',
				'prefer-const',
			], {
				builtinRules: () => import(['eslint', 'use-at-your-own-risk'].join('/')).then(r => r.builtinRules),
			});
	}

	return composer;
}

export type ResolvedOptions<T> = T extends boolean
	? never
	: NonNullable<T>;

export function resolve_sub_options<K extends keyof OptionsConfig>(
	options: OptionsConfig,
	key: K,
): ResolvedOptions<OptionsConfig[K]> {
	return typeof options[key] === 'boolean'
		? {} as any
		: options[key] || {} as any;
}

export function get_overrides<K extends keyof OptionsConfig>(
	options: OptionsConfig,
	key: K,
): Partial<Linter.RulesRecord & RuleOptions> {
	const sub = resolve_sub_options(options, key);
	return {
		...(options.overrides as any)?.[key],
		...'overrides' in sub
			? sub.overrides
			: {},
	};
}
