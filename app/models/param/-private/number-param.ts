import { assert } from '@ember/debug';
import AbstractParam from './abstract-param';

const NumericInputPattern = /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/;

export interface RawNumberParam {
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
  value?: number;
}

export interface TypeInfo {
  signed: boolean;
  integer: boolean;
  bits: number;
}

// NOTE: Value maybe be NaN or an otherwise invalid number but `validate` will
// fail in this case.
export default class NumberParam extends AbstractParam<
  number,
  string | null,
  RawNumberParam
> {
  protected _validate(
    normalizedInputValue: string | undefined,
    value: number | undefined
  ): void {
    // Theoretically this shouldn't be possible due to normalization in the
    // number field.
    if (value !== undefined && Number.isNaN(value)) {
      this.errorSet.add('Value is not a number');
    }

    if (
      normalizedInputValue &&
      this.validateNormalizedInputValue(normalizedInputValue) &&
      typeof value == 'number'
    ) {
      let { signed, integer, bits } = this.typeInfo;

      if (integer) {
        this.validateInteger(value);
        this.validateMaxInteger(bits, value);
      }

      if (integer && signed) {
        this.validateMinSignedInteger(bits, value);
      } else if (!signed) {
        this.validateUnsigned(value);
      }

      if (value >= Number.MAX_SAFE_INTEGER) {
        this.errorSet.add('Value is too large to be handled by JavaScript 😬');
      }

      if (value <= Number.MIN_SAFE_INTEGER) {
        this.errorSet.add('Value is too small to be handled by JavaScript 😬');
      }
    }
  }

  protected normalize(
    rawInputValue: string | null | undefined
  ): string | undefined {
    // We want to coerce '' and `null` into `undefined` here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return rawInputValue || undefined;
  }

  protected parse(
    normalizedInputValue: string | undefined
  ): number | undefined {
    if (normalizedInputValue) {
      normalizedInputValue = normalizedInputValue.replace(/[^-0-9.]/g, ''); // remove non-numeric characters
      let number = parseFloat(normalizedInputValue);
      if (Number.isNaN(number)) {
        return undefined;
      }
      return number;
    } else {
      return undefined;
    }
  }

  protected format(value: number | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    } else {
      return value.toLocaleString();
    }
  }

  private get typeInfo(): TypeInfo {
    let fullType = this.info.type;
    let regex = /^([fiu])([\d]+)$/;

    let matches = regex.exec(fullType);
    assert(`${fullType} does not match regex ${regex.source}`, matches);

    let typeId = matches[1];
    assert(`typeId not found in string ${fullType}`, typeId);

    let bitStr = matches[2];
    assert(
      `bitStr '${String(bitStr)} in string ${fullType}' not found`,
      bitStr
    );
    let bits = parseInt(bitStr, 10);
    assert(
      `bitStr '${bitStr}' parsed to NaN in string ${fullType}`,
      !Number.isNaN(bits)
    );

    if (typeId === 'f') {
      return { signed: true, integer: false, bits };
    } else if (typeId === 'i') {
      return { signed: true, integer: true, bits };
    } else if (typeId === 'u') {
      return { signed: false, integer: true, bits };
    } else {
      assert(`type not found in string ${fullType}`);
    }
  }

  private validateNormalizedInputValue(normalizedInputValue: string): boolean {
    let isValidNumericInput = NumericInputPattern.test(normalizedInputValue);
    if (!isValidNumericInput) {
      this.errorSet.add('Value cannot be parsed as a number');
    }
    return isValidNumericInput;
  }

  private validateInteger(value: number): void {
    if (!Number.isInteger(value)) {
      this.errorSet.add('Value must be an integer');
    }
  }

  private validateMaxInteger(bits: number, value: number): void {
    let maxNumber = 2 ** (bits - 1) - 1;
    if (value > maxNumber) {
      this.errorSet.add(
        `Value exceeds maximum of ${maxNumber.toLocaleString()} for type ${
          this.info.type
        }`
      );
    }
  }

  private validateMinSignedInteger(bits: number, value: number): void {
    let minNumber = -1 * 2 ** (bits - 1);
    if (value < minNumber) {
      this.errorSet.add(
        `Value is less than the minimum of ${minNumber.toLocaleString()} for type ${
          this.info.type
        }`
      );
    }
  }

  private validateUnsigned(value: number): void {
    if (value < 0) {
      this.errorSet.add('Value cannot be negative');
    }
  }
}
