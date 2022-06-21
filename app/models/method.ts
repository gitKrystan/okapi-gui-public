export type ApiMethodArg = {
  name: string; // e.g. 'target'
  description: string; // e.g. 'the body of the notification'
  type: 'string' | 'boolean';
};

export type MethodParams = {
  name: string; // e.g. 'Notify'
  request: ApiMethodArg[];
  response: ApiMethodArg[];
};

export default class Method {
  static from({ name, request, response }: MethodParams): Method {
    return new Method(name, request, response);
  }

  private constructor(
    readonly name: string,
    readonly request: ApiMethodArg[],
    readonly response: ApiMethodArg[]
  ) {}

  get id(): string {
    return this.name;
  }
}
