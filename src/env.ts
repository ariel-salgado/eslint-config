import process from 'node:process';
import { isPackageExists } from 'local-pkg';

export function has_typescript(): boolean {
	return isPackageExists('typescript');
};

export function has_svelte(): boolean {
	return (
		isPackageExists('svelte')
		|| isPackageExists('@sveltejs/kit')
		|| isPackageExists('eslint-plugin-svelte')
	);
}

export function has_tailwindcss(): boolean {
	return (
		isPackageExists('tailwindcss')
		|| isPackageExists('@tailwindcss/vite')
	);
}

export function is_in_git_hooks_or_lint_staged(): boolean {
	return !!(
		process.env.GIT_PARAMS
		|| process.env.VSCODE_GIT_COMMAND
		|| process.env.npm_lifecycle_script?.startsWith('lint-staged')
	);
}

export function is_in_editor_env(): boolean {
	if (process.env.CI)
		return false;

	if (is_in_git_hooks_or_lint_staged())
		return false;

	return !!(
		process.env.VSCODE_PID
		|| process.env.VSCODE_CWD
		|| process.env.JETBRAINS_IDE
		|| process.env.VIM
		|| process.env.NVIM
	);
}
