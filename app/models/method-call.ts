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

class MethodCallParam<T, V> {
  constructor(readonly info: T) {}

  @tracked value: V | undefined;
}

export class StringParam extends MethodCallParam<StringMethodParam, string> {}

export class BooleanParam extends MethodCallParam<
  BooleanMethodParam,
  boolean
> {}

export class NumberParam extends MethodCallParam<NumberMethodParam, number> {}

export class EnumParam extends MethodCallParam<
  EnumMethodParam,
  EnumMethodParamOption
> {}

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
    this.request.forEach((r) => {
      request[r.info.name] = r.value;
    });
    let response = await server.call(this.method, request);
    this.response.forEach(
      (r) => (r.value = response[r.info.name] as typeof r.value)
    );
    return this;
  }
}
