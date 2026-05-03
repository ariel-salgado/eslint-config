import type { RuleOptions } from './typegen';
import type { Awaitable, ConfigNames, OptionsConfig, TypedFlatConfigItem } from './types';
import type { Linter } from 'eslint';

import { FlatConfigComposer } from 'eslint-flat-config-utils';
import {
	comments,
	disables,
	e18e,
	ignores,
	imports,
	javascript,
	jsdoc,
	jsonc,
	markdown,
	morgan,
	node,
	perfectionist,
	pnpm,
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
import { regexp } from './configs/regexp';
import { has_pnpm_catalogs, has_svelte, has_tailwindcss, has_typescript, is_in_editor_env } from './env';
import { GLOB_MARKDOWN } from './globs';
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
	'better-tailwindcss': 'tailwindcss',
	'@stylistic': 'style',
	'@typescript-eslint': 'ts',
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
		e18e: enableE18e = true,
		gitignore: enableGitignore = true,
		ignores: userIgnores = [],
		imports: enableImports = true,
		jsdoc: enableJsdoc = true,
		node: enableNode = true,
		pnpm: enableCatalogs = has_pnpm_catalogs(),
		regexp: enableRegexp = true,
		svelte: enableSvelte = has_svelte(),
		tailwindcss: enableTailwindcss = has_tailwindcss(),
		type: appType = 'app',
		typescript: enableTypeScript = has_typescript(),
		unicorn: enableUnicorn = true,
	} = options;

	const is_in_editor = is_in_editor_env();

	const stylistic_options = options.stylistic === false
		? false
		: typeof options.stylistic === 'object'
			? options.stylistic
			: {};

	const configs: Awaitable<TypedFlatConfigItem[]>[] = [];

	if (enableGitignore) {
		if (typeof enableGitignore !== 'boolean') {
			configs.push(
				interop_default(import('eslint-config-flat-gitignore')).then(r => [r({
					name: 'ariel/gitignore',
					...enableGitignore,
				})]),
			);
		}
		else {
			configs.push(
				interop_default(import('eslint-config-flat-gitignore')).then(r => [r({
					name: 'ariel/gitignore',
					strict: false,
				})]),
			);
		}
	}

	const typescript_options = resolve_sub_options(options, 'typescript');

	configs.push(
		ignores(userIgnores, !enableTypeScript),
		javascript({
			overrides: get_overrides(options, 'javascript'),
		}),
		comments(),
		perfectionist(),
		morgan(),
	);

	if (enableNode) {
		configs.push(
			node(),
		);
	}

	if (enableJsdoc) {
		configs.push(
			jsdoc({
				stylistic: stylistic_options,
			}),
		);
	}

	if (enableImports) {
		configs.push(
			imports({
				stylistic: stylistic_options,
				...resolve_sub_options(options, 'imports'),
			}),
		);
	}

	if (enableE18e) {
		configs.push(
			e18e({
				...enableE18e === true ? {} : enableE18e,
			}),
		);
	}

	if (enableUnicorn) {
		configs.push(
			unicorn(enableUnicorn === true ? {} : enableUnicorn),
		);
	}

	if (enableTypeScript) {
		configs.push(
			typescript({
				...typescript_options,
				componentExts,
				overrides: get_overrides(options, 'typescript'),
				type: appType,
			}),
		);
	}

	if (stylistic_options) {
		configs.push(
			stylistic({
				...stylistic_options,
				overrides: get_overrides(options, 'stylistic'),
			}),
		);
	}

	if (enableRegexp) {
		configs.push(
			regexp(typeof enableRegexp === 'boolean' ? {} : enableRegexp),
		);
	}

	if (options.test ?? true) {
		configs.push(
			test({
				overrides: get_overrides(options, 'test'),
			}),
		);
	}

	if (enableSvelte) {
		configs.push(
			svelte({
				overrides: get_overrides(options, 'svelte'),
				stylistic: stylistic_options,
				typescript: !!enableTypeScript,
			}),
		);
	}

	if (enableTailwindcss) {
		configs.push(
			tailwindcss({
				overrides: get_overrides(options, 'tailwindcss'),
				stylistic: stylistic_options,
			}),
		);
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

	if (enableCatalogs) {
		const optionsPnpm = resolve_sub_options(options, 'pnpm');
		configs.push(
			pnpm({
				json: options.jsonc !== false,
				yaml: options.yaml !== false,
				...optionsPnpm,
			}),
		);
	}

	if (options.yaml ?? true) {
		configs.push(
			yaml({
				overrides: get_overrides(options, 'yaml'),
				stylistic: stylistic_options,
			}),
		);
	}

	if (options.toml ?? true) {
		configs.push(
			toml({
				overrides: get_overrides(options, 'toml'),
				stylistic: stylistic_options,
			}),
		);
	}

	if (options.markdown ?? true) {
		configs.push(
			markdown({
				componentExts,
				overrides: get_overrides(options, 'markdown'),
			}),
		);
	}

	configs.push(
		disables(),
	);

	if ('files' in options) {
		throw new Error('[@ariel-salgado/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');
	}

	const fused_config = flat_config_props.reduce((acc, key) => {
		if (key in options)
			acc[key] = options[key] as any;
		return acc;
	}, {} as TypedFlatConfigItem);
	if (Object.keys(fused_config).length)
		configs.push([fused_config]);

	let composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();

	composer = composer
		.append(
			...configs,
			...userConfigs as any,
		);

	if (options.markdown ?? true) {
		composer = composer.append({
			ignores: [GLOB_MARKDOWN],
		});
	}

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
