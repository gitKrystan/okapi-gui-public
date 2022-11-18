import type Method from 'okapi/models/method';
import type { Param } from 'okapi/models/param/index';
import { makeParam } from 'okapi/models/param/index';

import type ServerService from 'okapi/services/server';

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
      for (const r of this.response) {
        r.value = response[r.info.name] as typeof r.value;
      }
    }
    return this;
  }
}
