import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import { taskFor } from 'ember-concurrency-ts';
import Button from 'okapi/components/button';
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
  @service private declare server: ServerService;

  private methodCall = MethodCall.from(this.args.method);

  private get submitStatus() {
    // @ts-expect-error Types messed up for GTS
    return taskFor(this.submit);
  }

  private get emphasizeCallButton(): boolean {
    return this.methodCall.request.every(r => r.value !== undefined);
  }

  @task({ drop: true }) private async submit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    let response = await this.methodCall.call(this.server);
  }

  <template>
    <div ...attributes>
      <p class="MethodInfo__description">{{@method.description}}</p>
      <form {{on "submit" (perform this.submit)}} data-test-method-info-form>
        <ParamList
          @id="{{@method.id}}-request"
          @params={{this.methodCall.request}}
          @formEnabled={{@isActive}}
        >
          <a {{ScrollAnchor (concat @method.id "Request")}}>
            <code class="Syntax">
              <Token @type="type">{{@method.name}}Request</Token>
            </code>
          </a>
        </ParamList>
        {{#if @isActive}}
          <div class="MethodInfo__param-list-item">
            <Button
              class="MethodInfo__param-list-item__second {{if this.emphasizeCallButton "Button--theme-primary"}}"
              type="submit"
              disabled={{this.submitStatus.isRunning}}
            >
              {{#if this.submitStatus.isRunning}}
                Running
              {{else}}
                Call
              {{/if}}
            </Button>
          </div>
        {{/if}}
      </form>
      <ParamList
        @id="{{@method.id}}-response"
        @params={{this.methodCall.response}}
        @formEnabled={{@isActive}}
        @readonly={{true}}
      >
        <a {{ScrollAnchor (concat @method.id "Response")}}>
          <code class="Syntax">
            <Token @type="type">{{@method.name}}Response</Token>
          </code>
        </a>
      </ParamList>
    </div>
  </template>
}
