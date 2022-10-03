import type { RawMethodParams } from 'okapi/models/method';
import Method from 'okapi/models/method';

export interface ApiParams {
  id: string;
  name: string;
  providerIds: string[];
  methods: RawMethodParams[];
}

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
