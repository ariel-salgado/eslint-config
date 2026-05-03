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
