export default class Project {
  constructor(readonly name: string) {}

  get id(): string {
    return this.name;
  }
}
