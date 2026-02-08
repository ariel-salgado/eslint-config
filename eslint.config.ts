import { defineConfig } from './src';

const config = defineConfig({
	type: 'lib',
	baseline: {
		ignoreFeatures: ['top-level-await'],
	},
});

export default config;
