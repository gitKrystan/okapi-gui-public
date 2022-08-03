import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Method, {
  ApiMethodParam,
  BooleanMethodParam,
  EnumMethodParam,
  EnumMethodParamOption,
  NumberMethodParam,
  StringMethodParam,
} from 'okapi/models/method';
import ServerService from 'okapi/services/server';
import { squish } from 'okapi/utils/string-util';
import { TrackedSet } from 'tracked-built-ins';

abstract class MethodCallParam<T, V, I> {
  constructor(readonly info: T) {}

  @tracked inputValue: I | null | undefined;

  get value(): V | undefined {
    return this.parse(this.inputValue);
  }

  set value(newValue: V | undefined) {
    this.inputValue = this.format(newValue);
  }

  readonly errorSet = new TrackedSet<string>();

  get hasErrors(): boolean {
    return this.errorSet.size > 0;
  }

  @action validate(): boolean {
    this.errorSet.clear();
    this._validate();
    return this.errorSet.size === 0;
  }

  protected _validate(): void {
    // No-op by default. Override to add validations.
  }

  protected abstract parse(inputValue: I | undefined | null): V | undefined;

  protected abstract format(value: V | undefined): I | undefined;
}

export class StringParam extends MethodCallParam<
  StringMethodParam,
  string,
  string
> {
  protected parse(inputValue: string | undefined | null): string | undefined {
    return squish(inputValue) || undefined;
  }

  protected format(value: string | undefined): string | undefined {
    return value;
  }
}

export class BooleanParam extends MethodCallParam<
  BooleanMethodParam,
  boolean,
  boolean
> {
  protected parse(inputValue: boolean | undefined | null): boolean | undefined {
    return inputValue ?? undefined;
  }

  protected format(value: boolean | undefined): boolean | undefined {
    return value;
  }
}

// NOTE: Value maybe be NaN or an otherwise invalid number but `validate` will fail in this case.
export class NumberParam extends MethodCallParam<
  NumberMethodParam,
  number,
  string
> {
  private pattern = '^[-,0-9.]+$';

  _validate(): void {
    if (this.value !== undefined && isNaN(this.value)) {
      this.errorSet.add('Value is not a number');
    }

    if (this.inputValue) {
      let pattern = new RegExp(this.pattern);
      if (!pattern.test(this.inputValue)) {
        // TODO: Be more specific re: float, integer, signed, etc
        this.errorSet.add('Value contains invalid characters');
      }
    }
  }

  protected parse(inputValue: string | undefined | null): number | undefined {
    if (inputValue) {
      inputValue = squish(inputValue);
      let sign = inputValue.startsWith('-') ? -1 : 1;
      inputValue = inputValue.replace(/[^0-9.]/g, ''); // remove non-numeric characters
      return sign * parseFloat(inputValue);
    } else {
      return undefined;
    }
  }

  protected format(value: number | undefined): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    } else {
      return value.toLocaleString();
    }
  }
}

export class EnumParam extends MethodCallParam<
  EnumMethodParam,
  EnumMethodParamOption,
  EnumMethodParamOption
> {
  protected parse(
    inputValue: EnumMethodParamOption | undefined
  ): EnumMethodParamOption | undefined {
    return inputValue;
  }

  protected format(
    value: EnumMethodParamOption | undefined
  ): EnumMethodParamOption | undefined {
    return value;
  }
}

export type Param = StringParam | BooleanParam | NumberParam | EnumParam;

function makeMethodCallParam(info: ApiMethodParam): Param {
  switch (info.type) {
    case 'string':
      return new StringParam(info);
    case 'boolean':
      return new BooleanParam(info);
    case 'number':
      return new NumberParam(info);
    case 'enum':
      return new EnumParam(info);
  }
}

export default class MethodCall {
  static from(method: Method): MethodCall {
    return new MethodCall(
      method,
      method.request.map(makeMethodCallParam),
      method.response.map(makeMethodCallParam)
    );
  }

  private constructor(
    readonly method: Method,
    public request: Param[],
    public response: Param[]
  ) {}

  async call(server: ServerService): Promise<this> {
    let request: Record<string, unknown> = {};
    let isValid = true;
    this.request.forEach((r) => {
      let fieldValid = r.validate();
      if (!fieldValid) {
        isValid = false;
      }
      if (r.value !== undefined) {
        request[r.info.name] = r.value;
      }
    });

    if (isValid) {
      let response = await server.call(this.method, request);
      this.response.forEach(
        (r) => (r.value = response[r.info.name] as typeof r.value)
      );
    }
    return this;
  }
}
