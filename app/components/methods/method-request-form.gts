import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import { taskFor } from 'ember-concurrency-ts';
import Button from 'okapi/components/button';
import Token from 'okapi/components/syntax/token';
import Method from 'okapi/models/method';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';
import ParamList from './param-list';

export interface MethodRequestFormSig {
  Element: HTMLFormElement;
  Args: { method: Method };
}

export default class MethodRequestForm extends Component<MethodRequestFormSig> {
  @task({ restartable: true })
  private async submit(e: SubmitEvent): Promise<void> {
    e.preventDefault()
    await timeout(500);
    alert('did it');
  }

  <template>
    <form ...attributes {{on "submit" (perform this.submit)}}>
      <ParamList @params={{@method.request}}>
        <a {{ScrollAnchor (concat @method.id "Request")}}>
          <code class="Syntax">
            <Token @type="type">{{@method.name}}Request</Token>
          </code>
        </a>
        <Button type="submit">Submit</Button>
      </ParamList>
    </form>
  </template>
}
