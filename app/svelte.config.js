import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		experimental: { remoteFunctions: true }
	},
	vitePlugin: { 
		inspector: {
			toggleKeyCombo: 'alt-x',
      		showToggleButton: 'always',
      		toggleButtonPos: 'bottom-right'
		}
	},
	compilerOptions: { experimental: { async: true } }
};

export default config;
