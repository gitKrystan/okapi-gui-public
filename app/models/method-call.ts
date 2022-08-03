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
import { TrackedSet } from 'tracked-built-ins';

abstract class MethodCallParam<T, V> {
  constructor(readonly info: T) {}

  @tracked value: V | undefined;

  readonly errorSet = new TrackedSet<string>();

  @action validate(): boolean {
    this.errorSet.clear();
    this._validate();
    return this.errorSet.size === 0;
  }

  protected abstract _validate(): void;
}

export class StringParam extends MethodCallParam<StringMethodParam, string> {
  _validate(): void {
    if (typeof this.value !== 'string') {
      this.errorSet.add('Must supply a string value');
    }
  }
}

export class BooleanParam extends MethodCallParam<BooleanMethodParam, boolean> {
  _validate(): void {
    if (typeof this.value !== 'boolean') {
      this.errorSet.add('Must supply a boolean value');
    }
  }
}

export class NumberParam extends MethodCallParam<NumberMethodParam, number> {
  _validate(): void {
    if (typeof this.value !== 'number') {
      this.errorSet.add('Must supply a number value');
    }
  }
}

export class EnumParam extends MethodCallParam<
  EnumMethodParam,
  EnumMethodParamOption
> {
  _validate(): void {
    if (!this.value) {
      this.errorSet.add('Must choose a value');
    }
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
      request[r.info.name] = r.value;
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
