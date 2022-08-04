import { assert } from '@ember/debug';
import { NumberMethodParam } from 'okapi/models/method';
import AbstractParam from './abstract-param';

export { default as Boolean } from 'okapi/models/method-call/-private/boolean-param';
export { default as StringParam } from 'okapi/models/method-call/-private/string-param';

export enum NumberInputType {
  SignedFloat = 'signed float',
  SignedInteger = 'signed integer',
  UnsignedInteger = 'unsigned integer',
}

function isIntegerType(type: NumberInputType): boolean {
  return (
    type === NumberInputType.SignedInteger ||
    type === NumberInputType.UnsignedInteger
  );
}

function isUnsignedType(type: NumberInputType): boolean {
  return type === NumberInputType.UnsignedInteger;
}

const NumericPattern = /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/;

// NOTE: Value maybe be NaN or an otherwise invalid number but `validate` will
// fail in this case.
export default class NumberParam extends AbstractParam<
  NumberMethodParam,
  number,
  string | null
> {
  protected _validate(
    normalizedInputValue: string | undefined,
    value: number | undefined
  ): void {
    // Theoretically this shouldn't be possible due to normalization in the
    // number field.
    if (value !== undefined && isNaN(value)) {
      this.errorSet.add('Value is not a number');
    }

    if (normalizedInputValue) {
      let { type } = this;
      if (!NumericPattern.test(normalizedInputValue)) {
        this.errorSet.add('Value cannot be parsed as a number');
      } else {
        if (isIntegerType(type) && normalizedInputValue.includes('.')) {
          this.errorSet.add('Value must be an integer');
        }
        if (isUnsignedType(type) && normalizedInputValue.startsWith('-')) {
          this.errorSet.add('Value cannot be negative');
        }
      }
    }
  }

  protected normalize(
    rawInputValue: string | null | undefined
  ): string | undefined {
    return rawInputValue || undefined;
  }

  protected parse(
    normalizedInputValue: string | undefined
  ): number | undefined {
    if (normalizedInputValue) {
      normalizedInputValue = normalizedInputValue.replace(/[^-0-9.]/g, ''); // remove non-numeric characters
      return parseFloat(normalizedInputValue);
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

  private get type(): NumberInputType {
    return this.typeInfo.type ?? NumberInputType.SignedFloat;
  }

  private get typeInfo(): {
    type: NumberInputType;
    bits: number;
  } {
    let fullType = this.info.type;
    let regex = /^([fiu])([\d]+)$/;

    let matches = regex.exec(fullType);
    assert(`${fullType} does not match regex ${regex.source}`, matches);

    let typeId = matches[1];
    let bitStr = matches[2];

    assert(`typeId not found in string ${fullType}`, typeId);
    let type = {
      f: NumberInputType.SignedFloat,
      i: NumberInputType.SignedInteger,
      u: NumberInputType.UnsignedInteger,
    }[typeId];
    assert(`type not found in string ${fullType}`, type);

    assert(
      `bitStr '${String(bitStr)} in string ${fullType}' not found`,
      bitStr
    );
    let bits = parseInt(bitStr, 10);
    assert(
      `bitStr '${bitStr}' parsed to NaN in string ${fullType}`,
      !isNaN(bits)
    );

    return { type, bits };
  }
}
