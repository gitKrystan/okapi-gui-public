import Helper from '@ember/component/helper';

interface EqualityHelperSignature<T> {
  Args: { Positional: [T, T] };
  Return: boolean;
}

export default class eq<T> extends Helper<EqualityHelperSignature<T>> {}
