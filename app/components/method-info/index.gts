import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';

import Button from 'okapi/components/button';
import MD from 'okapi/components/m-d';
import Token from 'okapi/components/syntax/token';
import Method from 'okapi/models/method';
import MethodCall from 'okapi/models/method-call';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';
import ServerService from 'okapi/services/server';
import ParamList from './param-list';

export interface MethodInfoSig {
  Element: HTMLDivElement;
  Args: {
    method: Method;
    isActive: boolean;
  };
}

export default class MethodInfo extends Component<MethodInfoSig> {
  <template>
    <div ...attributes>
      <p
        class="MethodInfo__description"
        data-test-method-info-description={{@method.id}}
      >
        <MD @profile="description" @raw={{@method.description}} />
      </p>
      <form {{on "submit" (perform this.submit)}} data-test-method-info-form>
        <ParamList
          data-test-request-params={{@method.id}}
          @id="{{@method.id}}-request"
          @params={{this.methodCall.request}}
          @formEnabled={{@isActive}}
        >
          <a {{ScrollAnchor (concat @method.id "Request")}}>
            <code class="Syntax Syntax--inline">
              <Token @type="type">{{@method.name}}Request</Token>
            </code>
          </a>
        </ParamList>
        {{#if @isActive}}
          <div class="MethodInfo__item" id="{{@method.id}}-call-button">
            <Button
              data-test-method-info-submit-button
              class="MethodInfo__item__second
                {{if this.emphasizeCallButton 'Button--theme-primary'}}"
              type="submit"
              disabled={{this.submit.isRunning}}
            >
              {{#if this.submit.isRunning}}
                Running
              {{else}}
                Call
              {{/if}}
            </Button>
          </div>
        {{/if}}
      </form>
      <ParamList
        data-test-response-params={{@method.id}}
        @id="{{@method.id}}-response"
        @params={{this.methodCall.response}}
        @formEnabled={{@isActive}}
        @readonly={{true}}
      >
        <a {{ScrollAnchor (concat @method.id "Response")}}>
          <code class="Syntax Syntax--inline">
            <Token @type="type">{{@method.name}}Response</Token>
          </code>
        </a>
      </ParamList>
    </div>
  </template>

  @service private declare server: ServerService;

  private methodCall = MethodCall.from(this.args.method);

  private get emphasizeCallButton(): boolean {
    return this.methodCall.request.every(r => r.value !== undefined);
  }

  private submit = task(
    { drop: true },
    async (e: SubmitEvent): Promise<void> => {
      e.preventDefault();
      await this.methodCall.call(this.server);
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    MethodInfo: typeof MethodInfo;
  }
}
