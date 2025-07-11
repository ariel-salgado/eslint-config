import type { TypedFlatConfigItem } from '../types';

import { plugin_morgan } from '../plugins';

export async function morgan(): Promise<TypedFlatConfigItem[]> {
    return [
        {
            name: 'ariel/morgan',
            plugins: {
                morgan: plugin_morgan
            },
            rules: {
                'morgan/no-negated-conjunction': 'error',
                'morgan/no-negated-disjunction': 'error'
            }
        }
    ];
}