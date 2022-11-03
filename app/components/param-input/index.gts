import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ComponentLike } from '@glint/template';

import {
  BooleanParam,
  EnumParam,
  NumberParam,
  Param,
  StringParam,
} from 'okapi/models/param/index';
import BooleanInput from './boolean';
import EnumInput from './enum';
import NumberInput from './number';
import StringInput from './string';
import Validator from './validator';

export interface ParamSig<P extends Param> {
  Element: HTMLElement;
  Args: {
    id: string;
    param: P;
    readonly: boolean;
    onChange: (value: P['value']) => void;
  };
}

export interface OuterParamSig<P extends Param> {
  Element: HTMLElement;
  Args: Partial<ParamSig<P>['Args']> &
    Pick<ParamSig<P>['Args'], 'id' | 'param'>;
}

/**
 * Creates an input with validator appropriate for the param type.
 */
export default class ParamInput<P extends Param> extends Component<
  OuterParamSig<P>
> {
  <template>
    <Validator data-test-param-error={{@id}} @param={{@param}} as |validator|>
      {{#let (this.componentFor @param) as |Input|}}
        <Input
          ...attributes
          class={{if @param.hasErrors "u--invalid"}}
          @param={{@param}}
          @id={{@id}}
          @readonly={{this.readonly}}
          @onChange={{this.onChange}}
          {{validator}}
        />
      {{/let}}
    </Validator>
  </template>

  private componentFor(param: Param): ComponentLike<ParamSig<P>> {
    if (param instanceof BooleanParam) {
      return BooleanInput as ComponentLike<ParamSig<P>>;
    } else if (param instanceof EnumParam) {
      return EnumInput as ComponentLike<ParamSig<P>>;
    } else if (param instanceof NumberParam) {
      return NumberInput as ComponentLike<ParamSig<P>>;
    } else if (param instanceof StringParam) {
      return StringInput as ComponentLike<ParamSig<P>>;
    } else {
      assert(
        // @ts-expect-error While TS realizes that the type of `param` is
        // `never` here, it's not smart enough to know that we have handled all
        // of the potential types of `P` to not complain about missing return
        // statements.
        `Cannot determine component for param with type ${param.info.type}`
      );
    }
  }

  private get readonly(): boolean {
    return this.args.readonly ?? false;
  }

  @action private onChange(value: P['value']): void {
    this.args.onChange?.(value);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ParamInput: typeof ParamInput;
  }
}
