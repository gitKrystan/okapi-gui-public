export type ApiMethodParam = {
  name: string; // e.g. 'target'
  description: string; // e.g. 'the body of the notification'
  type: 'string' | 'boolean';
};

export type MethodParams = {
  name: string; // e.g. 'Notify'
  description: string; // e.g. 'Notifies a target with a message.
  request: ApiMethodParam[];
  response: ApiMethodParam[];
};

export default class Method {
  static from({ name, description, request, response }: MethodParams): Method {
    return new Method(name, description, request, response);
  }

  private constructor(
    readonly name: string,
    readonly description: string,
    readonly request: ApiMethodParam[],
    readonly response: ApiMethodParam[]
  ) {}

  get id(): string {
    return this.name;
  }
}
