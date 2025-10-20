import type { Awaitable, TypedFlatConfigItem } from './types';

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

export async function combine(...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]): Promise<TypedFlatConfigItem[]> {
	const resolved = await Promise.all(configs);
	return resolved.flat();
}

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

export async function ensure_packages(packages: (string | undefined)[]): Promise<void> {
	if (process.env.CI || process.stdout.isTTY === false || is_cwd_in_scope === false)
		return;

	const non_existing_packages = packages.filter(i => i && !is_package_in_scope(i)) as string[];
	if (non_existing_packages.length === 0)
		return;

	const p = await import('@clack/prompts');
	const result = await p.confirm({
		message: `${non_existing_packages.length === 1 ? 'Package is' : 'Packages are'} required for this config: ${non_existing_packages.join(', ')}. Do you want to install them?`,
	});
	if (result)
		await import('@antfu/install-pkg').then(i => i.installPackage(non_existing_packages, { dev: true }));
}
