import type { RuleOptions } from './typegen';
import type { Awaitable, ConfigNames, OptionsConfig, TypedFlatConfigItem } from './types';
import type { Linter } from 'eslint';

import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { findUpSync } from 'find-up-simple';
import {
	baseline,
	comments,
	disables,
	ignores,
	imports,
	javascript,
	jsdoc,
	jsonc,
	jsx,
	markdown,
	morgan,
	nextjs,
	node,
	perfectionist,
	pnpm,
	react,
	regexp,
	solid,
	sort_package_json,
	sort_ts_config,
	stylistic,
	svelte,
	tailwindcss,
	test,
	toml,
	typescript,
	unicorn,
	yaml,
} from './configs';
import { has_nextjs, has_react, has_solid, has_svelte, has_tailwindcss, has_typescript, is_in_editor_env } from './env';
import { interop_default } from './utils';

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
	'@eslint-react': 'react',
	'@eslint-react/dom': 'react-dom',
	'@eslint-react/hooks-extra': 'react-hooks-extra',
	'@eslint-react/naming-convention': 'react-naming-convention',
	'@next/next': 'next',
	'@stylistic': 'style',
	'@typescript-eslint': 'ts',
	'baseline-js': 'baseline',
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
export function defineConfig(
	options: OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'> = {},
	...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]
): FlatConfigComposer<TypedFlatConfigItem, ConfigNames> {
	const {
		autoRenamePlugins = true,
		componentExts = [],
		baseline: enable_baseline = false,
		gitignore: enable_git_ignore = true,
		ignores: user_ignores = [],
		imports: enable_imports = true,
		jsdoc: enable_jsdoc = true,
		jsx: enable_jsx = has_react() || has_nextjs() || has_solid(),
		nextjs: enable_nextjs = has_nextjs(),
		node: enable_node = true,
		pnpm: enable_catalogs = !!findUpSync('pnpm-workspace.yaml'),
		react: enable_react = has_react(),
		regexp: enable_regexp = true,
		solid: enable_solid = has_solid(),
		svelte: enable_svelte = has_svelte(),
		tailwindcss: enable_tailwindcss = has_tailwindcss(),
		typescript: enable_typescript = has_typescript(),
		unicorn: enable_unicorn = true,
	} = options;

	const is_in_editor = is_in_editor_env();

	if (is_in_editor) {
		// eslint-disable-next-line no-console
		console.log('[@ariel-salgado/eslint-config] Detected running in editor, some rules are disabled.');
	}

	const stylistic_options = options.stylistic === false
		? false
		: typeof options.stylistic === 'object'
			? options.stylistic
			: {};

	if (stylistic_options && !('jsx' in stylistic_options))
		stylistic_options.jsx = typeof enable_jsx === 'object' ? true : enable_jsx;

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

	const typescript_options = resolve_sub_options(options, 'typescript');
	const tsconfig_path = 'tsconfigPath' in typescript_options ? typescript_options.tsconfigPath : undefined;

	configs.push(
		ignores(user_ignores),
		javascript({
			overrides: get_overrides(options, 'javascript'),
		}),
		comments(),
		perfectionist(),
		morgan(),
	);

	if (enable_node) {
		configs.push(
			node(),
		);
	}

	if (enable_jsdoc) {
		configs.push(
			jsdoc({
				stylistic: stylistic_options,
			}),
		);
	}

	if (enable_imports) {
		configs.push(
			imports({
				stylistic: stylistic_options,
				...resolve_sub_options(options, 'imports'),
			}),
		);
	}

	if (enable_unicorn) {
		configs.push(unicorn(enable_unicorn === true ? {} : enable_unicorn));
	}

	if (enable_jsx) {
		configs.push(jsx(enable_jsx === true ? {} : enable_jsx));
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

	if (enable_react) {
		configs.push(react({
			...typescript_options,
			...resolve_sub_options(options, 'react'),
			overrides: get_overrides(options, 'react'),
			tsconfigPath: tsconfig_path,
		}));
	}

	if (enable_nextjs) {
		configs.push(nextjs({
			overrides: get_overrides(options, 'nextjs'),
		}));
	}

	if (enable_solid) {
		configs.push(solid({
			overrides: get_overrides(options, 'solid'),
			tsconfigPath: tsconfig_path,
			typescript: !!enable_typescript,
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
			stylistic: stylistic_options,
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
			pnpm({
				json: options.jsonc !== false,
				yaml: options.yaml !== false,
				...resolve_sub_options(options, 'pnpm'),
			}),
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

	if (enable_baseline) {
		configs.push(baseline(enable_baseline));
	}

	configs.push(
		disables(),
	);

	if ('files' in options) {
		throw new Error('[@ariel-salgado/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');
	}

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
			...userConfigs as any,
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
