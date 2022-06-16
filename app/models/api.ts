export type ApiParams = {
  name: string;
  methods: unknown[];
};

export default class Api {
  static from({ name, methods }: ApiParams): Api {
    return new Api(name, methods);
  }

  private constructor(readonly name: string, readonly methods: unknown[]) {}

  get id(): string {
    return this.name;
  }
}
