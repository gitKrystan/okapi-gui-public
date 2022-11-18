import type { HelperLike } from '@glint/template';

import '@bagaar/ember-breadcrumbs/glint';
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
import type not from '@gavant/glint-template-types/types/ember-truth-helpers/not';
import type notEq from '@gavant/glint-template-types/types/ember-truth-helpers/not-eq';
import type or from '@gavant/glint-template-types/types/ember-truth-helpers/or';
import type xor from '@gavant/glint-template-types/types/ember-truth-helpers/xor';
import 'ember-cached-decorator-polyfill';

interface PageTitleHelperSignature {
  Args: { Positional: [title: string] };
  Return: '';
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
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
