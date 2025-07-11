import type { Awaitable, TypedFlatConfigItem } from './types'

export async function combine(...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]): Promise<TypedFlatConfigItem[]> {
    const resolved = await Promise.all(configs)
    return resolved.flat()
}