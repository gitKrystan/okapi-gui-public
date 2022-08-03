import { NumberMethodParam } from 'okapi/models/method';
import { squish } from 'okapi/utils/string-util';
import AbstractParam from './abstract-param';

export { default as Boolean } from 'okapi/models/method-call/-private/boolean-param';
export { default as StringParam } from 'okapi/models/method-call/-private/string-param';

// NOTE: Value maybe be NaN or an otherwise invalid number but `validate` will fail in this case.
export default class NumberParam extends AbstractParam<
  NumberMethodParam,
  number,
  string
> {
  private pattern = '^[-,0-9.]+$';

  _validate(): void {
    if (this.value !== undefined && isNaN(this.value)) {
      this.errorSet.add('Value is not a number');
    }

    if (this.inputValue) {
      let pattern = new RegExp(this.pattern);
      if (!pattern.test(this.inputValue)) {
        // TODO: Be more specific re: float, integer, signed, etc
        this.errorSet.add('Value contains invalid characters');
      }
    }
  }

  protected parse(inputValue: string | undefined | null): number | undefined {
    if (inputValue) {
      inputValue = squish(inputValue);
      let sign = inputValue.startsWith('-') ? -1 : 1;
      inputValue = inputValue.replace(/[^0-9.]/g, ''); // remove non-numeric characters
      return sign * parseFloat(inputValue);
    } else {
      return undefined;
    }
  }

  protected format(value: number | undefined): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    } else {
      return value.toLocaleString();
    }
  }
}
