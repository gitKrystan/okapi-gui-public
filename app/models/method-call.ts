import { tracked } from '@glimmer/tracking';
import Method, { ApiMethodParam } from 'okapi/models/method';
import ServerService from 'okapi/services/server';

export class MethodCallParam {
  static from(info: ApiMethodParam): MethodCallParam {
    return new MethodCallParam(info);
  }

  private constructor(readonly info: ApiMethodParam) {}

  @tracked value: unknown;

  get inputValue(): string | null | undefined {
    let { value } = this;
    if (value === null || value === undefined) {
      return value;
    } else {
      return String(value);
    }
  }

  set inputValue(value: string | null | undefined) {
    // FIXME: parse non-string values. currently only handling string
    this.value = value;
  }
}

export default class MethodCall {
  static from(method: Method): MethodCall {
    return new MethodCall(
      method,
      method.request.map(MethodCallParam.from),
      method.response.map(MethodCallParam.from)
    );
  }

  private constructor(
    readonly method: Method,
    public request: MethodCallParam[],
    public response: MethodCallParam[]
  ) {}

  async call(server: ServerService): Promise<this> {
    let request: Record<string, unknown> = {};
    this.request.forEach((r) => {
      request[r.info.name] = r.value;
    });
    let response = await server.call(this.method, request);
    this.response.forEach((r) => (r.value = response[r.info.name]));
    return this;
  }
}
