import type { RawParam } from 'okapi/models/param/index';

export interface RawMethodParams {
  name: string; // e.g. 'Notify'
  description: string; // e.g. 'Notifies a target with a message.
  request: RawParam[];
  response: RawParam[];
}

export default class Method {
  static from({
    name,
    description,
    request,
    response,
  }: RawMethodParams): Method {
    return new Method(name, description, request, response);
  }

  private constructor(
    readonly name: string,
    readonly description: string,
    readonly request: RawParam[],
    readonly response: RawParam[]
  ) {}

  get id(): string {
    return this.name;
  }
}
