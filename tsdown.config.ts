import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['./src/index.ts'],
	dts: {
		tsconfig: './tsconfig.json',
		tsgo: true,
	},
	shims: true,
	format: ['esm'],
	exports: true,
	inlineOnly: false,
});
