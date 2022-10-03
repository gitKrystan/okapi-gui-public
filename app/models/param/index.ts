import type { RawBooleanParam } from 'okapi/models/param/-private/boolean-param';
import BooleanParam from 'okapi/models/param/-private/boolean-param';
import type { RawEnumParam } from 'okapi/models/param/-private/enum-param';
import EnumParam from 'okapi/models/param/-private/enum-param';
import type { RawNumberParam } from 'okapi/models/param/-private/number-param';
import NumberParam from 'okapi/models/param/-private/number-param';
import type { RawStringParam } from 'okapi/models/param/-private/string-param';
import StringParam from 'okapi/models/param/-private/string-param';

export { default as BooleanParam } from 'okapi/models/param/-private/boolean-param';
export type { RawBooleanParam } from 'okapi/models/param/-private/boolean-param';
export { default as EnumParam } from 'okapi/models/param/-private/enum-param';
export type {
  EnumParamOption,
  RawEnumParam,
} from 'okapi/models/param/-private/enum-param';
export { default as NumberParam } from 'okapi/models/param/-private/number-param';
export type { RawNumberParam } from 'okapi/models/param/-private/number-param';
export { default as StringParam } from 'okapi/models/param/-private/string-param';
export type { RawStringParam } from 'okapi/models/param/-private/string-param';

export type Param = StringParam | BooleanParam | NumberParam | EnumParam;
export type RawParam =
  | RawStringParam
  | RawBooleanParam
  | RawNumberParam
  | RawEnumParam;

/**
 * Makes a Param instance of the correct type for the given RawParam.
 */
export function makeParam(info: RawParam): Param {
  switch (info.type) {
    case 'string':
      return new StringParam(info);
    case 'boolean':
      return new BooleanParam(info);
    case 'f32':
    case 'f64':
    case 'i8':
    case 'i16':
    case 'i32':
    case 'i64':
    case 'u8':
    case 'u16':
    case 'u32':
    case 'u64':
      return new NumberParam(info);
    case 'enum':
      return new EnumParam(info);
  }
}
