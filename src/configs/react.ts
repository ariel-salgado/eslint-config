import type { OptionsFiles, OptionsOverrides, TypedFlatConfigItem, OptionsTypeScriptWithTypes, OptionsTypeScriptParserOptions } from '../types';

import { isPackageExists } from 'local-pkg';

import { ensure_packages, interop_default } from '../utils';
import { GLOB_TS, GLOB_SRC, GLOB_TSX, GLOB_MARKDOWN } from '../globs';

const react_refresh_allow_constant_export_packages = [
	'vite',
];

const remix_packages = [
	'@remix-run/node',
	'@remix-run/react',
	'@remix-run/serve',
	'@remix-run/dev',
];
const react_router_packages = [
	'@react-router/node',
	'@react-router/react',
	'@react-router/serve',
	'@react-router/dev',
];

const next_js_packages = [
	'next',
];

export async function react(
	options: OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes & OptionsOverrides & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
	const {
		files = [GLOB_SRC],
		filesTypeAware = [GLOB_TS, GLOB_TSX],
		ignoresTypeAware = [
			`${GLOB_MARKDOWN}/**`,
		],
		overrides = {},
		tsconfigPath,
	} = options;

	await ensure_packages([
		'@eslint-react/eslint-plugin',
		'eslint-plugin-react-hooks',
		'eslint-plugin-react-refresh',
	]);

	const is_type_aware = !!tsconfigPath;

	const type_aware_rules: TypedFlatConfigItem['rules'] = {
		'react/no-leaked-conditional-rendering': 'warn',
	};

	const [
		plugin_react,
		plugin_react_hooks,
		plugin_react_refresh,
	] = await Promise.all([
		interop_default(import('@eslint-react/eslint-plugin')),
		interop_default(import('eslint-plugin-react-hooks')),
		interop_default(import('eslint-plugin-react-refresh')),
	] as const);

	const is_allow_constant_export = react_refresh_allow_constant_export_packages.some(i => isPackageExists(i));
	const is_using_remix = remix_packages.some(i => isPackageExists(i));
	const is_using_react_router
		= react_router_packages.some(i => isPackageExists(i));
	const is_using_next = next_js_packages.some(i => isPackageExists(i));

	const plugins = (plugin_react.configs.all as any).plugins;

	return [
		{
			name: 'ariel/react/setup',
			plugins: {
				'react': plugins['@eslint-react'],
				'react-dom': plugins['@eslint-react/dom'],
				'react-hooks': plugin_react_hooks,
				'react-hooks-extra': plugins['@eslint-react/hooks-extra'],
				'react-naming-convention': plugins['@eslint-react/naming-convention'],
				'react-refresh': plugin_react_refresh,
				'react-web-api': plugins['@eslint-react/web-api'],
			},
		},
		{
			files,
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
				},
				sourceType: 'module',
			},
			name: 'ariel/react/rules',
			rules: {
				// recommended rules from eslint-plugin-react-x https://eslint-react.xyz/docs/rules/overview#core-rules
				'react/jsx-no-comment-textnodes': 'warn',
				'react/jsx-no-duplicate-props': 'warn',
				'react/jsx-uses-vars': 'warn',
				'react/no-access-state-in-setstate': 'error',
				'react/no-array-index-key': 'warn',
				'react/no-children-count': 'warn',
				'react/no-children-for-each': 'warn',
				'react/no-children-map': 'warn',
				'react/no-children-only': 'warn',
				'react/no-children-to-array': 'warn',
				'react/no-clone-element': 'warn',
				'react/no-component-will-mount': 'error',
				'react/no-component-will-receive-props': 'error',
				'react/no-component-will-update': 'error',
				'react/no-context-provider': 'warn',
				'react/no-create-ref': 'error',
				'react/no-default-props': 'error',
				'react/no-direct-mutation-state': 'error',
				'react/no-duplicate-key': 'warn',
				'react/no-forward-ref': 'warn',
				'react/no-implicit-key': 'warn',
				'react/no-missing-key': 'error',
				'react/no-nested-component-definitions': 'error',
				'react/no-prop-types': 'error',
				'react/no-redundant-should-component-update': 'error',
				'react/no-set-state-in-component-did-mount': 'warn',
				'react/no-set-state-in-component-did-update': 'warn',
				'react/no-set-state-in-component-will-update': 'warn',
				'react/no-string-refs': 'error',
				'react/no-unnecessary-use-prefix': 'warn',
				'react/no-unsafe-component-will-mount': 'warn',
				'react/no-unsafe-component-will-receive-props': 'warn',
				'react/no-unsafe-component-will-update': 'warn',
				'react/no-unstable-context-value': 'warn',
				'react/no-unstable-default-props': 'warn',
				'react/no-unused-class-component-members': 'warn',
				'react/no-unused-state': 'warn',
				'react/no-use-context': 'warn',
				'react/no-useless-forward-ref': 'warn',
				'react/prefer-use-state-lazy-initialization': 'warn',

				// recommended rules from eslint-plugin-react-dom https://eslint-react.xyz/docs/rules/overview#dom-rules
				'react-dom/no-dangerously-set-innerhtml': 'warn',
				'react-dom/no-dangerously-set-innerhtml-with-children': 'error',
				'react-dom/no-find-dom-node': 'error',
				'react-dom/no-flush-sync': 'error',
				'react-dom/no-hydrate': 'error',
				'react-dom/no-missing-button-type': 'warn',
				'react-dom/no-missing-iframe-sandbox': 'warn',
				'react-dom/no-namespace': 'error',
				'react-dom/no-render': 'error',
				'react-dom/no-render-return-value': 'error',
				'react-dom/no-script-url': 'warn',
				'react-dom/no-unsafe-iframe-sandbox': 'warn',
				'react-dom/no-unsafe-target-blank': 'warn',
				'react-dom/no-use-form-state': 'error',
				'react-dom/no-void-elements-with-children': 'error',

				// recommended rules eslint-plugin-react-hooks https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks/src/rules
				...plugin_react_hooks.configs.recommended.rules,

				// recommended rules from eslint-plugin-react-hooks-extra https://eslint-react.xyz/docs/rules/overview#hooks-extra-rules
				'react-hooks-extra/no-direct-set-state-in-use-effect': 'warn',

				// recommended rules from eslint-plugin-react-web-api https://eslint-react.xyz/docs/rules/overview#web-api-rules
				'react-web-api/no-leaked-event-listener': 'warn',
				'react-web-api/no-leaked-interval': 'warn',
				'react-web-api/no-leaked-resize-observer': 'warn',
				'react-web-api/no-leaked-timeout': 'warn',

				// preconfigured rules from eslint-plugin-react-refresh https://github.com/ArnaudBarre/eslint-plugin-react-refresh/tree/main/src
				'react-refresh/only-export-components': [
					'warn',
					{
						allowConstantExport: is_allow_constant_export,
						allowExportNames: [
							...(is_using_next
								? [
										'dynamic',
										'dynamicParams',
										'revalidate',
										'fetchCache',
										'runtime',
										'preferredRegion',
										'maxDuration',
										'config',
										'generateStaticParams',
										'metadata',
										'generateMetadata',
										'viewport',
										'generateViewport',
									]
								: []),
							...(is_using_remix || is_using_react_router
								? [
										'meta',
										'links',
										'headers',
										'loader',
										'action',
										'clientLoader',
										'clientAction',
										'handle',
										'shouldRevalidate',
									]
								: []),
						],
					},
				],
				...overrides,
			},
		},
		...is_type_aware
			? [{
					files: filesTypeAware,
					ignores: ignoresTypeAware,
					name: 'ariel/react/type-aware-rules',
					rules: {
						...type_aware_rules,
					},
				}]
			: [],
	];
}
