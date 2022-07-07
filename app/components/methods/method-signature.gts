import { concat } from '@ember/helper';
import { TemplateOnlyComponent } from '@ember/component/template-only';
import Component from '@glimmer/component';
import Token from 'okapi/components/syntax/token';
import Method, { ApiMethodArg } from 'okapi/models/method';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';

export interface MethodSignatureSig {
  Element: HTMLElement;
  Args: { method: Method };
}

export default class MethodSignature extends Component<MethodSignatureSig> {
  <template>
    <code class="Syntax" ...attributes>
      <Token @type="keyword">rpc </Token>
      <a {{ScrollAnchor @method.id}}>
        <Token @type="function">{{@method.name}}</Token>
      </a>
      <Token @type="punctuation">(</Token>
      <a {{ScrollAnchor (concat @method.id "Request") target=false}}>
        <Token @type="type">{{@method.name}}Request</Token>
      </a>
      <Token @type="punctuation">)</Token>
      <Token @type="keyword"> returns </Token>
      <a {{ScrollAnchor (concat @method.id "Response") target=false}}>
        <Token @type="type">{{@method.name}}Response</Token>
      </a>
      <Token @type="punctuation">;</Token>
    </code>
  </template>
}
