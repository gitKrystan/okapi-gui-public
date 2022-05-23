import { HelperLike } from '@glint/template';

import Ember from 'ember';

declare global {
  // Prevents ESLint from "fixing" this via its auto-fix to turn it into a type
  // alias (e.g. after running any Ember CLI generator)
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}
}

interface PageTitleHelperSignature {
  Args: { Positional: [title: string] };
  Return: '';
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'page-title': HelperLike<PageTitleHelperSignature>;
  }
}

export {};