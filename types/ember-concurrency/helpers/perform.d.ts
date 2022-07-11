/* eslint-disable @typescript-eslint/no-explicit-any */

// Based on https://github.com/Gavant/glint-template-types/blob/main/types/ember-concurrency/perform.d.ts
// but modified to allow any function because glint + ember-template-imports was
// unhappy with the Gavant types.

import Helper from '@ember/component/helper';

type Task<Return, Args extends unknown[]> = (...args: Args) => Return;

type PrefixOf<T extends unknown[]> = T extends []
  ? []
  : unknown[] extends T
  ? unknown[]
  : T extends [head: infer Head, ...tail: infer Tail]
  ? [] | [Head, ...PrefixOf<Tail>]
  : T extends [head?: infer Head, ...tail: infer Tail]
  ? [Head?, ...PrefixOf<Tail>]
  : [];

type TaskArgs<T extends Task<any, any>> = T extends Task<any, infer Args>
  ? Args
  : never;
type TaskReturn<T extends Task<any, any>> = T extends Task<infer Return, any>
  ? Return
  : never;

type RemovePrefix<
  Prefix extends unknown[],
  Tuple extends unknown[]
> = [] extends Prefix
  ? Tuple
  : [Prefix, Tuple] extends [
      [any?, ...infer PrefixRest],
      [any?, ...infer TupleRest]
    ]
  ? RemovePrefix<PrefixRest, TupleRest>
  : [];

type PerformSignature<
  T extends Task<any, any>,
  GivenArgs extends PrefixOf<TaskArgs<T>>
> = {
  Args: { Positional: [T, ...GivenArgs] };
  Return: (
    ...params: RemovePrefix<GivenArgs, TaskArgs<T>>
  ) => Promise<TaskReturn<T>>;
};

export default class Perform<
  T extends Task<any, any>,
  PassedArgs extends PrefixOf<TaskArgs<T>>
> extends Helper<PerformSignature<T, PassedArgs>> {}
