import type { ConfigNames, RuleOptions } from './typegen';
import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';
import type { ConfigWithExtends } from 'eslint-flat-config-utils';

export type Awaitable<T> = T | Promise<T>;

export type Rules = Record<string, Linter.RuleEntry<any> | undefined> & RuleOptions;

export type { ConfigNames, RuleOptions };

/**
 * An updated version of ESLint's `Linter.Config`, which provides autocompletion
 * for `rules` and relaxes type limitations for `plugins` and `rules`, because
 * many plugins still lack proper type definitions.
 */
export type TypedFlatConfigItem = Omit<ConfigWithExtends, 'plugins' | 'rules'> & {
	/**
	 * An object containing a name-value mapping of plugin names to plugin objects.
	 * When `files` is specified, these plugins are only available to the matching files.
	 *
	 * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
	 */
	plugins?: Record<string, any>;

	/**
	 * An object containing the configured rules. When `files` or `ignores` are
	 * specified, these rule configurations are only available to the matching files.
	 */
	rules?: Rules;
};

export interface OptionsFiles {
	/**
	 * Override the `files` option to provide custom globs.
	 */
	files?: string[];
}

export type OptionsTypescript
	= (OptionsTypeScriptWithTypes & OptionsOverrides & OptionsTypeScriptErasableOnly)
		| (OptionsTypeScriptParserOptions & OptionsOverrides & OptionsTypeScriptErasableOnly);

export interface OptionsComponentExts {
	/**
	 * Additional extensions for components.
	 *
	 * @example ['vue']
	 * @default []
	 */
	componentExts?: string[];
}

export interface OptionsE18e extends OptionsOverrides {
	/**
	 * Include modernization rules
	 *
	 * @see https://github.com/e18e/eslint-plugin#modernization
	 * @default true
	 */
	modernization?: boolean;
	/**
	 * Include module replacements rules
	 *
	 * @see https://github.com/e18e/eslint-plugin#module-replacements
	 * @default type === 'lib' && isInEditor
	 */
	moduleReplacements?: boolean;
	/**
	 * Include performance improvements rules
	 *
	 * @see https://github.com/e18e/eslint-plugin#performance-improvements
	 * @default true
	 */
	performanceImprovements?: boolean;
}

export interface OptionsUnicorn extends OptionsOverrides {
	/**
	 * Include all rules recommended by `eslint-plugin-unicorn`, instead of only ones picked by Anthony.
	 *
	 * @default false
	 */
	allRecommended?: boolean;
}

export interface OptionsMarkdown extends OptionsOverrides {
	/**
	 * Enable GFM (GitHub Flavored Markdown) support.
	 *
	 * @default true
	 */
	gfm?: boolean;

	/**
	 * Override rules for markdown itself.
	 */
	overridesMarkdown?: TypedFlatConfigItem['rules'];
}

export interface OptionsTypeScriptParserOptions {
	/**
	 * Additional parser options for TypeScript.
	 */
	parserOptions?: Partial<ParserOptions>;

	/**
	 * Glob patterns for files that should be type aware.
	 * @default ['**\/*.{ts,tsx}']
	 */
	filesTypeAware?: string[];

	/**
	 * Glob patterns for files that should not be type aware.
	 * @default ['**\/*.md\/**', '**\/*.astro/*.ts']
	 */
	ignoresTypeAware?: string[];
}

export interface OptionsTypeScriptWithTypes {
	/**
	 * When this options is provided, type aware rules will be enabled.
	 * @see https://typescript-eslint.io/linting/typed-linting/
	 */
	tsconfigPath?: string;

	/**
	 * Override type aware rules.
	 */
	overridesTypeAware?: TypedFlatConfigItem['rules'];
}

export interface OptionsHasTypeScript {
	typescript?: boolean;
}

export interface OptionsStylistic {
	stylistic?: boolean | StylisticConfig;
}

export interface StylisticConfig
	extends Pick<StylisticCustomizeOptions, 'indent' | 'quotes' | 'semi' | 'experimental'> {
}

export interface OptionsHasTailwindCSS extends OptionsOverrides {
	tailwindcss?: boolean;
}

export interface TailwindCSSOptions {
	entryPoint?: string;
	printWidth?: number;
	cwd?: string;
}

export interface OptionsOverrides {
	overrides?: TypedFlatConfigItem['rules'];
}

export interface OptionsProjectType {
	/**
	 * Type of the project. `lib` will enable more strict rules for libraries.
	 *
	 * @default 'app'
	 */
	type?: 'app' | 'lib';
}

export interface OptionsTypeScriptErasableOnly {
	/**
	 * Enable erasable syntax only rules.
	 *
	 * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only
	 * @default false
	 */
	erasableOnly?: boolean;
}

export interface OptionsRegExp {
	/**
	 * Override rulelevels
	 */
	level?: 'error' | 'warn';
}

export interface OptionsPnpm {
	/**
	 * Requires catalogs usage
	 *
	 * Detects automatically based if `catalogs` is used in the pnpm-workspace.yaml file
	 */
	catalogs?: boolean;

	/**
	 * Enable linting for package.json, will install the jsonc parser
	 *
	 * @default true
	 */
	json?: boolean;

	/**
	 * Enable linting for pnpm-workspace.yaml, will install the yaml parser
	 *
	 * @default true
	 */
	yaml?: boolean;

	/**
	 * Sort entries in pnpm-workspace.yaml
	 *
	 * @default false
	 */
	sort?: boolean;
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
	 * Extend the global ignores.
	 *
	 * Passing an array to extends the ignores.
	 * Passing a function to modify the default ignores.
	 *
	 * @default []
	 */
	ignores?: string[] | ((originals: string[]) => string[]);

	/**
	 * Core rules. Can't be disabled.
	 */
	javascript?: OptionsOverrides;

	/**
	 * Enable Node.js rules
	 *
	 * @default true
	 */
	node?: boolean;

	/**
	 * Enable JSDoc rules
	 *
	 * @default true
	 */
	jsdoc?: boolean;

	/**
	 * Enable TypeScript support.
	 *
	 * Passing an object to enable TypeScript Language Server support.
	 *
	 * @default auto-detect based on the dependencies
	 */
	typescript?: boolean | OptionsTypescript;

	/**
	 * Options for [@e18e/eslint-plugin](https://github.com/e18e/eslint-plugin)
	 *
	 * @default true
	 */
	e18e?: boolean | OptionsE18e;

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
	 * Enable linting for **code snippets** in Markdown and the markdown content itself.
	 *
	 * For formatting Markdown content, enable also `formatters.markdown`.
	 *
	 * @default true
	 */
	markdown?: boolean | OptionsMarkdown;

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
	tailwindcss?: boolean | OptionsHasTailwindCSS;

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
	pnpm?: boolean | OptionsPnpm;

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
		jsonc?: TypedFlatConfigItem['rules'];
		markdown?: TypedFlatConfigItem['rules'];
		yaml?: TypedFlatConfigItem['rules'];
		toml?: TypedFlatConfigItem['rules'];
		svelte?: TypedFlatConfigItem['rules'];
	};
}
