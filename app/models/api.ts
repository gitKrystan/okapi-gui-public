import Method, { MethodParams } from 'okapi/models/method';

export type ApiParams = {
  id: string;
  name: string;
  providerIds: string[];
  methods: MethodParams[];
};

export default class Api {
  static from({ id, name, methods }: ApiParams): Api {
    return new Api(id, name, methods.map(Method.from));
  }

  private constructor(
    readonly id: string,
    readonly name: string,
    readonly methods: Method[]
  ) {}
}
