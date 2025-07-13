import type { Linter } from 'eslint';
import type { RuleOptions } from './typegen';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';
import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';

export type Awaitable<T> = T | Promise<T>;

export interface Rules extends RuleOptions {}

export type TypedFlatConfigItem = Omit<Linter.Config<Linter.RulesRecord & Rules>, 'plugins'> & {
	plugins?: Record<string, any>;
};

export type OptionsTypescript
= (OptionsTypeScriptWithTypes & OptionsOverrides)
	| (OptionsTypeScriptParserOptions & OptionsOverrides);

export interface OptionsComponentExts {
	componentExts?: string[];
}

export interface OptionsUnicorn extends OptionsOverrides {
	allRecommended?: boolean;
}

export interface OptionsFiles {
	files?: string[];
}

export interface OptionsStylistic {
	stylistic?: boolean | StylisticConfig;
}

export interface StylisticConfig
	extends Pick<StylisticCustomizeOptions, 'indent' | 'quotes' | 'semi'> {
}

export interface StylisticOptions extends StylisticConfig, OptionsOverrides {};

export interface TailwindCSSOptions extends OptionsOverrides {
	entryPoint?: string;
};

export interface OptionsOverrides {
	overrides?: TypedFlatConfigItem['rules'];
}

export interface OptionsProjectType {
	type?: 'app' | 'lib';
}

export interface OptionsRegExp {
	level?: 'error' | 'warn';
}

export interface OptionsHasTypeScript {
	typescript?: boolean;
}

export interface OptionsHasTailwindCSS {
	tailwindcss?: boolean;
}

export interface OptionsTypeScriptParserOptions {
	parserOptions?: Partial<ParserOptions>;
	filesTypeAware?: string[];
	ignoresTypeAware?: string[];
};

export interface OptionsTypeScriptWithTypes {
	tsconfigPath?: string;
	OverridesTypeAware?: TypedFlatConfigItem['rules'];
}

export interface OptionsConfig extends OptionsComponentExts, OptionsProjectType {
	/**
	 * Enable gitignore support.
	 *
	 * Passing an object to configure the options.
	 *
	 * @see https://github.com/antfu/eslint-config-flat-gitignore
	 * @default true
	 */
	gitignore?: boolean | FlatGitignoreOptions;

	/**
	 * Core rules. Can't be disabled.
	 */
	javascript?: OptionsOverrides;

	/**
	 * Enable TypeScript support.
	 *
	 * Passing an object to enable TypeScript Language Server support.
	 *
	 * @default auto-detect based on the dependencies
	 */
	typescript?: boolean | OptionsTypescript;

	/**
	 * Options for eslint-plugin-unicorn.
	 *
	 * @default true
	 */
	unicorn?: boolean | OptionsUnicorn;

	/**
	 * Options for eslint-plugin-import-lite.
	 *
	 * @default true
	 */
	imports?: boolean | OptionsOverrides;

	/**
	 * Enable test support.
	 *
	 * @default true
	 */
	test?: boolean | OptionsOverrides;

	/**
	 * Enable JSONC support.
	 *
	 * @default true
	 */
	jsonc?: boolean | OptionsOverrides;

	/**
	 * Enable YAML support.
	 *
	 * @default true
	 */
	yaml?: boolean | OptionsOverrides;

	/**
	 * Enable TOML support.
	 *
	 * @default true
	 */
	toml?: boolean | OptionsOverrides;

	/**
	 * Enable linting for **code snippets** in Markdown.
	 *
	 * For formatting Markdown content, enable also `formatters.markdown`.
	 *
	 * @default true
	 */
	markdown?: boolean | OptionsOverrides;

	/**
	 * Enable stylistic rules.
	 *
	 * @see https://eslint.style/
	 * @default true
	 */
	stylistic?: boolean | (StylisticConfig & OptionsOverrides);

	/**
	 * Enable regexp rules.
	 *
	 * @see https://ota-meshi.github.io/eslint-plugin-regexp/
	 * @default true
	 */
	regexp?: boolean | (OptionsRegExp & OptionsOverrides);

	/**
	 * Enable svelte rules.
	 *
	 * Requires installing:
	 * - `eslint-plugin-svelte`
	 *
	 * @default false
	 */
	svelte?: boolean | OptionsOverrides;

	/**
	 * Enable tailwindcss rules.
	 *
	 * Requires installing:
	 * - `eslint-plugin-better-tailwindcss`
	 *
	 * @default false
	 */
	tailwindcss?: boolean | TailwindCSSOptions;

	/**
	 * Enable pnpm (workspace/catalogs) support.
	 *
	 * Currently it's disabled by default, as it's still experimental.
	 * In the future it will be smartly enabled based on the project usage.
	 *
	 * @see https://github.com/antfu/pnpm-workspace-utils
	 * @experimental
	 * @default false
	 */
	pnpm?: boolean;

	/**
	 * Control to disable some rules in editors.
	 * @default auto-detect based on the process.env
	 */
	isInEditor?: boolean;

	/**
	 * Automatically rename plugins in the config.
	 *
	 * @default true
	 */
	autoRenamePlugins?: boolean;

	/**
	 * Provide overrides for rules for each integration.
	 *
	 * @deprecated use `overrides` option in each integration key instead
	 */
	overrides?: {
		stylistic?: TypedFlatConfigItem['rules'];
		javascript?: TypedFlatConfigItem['rules'];
		typescript?: TypedFlatConfigItem['rules'];
		test?: TypedFlatConfigItem['rules'];
		vue?: TypedFlatConfigItem['rules'];
		jsonc?: TypedFlatConfigItem['rules'];
		markdown?: TypedFlatConfigItem['rules'];
		yaml?: TypedFlatConfigItem['rules'];
		toml?: TypedFlatConfigItem['rules'];
		react?: TypedFlatConfigItem['rules'];
		svelte?: TypedFlatConfigItem['rules'];
	};
}
