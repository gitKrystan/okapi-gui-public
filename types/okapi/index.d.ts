import { ComponentLike, HelperLike } from '@glint/template';

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
    perform: typeof import('@gavant/glint-template-types/types/ember-concurrency/perform').default;

    // ember-truth-helpers
    and: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/and').default;
    eq: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/eq').default;
    gt: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/gt').default;
    gte: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/gte').default;
    'is-array': typeof import('@gavant/glint-template-types/types/ember-truth-helpers/is-array').default;
    'is-empty': typeof import('@gavant/glint-template-types/types/ember-truth-helpers/is-empty').default;
    'is-equal': typeof import('@gavant/glint-template-types/types/ember-truth-helpers/is-equal').default;
    lt: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/lt').default;
    lte: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/lte').default;
    'not-eq': typeof import('@gavant/glint-template-types/types/ember-truth-helpers/not-eq').default;
    not: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/not').default;
    or: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/or').default;
    xor: typeof import('@gavant/glint-template-types/types/ember-truth-helpers/xor').default;
  }
}

export {};
