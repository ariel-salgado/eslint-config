import type { Linter } from 'eslint';
import type { RuleOptions } from './typegen';
import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';

export type Awaitable<T> = T | Promise<T>;

export interface Rules extends RuleOptions {}

export type TypedFlatConfigItem = Omit<Linter.Config<Linter.RulesRecord & Rules>, 'plugins'> & {
    plugins?: Record<string, any>
}

export interface OptionsStylistic {
    stylistic?: boolean | StylisticConfig
}

export interface StylisticConfig
    extends Pick<StylisticCustomizeOptions, 'indent' | 'quotes' | 'jsx' | 'semi'> {
}

export interface OptionsOverrides {
    overrides?: TypedFlatConfigItem['rules']
}