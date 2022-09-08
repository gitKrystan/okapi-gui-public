export interface StringMethodParam {
  type: 'string';
  name: string;
  description: string;
}

export interface BooleanMethodParam {
  type: 'boolean';
  name: string;
  description: string;
}

export interface NumberMethodParam {
  type:
    | 'f32'
    | 'f64'
    | 'i8'
    | 'i16'
    | 'i32'
    | 'i64'
    | 'u8'
    | 'u16'
    | 'u32'
    | 'u64';
  name: string;
  description: string;
}

export interface EnumMethodParam {
  type: 'enum';
  name: string;
  description: string;
  options: EnumMethodParamOption[];
}

export interface EnumMethodParamOption {
  name: string;
  description?: string;
}

export type ApiMethodParam =
  | StringMethodParam
  | BooleanMethodParam
  | NumberMethodParam
  | EnumMethodParam;

export interface MethodParams {
  name: string; // e.g. 'Notify'
  description: string; // e.g. 'Notifies a target with a message.
  request: ApiMethodParam[];
  response: ApiMethodParam[];
}

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
