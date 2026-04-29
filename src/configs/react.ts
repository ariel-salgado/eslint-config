import type { OptionsFiles, OptionsReact, OptionsTypeScriptParserOptions, OptionsTypeScriptWithTypes, TypedFlatConfigItem } from '../types';

import { isPackageExists } from 'local-pkg';
import { GLOB_MARKDOWN, GLOB_SRC, GLOB_TS, GLOB_TSX } from '../globs';
import { ensure_packages, interop_default } from '../utils';

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
	options: OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes & OptionsReact & OptionsFiles = {},
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
		'react/no-leaked-conditional-rendering': 'error',
	};

	const [
		plugin_react,
		plugin_react_refresh,
	] = await Promise.all([
		interop_default(import('@eslint-react/eslint-plugin')),
		interop_default(import('eslint-plugin-react-refresh')),
	] as const);

	const is_allow_constant_export = react_refresh_allow_constant_export_packages.some(i => isPackageExists(i));
	const is_using_remix = remix_packages.some(i => isPackageExists(i));
	const is_using_react_router
		= react_router_packages.some(i => isPackageExists(i));
	const is_using_next = next_js_packages.some(i => isPackageExists(i));

	const plugins = plugin_react.configs.all.plugins!;

	return [
		{
			name: 'ariel/react/setup',
			plugins: {
				'react': plugins['@eslint-react'],
				'react-dom': plugins['@eslint-react/dom'],
				'react-naming-convention': plugins['@eslint-react/naming-convention'],
				'react-refresh': plugin_react_refresh,
				'react-rsc': plugins['@eslint-react/rsc'],
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
				...plugin_react.configs.recommended.rules,

				'react/prefer-namespace-import': 'error',

				// preconfigured rules from eslint-plugin-react-refresh https://github.com/ArnaudBarre/eslint-plugin-react-refresh/tree/main/src
				'react-refresh/only-export-components': [
					'error',
					{
						allowConstantExport: is_allow_constant_export,
						allowExportNames: [
							...(is_using_next
								? [
									// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
										'dynamic',
										'dynamicParams',
										'revalidate',
										'fetchCache',
										'runtime',
										'preferredRegion',
										'maxDuration',
										// https://nextjs.org/docs/app/api-reference/functions/generate-static-params
										'generateStaticParams',
										// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
										'metadata',
										'generateMetadata',
										// https://nextjs.org/docs/app/api-reference/functions/generate-viewport
										'viewport',
										'generateViewport',
										// https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata
										'generateImageMetadata',
										// https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
										'generateSitemaps',
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
		{
			files: filesTypeAware,
			name: 'ariel/react/typescript',
			rules: {
				// Disables rules that are already handled by TypeScript
				'react-dom/no-string-style-prop': 'off',
				'react-dom/no-unknown-property': 'off',
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
