import { concat } from '@ember/helper';
import Component from '@glimmer/component';

import Token from 'okapi/components/syntax/token';
import type Method from 'okapi/models/method';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';

export interface MethodSignatureSig {
  Element: HTMLElement;
  Args: { method: Method };
}

export default class MethodSignature extends Component<MethodSignatureSig> {
  <template>
    <code class="Syntax Syntax--inline" ...attributes>
      <Token @type="keyword">rpc </Token>
      {{! @glint-expect-error: The given value does not appear to be usable as a component, modifier or helper. }}
      <a {{ScrollAnchor @method.id}}>
        <Token @type="function">{{@method.name}}</Token>
      </a>
      <Token @type="punctuation">(</Token>
      {{! @glint-expect-error: The given value does not appear to be usable as a component, modifier or helper. }}
      <a {{ScrollAnchor (concat @method.id "Request") target=false}}>
        <Token @type="type">{{@method.name}}Request</Token>
      </a>
      <Token @type="punctuation">)</Token>
      <Token @type="keyword"> returns </Token>
      {{! @glint-expect-error: The given value does not appear to be usable as a component, modifier or helper. }}
      <a {{ScrollAnchor (concat @method.id "Response") target=false}}>
        <Token @type="type">{{@method.name}}Response</Token>
      </a>
      <Token @type="punctuation">;</Token>
    </code>
  </template>
}
