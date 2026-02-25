/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},
	ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
	plugins: ['@typescript-eslint', 'eslint-plugin-n8n-nodes-base'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:eslint-plugin-n8n-nodes-base/recommended',
	],
	rules: {
		'n8n-nodes-base/node-param-description-missing-from-dynamic-multi-options': 'off',
		'n8n-nodes-base/node-param-description-missing-from-dynamic-options': 'off',
	},
};
