import type { HelperLike } from '@glint/template';

import '@bagaar/ember-breadcrumbs/glint';
import '@gavant/glint-template-types/types/ember-concurrency/perform';
import '@gavant/glint-template-types/types/ember-truth-helpers/eq';
import '@gavant/glint-template-types/types/ember-truth-helpers/and';
import '@gavant/glint-template-types/types/ember-truth-helpers/gt';
import '@gavant/glint-template-types/types/ember-truth-helpers/gte';
import '@gavant/glint-template-types/types/ember-truth-helpers/is-array';
import '@gavant/glint-template-types/types/ember-truth-helpers/is-empty';
import '@gavant/glint-template-types/types/ember-truth-helpers/is-equal';
import '@gavant/glint-template-types/types/ember-truth-helpers/lt';
import '@gavant/glint-template-types/types/ember-truth-helpers/lte';
import '@gavant/glint-template-types/types/ember-truth-helpers/not';
import '@gavant/glint-template-types/types/ember-truth-helpers/not-eq';
import '@gavant/glint-template-types/types/ember-truth-helpers/or';
import '@gavant/glint-template-types/types/ember-truth-helpers/xor';
import 'ember-cached-decorator-polyfill';

import type perform from 'ember-concurrency/helpers/perform';
import type and from 'ember-truth-helpers/helpers/and';
import type eq from 'ember-truth-helpers/helpers/eq';
import type gt from 'ember-truth-helpers/helpers/gt';
import type gte from 'ember-truth-helpers/helpers/gte';
import type isArray from 'ember-truth-helpers/helpers/is-array';
import type isEmpty from 'ember-truth-helpers/helpers/is-empty';
import type isEqual from 'ember-truth-helpers/helpers/is-equal';
import type lt from 'ember-truth-helpers/helpers/lt';
import type lte from 'ember-truth-helpers/helpers/lte';
import type not from 'ember-truth-helpers/helpers/not';
import type notEq from 'ember-truth-helpers/helpers/not-eq';
import type or from 'ember-truth-helpers/helpers/or';
import type xor from 'ember-truth-helpers/helpers/xor';

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
