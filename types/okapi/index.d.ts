import type { ComponentLike, HelperLike } from '@glint/template';
import type Ember from 'ember';

import type perform from '@gavant/glint-template-types/types/ember-concurrency/perform';
import type and from '@gavant/glint-template-types/types/ember-truth-helpers/and';
import type eq from '@gavant/glint-template-types/types/ember-truth-helpers/eq';
import type gt from '@gavant/glint-template-types/types/ember-truth-helpers/gt';
import type gte from '@gavant/glint-template-types/types/ember-truth-helpers/gte';
import type isArray from '@gavant/glint-template-types/types/ember-truth-helpers/is-array';
import type isEmpty from '@gavant/glint-template-types/types/ember-truth-helpers/is-empty';
import type isEqual from '@gavant/glint-template-types/types/ember-truth-helpers/is-equal';
import type lt from '@gavant/glint-template-types/types/ember-truth-helpers/lt';
import type lte from '@gavant/glint-template-types/types/ember-truth-helpers/lte';
import type notEq from '@gavant/glint-template-types/types/ember-truth-helpers/not-eq';
import type not from '@gavant/glint-template-types/types/ember-truth-helpers/not';
import type or from '@gavant/glint-template-types/types/ember-truth-helpers/or';
import type xor from '@gavant/glint-template-types/types/ember-truth-helpers/xor';

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

interface BreadcrumbsContainerSignature {
  Element: HTMLUListElement;
  Args: {
    itemClass: string;
    linkClass: string;
  };
}

interface BreadcrumbsItemSignature {
  Element: HTMLLIElement;
  Blocks: {
    default: [linkClass: string];
  };
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    // @bagaar/ember-breadcrumbs
    BreadcrumbsContainer: ComponentLike<BreadcrumbsContainerSignature>;
    BreadcrumbsItem: ComponentLike<BreadcrumbsItemSignature>;

    // ember-page-title
    'page-title': HelperLike<PageTitleHelperSignature>;

    // ember-concurrency
    perform: typeof perform;

    // ember-truth-helpers
    and: typeof and;
    eq: typeof eq;
    gt: typeof gt;
    gte: typeof gte;
    'is-array': typeof isArray;
    'is-empty': typeof isEmpty;
    'is-equal': typeof isEqual;
    lt: typeof lt;
    lte: typeof lte;
    'not-eq': typeof notEq;
    not: typeof not;
    or: typeof or;
    xor: typeof xor;
  }
}

export {};
