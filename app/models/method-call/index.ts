import type { ApiMethodParam } from 'okapi/models/method';
import type Method from 'okapi/models/method';
import BooleanParam from 'okapi/models/method-call/-private/boolean-param';
import EnumParam from 'okapi/models/method-call/-private/enum-param';
import NumberParam from 'okapi/models/method-call/-private/number-param';
import StringParam from 'okapi/models/method-call/-private/string-param';
import type ServerService from 'okapi/services/server';

export { default as BooleanParam } from 'okapi/models/method-call/-private/boolean-param';
export { default as EnumParam } from 'okapi/models/method-call/-private/enum-param';
export { default as NumberParam } from 'okapi/models/method-call/-private/number-param';
export { default as StringParam } from 'okapi/models/method-call/-private/string-param';

export type Param = StringParam | BooleanParam | NumberParam | EnumParam;

function makeParam(info: ApiMethodParam): Param {
  switch (info.type) {
    case 'string':
      return new StringParam(info);
    case 'boolean':
      return new BooleanParam(info);
    case 'f32':
    case 'f64':
    case 'i8':
    case 'i16':
    case 'i32':
    case 'i64':
    case 'u8':
    case 'u16':
    case 'u32':
    case 'u64':
      return new NumberParam(info);
    case 'enum':
      return new EnumParam(info);
  }
}

export default class MethodCall {
  static from(method: Method): MethodCall {
    return new MethodCall(
      method,
      method.request.map(makeParam),
      method.response.map(makeParam)
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
    for (let r of this.request) {
      let fieldValid = r.validate();
      if (!fieldValid) {
        isValid = false;
      }
      if (r.value !== undefined) {
        request[r.info.name] = r.value;
      }
    }

    if (isValid) {
      let response = await server.call(this.method, request);
      this.response.forEach(
        (r) => (r.value = response[r.info.name] as typeof r.value)
      );
    }
    return this;
  }
}
