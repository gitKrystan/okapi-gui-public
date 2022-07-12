import { tracked } from '@glimmer/tracking';
import Method, { ApiMethodParam } from 'okapi/models/method';
import ServerService from 'okapi/services/server';

class MethodCallParam<T> {
  constructor(readonly info: ApiMethodParam) {}

  @tracked value: T | undefined;
}

export class StringParam extends MethodCallParam<string> {}

/**
 * Type guard for StringParam
 */
export function isStringParam(param: unknown): param is StringParam {
  return param instanceof StringParam;
}

export class BooleanParam extends MethodCallParam<boolean> {}

/**
 * Type guard for StringParam
 */
export function isBooleanParam(param: unknown): param is BooleanParam {
  return param instanceof BooleanParam;
}

export type Param = StringParam | BooleanParam;

function makeMethodCallParam(info: ApiMethodParam): Param {
  switch (info.type) {
    case 'string':
      return new StringParam(info);
    case 'boolean':
      return new BooleanParam(info);
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
