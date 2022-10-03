import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedSet } from 'tracked-built-ins';

export default abstract class AbstractParam<
  Value,
  InputValue,
  Raw extends { value?: Value }
> {
  constructor(readonly info: Raw) {}

  get isDirty(): boolean {
    return this.info.value !== this.value;
  }

  @tracked _inputValue: InputValue | undefined = this.format(this.info.value);

  get inputValue(): InputValue | undefined {
    return this._inputValue;
  }

  set inputValue(newValue: InputValue | undefined) {
    this.errorSet.clear();
    this._inputValue = newValue;
  }

  /**
   * Parsed value. MAY BE INVALID. Call `validate` and check for errors before
   * doing anything dangerous with this value.
   */
  get value(): Value | undefined {
    return this.parse(this.inputValue);
  }

  set value(newValue: Value | undefined) {
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
    _normalizedInputValue: InputValue | undefined,
    _value: Value | undefined
  ): void {
    // No-op by default. Override to add validations.
  }

  /**
   * Normalizes the input value, e.g. removing extra spaces. Should not remove
   * invalid characters. The input value will be updated with the normalized
   * value.
   */
  protected abstract normalize(
    rawInputValue: InputValue | undefined
  ): InputValue | undefined;

  /**
   * Parses the normalized input value into a value.
   *
   * NOTE: The value may not be valid.
   */
  protected abstract parse(
    normalizedInputValue: InputValue | undefined
  ): Value | undefined;

  /**
   * Formats the value into an input value.
   */
  protected abstract format(value: Value | undefined): InputValue | undefined;
}
