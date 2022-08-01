export type StringMethodParam = {
  type: 'string';
  name: string;
  description: string;
};

export type BooleanMethodParam = {
  type: 'boolean';
  name: string;
  description: string;
};

export type NumberMethodParam = {
  type: 'number';
  name: string;
  description: string;
};

export type EnumMethodParam = {
  type: 'enum';
  name: string;
  description: string;
  options: EnumMethodParamOption[];
};

export type EnumMethodParamOption = {
  name: string;
  description?: string;
};

export type ApiMethodParam =
  | StringMethodParam
  | BooleanMethodParam
  | NumberMethodParam
  | EnumMethodParam;

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
