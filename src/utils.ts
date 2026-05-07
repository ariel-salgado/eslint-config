import type { Awaitable, TypedFlatConfigItem } from './types';

import process from 'node:process';

import { readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { isatty } from 'node:tty';
import { fileURLToPath } from 'node:url';
import { isPackageExists } from 'local-pkg';

const scope_url = fileURLToPath(new URL('.', import.meta.url));
const is_cwd_in_scope = isPackageExists('@ariel-salgado/eslint-config');

export const parser_plain = {
	meta: {
		name: 'parser-plain',
	},
	parseForESLint: (code: string) => ({
		ast: {
			body: [],
			comments: [],
			loc: { end: code.length, start: 0 },
			range: [0, code.length],
			tokens: [],
			type: 'Program',
		},
		scopeManager: null,
		services: { isPlain: true },
		visitorKeys: {
			Program: [],
		},
	}),
};

/**
 * Combine array and non-array configs into a single array.
 */
export async function combine(...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]): Promise<TypedFlatConfigItem[]> {
	const resolved = await Promise.all(configs);
	return resolved.flat();
}

/**
 * Rename plugin prefixes in a rule object.
 * Accepts a map of prefixes to rename.
 *
 * @example
 * ```ts
 * import { rename_rules } from '@ariel-salgado/eslint-config'
 *
 * export default [{
 *   rules: rename_rules(
 *     {
 *       '@typescript-eslint/indent': 'error'
 *     },
 *     { '@typescript-eslint': 'ts' }
 *   )
 * }]
 * ```
 */
export function rename_rules(
	rules: Record<string, any>,
	map: Record<string, string>,
): Record<string, any> {
	return Object.fromEntries(
		Object.entries(rules)
			.map(([key, value]) => {
				for (const [from, to] of Object.entries(map)) {
					if (key.startsWith(`${from}/`))
						return [to + key.slice(from.length), value];
				}
				return [key, value];
			}),
	);
}

/**
 * Rename plugin names in a flat configs array.
 *
 * @example
 * ```ts
 * import { rename_plugin_in_configs } from '@antfu/eslint-config'
 * import someConfigs from './some-configs'
 *
 * export default rename_plugin_in_configs(someConfigs, {
 *   '@typescript-eslint': 'ts',
 *   '@stylistic': 'style',
 * })
 * ```
 */
export function rename_plugin_in_configs(configs: TypedFlatConfigItem[], map: Record<string, string>): TypedFlatConfigItem[] {
	return configs.map((i) => {
		const clone = { ...i };
		if (clone.rules)
			clone.rules = rename_rules(clone.rules, map);
		if (clone.plugins) {
			clone.plugins = Object.fromEntries(
				Object.entries(clone.plugins)
					.map(([key, value]) => {
						if (key in map)
							return [map[key], value];
						return [key, value];
					}),
			);
		}
		return clone;
	});
}

export function to_array<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

export async function interop_default<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
	const resolved = await m;
	return (resolved as any).default || resolved;
}

export function is_package_in_scope(name: string): boolean {
	return isPackageExists(name, { paths: [scope_url] });
}

/**
 * Reliable TTY detection for both Node.js and Bun.
 * Bun returns `undefined` (not `false`) for `process.stdout.isTTY`, so
 * the `=== false` guard from the original code silently skips the check.
 * `tty.isatty(1)` is the correct cross-runtime approach.
 */
function is_interactive(): boolean {
	try {
		return isatty(1);
	}
	catch {
		// Fallback for environments where node:tty behaves unexpectedly.
		return !!process.stdout.isTTY;
	}
}

/**
 * Prompt the user with a yes/no question via node:readline.
 * This replaces @clack/prompts which has known broken behaviour on Bun
 * (stdin raw-mode issues, EPERM on fd:0, multi-prompt hangs).
 */
async function prompt_confirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(`\n◆  ${message} (y/N) `, (answer) => {
			rl.close();
			resolve(answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes');
		});
	});
}

export async function ensure_packages(packages: (string | undefined)[]): Promise<void> {
	if (process.env.CI || !is_interactive() || is_cwd_in_scope === false)
		return;

	const non_existing = packages.filter(i => i && !is_package_in_scope(i)) as string[];
	if (non_existing.length === 0)
		return;

	const msg = `${non_existing.length === 1 ? 'Package is' : 'Packages are'} required for this config: ${non_existing.join(', ')}. Do you want to install them?`;

	try {
		const confirmed = await prompt_confirm(msg);
		if (confirmed)
			await import('@antfu/install-pkg').then(i => i.installPackage(non_existing, { dev: true }));
	}
	catch {
		process.stderr.write(
			`\n[eslint-config] Could not prompt for missing packages. Please install manually: ${non_existing.join(', ')}\n\n`,
		);
	}
}

/**
 * Expand a single cwd pattern entry into concrete directory paths.
 *
 * Supports simple glob patterns ending with `/*` or `/**` by listing all
 * immediate subdirectories of the resolved base. Paths are normalised to
 * forward slashes so that the results are valid in ESLint glob patterns on
 * every OS.
 *
 * @example
 * expand_cwd_globs('./apps/*')      // → ['./apps/web', './apps/admin']
 * expand_cwd_globs('./packages/ui') // → ['./packages/ui']
 */
export function expand_cwd_globs(pattern: string): string[] {
	// Normalise to forward slashes once so every subsequent check is OS-agnostic.
	const normalized = pattern.replace(/\\/g, '/');

	if (!normalized.includes('*'))
		return [normalized];

	// `<base>/*` or `<base>/**` — expand to the immediate subdirectories of base.
	const star_idx = normalized.indexOf('*');
	const base = normalized.slice(0, star_idx).replace(/\/$/, '') || '.';

	try {
		return readdirSync(base, { withFileTypes: true })
			.filter(e => e.isDirectory())
			.map(e => `${base}/${e.name}`);
	}
	catch {
		// If the base dir does not exist yet (e.g. during initial setup), return
		// an empty list rather than crashing the entire ESLint config load.
		return [];
	}
}

/**
 * Normalise and expand a `cwd` value (string or array, optionally with glob
 * patterns) to a flat list of concrete directory paths using forward slashes.
 *
 * @example
 * resolve_cwd_list('.')                         // → ['.']
 * resolve_cwd_list('./apps/*')                  // → ['./apps/web', './apps/admin']
 * resolve_cwd_list(['./apps/*', './packages/*'])// → [...apps, ...packages]
 */
export function resolve_cwd_list(cwd: string | string[]): string[] {
	const raw = to_array(cwd);
	return raw.flatMap(expand_cwd_globs);
}
