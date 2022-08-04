import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedSet } from 'tracked-built-ins';

export default abstract class AbstractParam<T, V, I> {
  constructor(readonly info: T) {}

  @tracked _inputValue?: I;

  get inputValue(): I | undefined {
    return this._inputValue;
  }

  set inputValue(newValue: I | undefined) {
    this.errorSet.clear();
    this._inputValue = newValue;
  }

  /**
   * Parsed value. MAY BE INVALID. Call `validate` and check for errors before
   * doing anything dangerous with this value.
   */
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
    this.inputValue = this.normalize(this.inputValue);
    this._validate(this.inputValue, this.value);
    return this.errorSet.size === 0;
  }

  protected _validate(
    _normalizedInputValue: I | undefined,
    _value: V | undefined
  ): void {
    // No-op by default. Override to add validations.
  }

  /**
   * Normalizes the input value, e.g. removing extra spaces. Should not remove
   * invalid characters. The input value will be updated with the normalized
   * value.
   */
  protected abstract normalize(rawInputValue: I | undefined): I | undefined;

  /**
   * Parses the normalized input value into a value.
   *
   * NOTE: The value may not be valid.
   */
  protected abstract parse(normalizedInputValue: I | undefined): V | undefined;

  /**
   * Formats the value into an input value.
   */
  protected abstract format(value: V | undefined): I | undefined;
}
