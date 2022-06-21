import Method, { MethodParams } from 'okapi/models/method';

export type ApiParams = {
  name: string;
  methods: MethodParams[];
};

export default class Api {
  static from({ name, methods }: ApiParams): Api {
    return new Api(name, methods.map(Method.from));
  }

  private constructor(readonly name: string, readonly methods: Method[]) {}

  get id(): string {
    return this.name;
  }
}
