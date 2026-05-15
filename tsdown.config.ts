import * as attw from '@arethetypeswrong/core';
import * as publint from 'publint';
import * as publint_utils from 'publint/utils';

import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	shims: true,
	exports: true,
	platform: 'node',
	entry: [
		'src/index.ts',
	],
	dts: {
		tsgo: true,
	},
	deps: {
		onlyBundle: [
			'eslint-visitor-keys',
			'@eslint-community/eslint-utils',
			'@typescript-eslint/utils',
			'@typescript-eslint/types',
			'@typescript-eslint/visitor-keys',
			'@typescript-eslint/scope-manager',
			'eslint-plugin-erasable-syntax-only',
			'cached-factory',
		],
	},
	publint: {
		module: [
			publint,
			publint_utils,
		],
	},
	attw: {
		profile: 'esm-only',
		module: attw,
	},
});
