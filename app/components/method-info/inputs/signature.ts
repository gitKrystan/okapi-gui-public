import { Param } from 'okapi/models/method-call';

export default interface ParamSig<T extends Param> {
  Element: HTMLElement;
  Args: {
    id: string;
    param: T;
    readonly: boolean;
  };
}
