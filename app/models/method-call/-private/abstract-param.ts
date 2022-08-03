import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedSet } from 'tracked-built-ins';

export default abstract class AbstractParam<T, V, I> {
  constructor(readonly info: T) {}

  @tracked inputValue: I | null | undefined;

  get value(): V | undefined {
    return this.parse(this.inputValue);
  }

  set value(newValue: V | undefined) {
    this.inputValue = this.format(newValue);
  }

  readonly errorSet = new TrackedSet<string>();

  get hasErrors(): boolean {
    return this.errorSet.size > 0;
  }

  @action validate(): boolean {
    this.errorSet.clear();
    this._validate();
    return this.errorSet.size === 0;
  }

  protected _validate(): void {
    // No-op by default. Override to add validations.
  }

  protected abstract parse(inputValue: I | undefined | null): V | undefined;

  protected abstract format(value: V | undefined): I | undefined;
}
