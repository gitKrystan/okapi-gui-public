import type { TestContext } from '@ember/test-helpers';
import { render, rerender } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupRenderingTest } from 'okapi/tests/helpers';

class State {
  @tracked text = '';

  async setText(newText: string): Promise<void> {
    this.text = newText;
    await rerender();
  }
}

interface Context extends TestContext {
  state: State;
}

module('Integration | Component | md', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders basic markdown', async function (this: Context, assert) {
    this.state = new State();

    await render<Context>(
      hbs`<MD @profile="description" @raw={{this.state.text}} />`
    );

    assert.dom('[data-test-md] p').doesNotExist();

    await this.state.setText('pickle');

    assert.dom('[data-test-md] p').hasText('pickle');

    await this.state.setText('`pickle`');

    assert.dom('[data-test-md] p code').hasText('pickle');
  });

  test('it highlights code blocks', async function (this: Context, assert) {
    this.state = new State();

    await render<Context>(
      hbs`<MD @profile="description" @raw={{this.state.text}} />`
    );

    assert.dom('[data-test-md] p').doesNotExist();

    await this.state.setText('```ts\npickle\n```');

    assert
      .dom('[data-test-md] pre code')
      .hasText('pickle')
      .hasClass('Syntax--language-ts');
  });

  test('it sanitizes', async function (this: Context, assert) {
    this.state = new State();

    await render<Context>(
      hbs`<MD @profile="description" @raw={{this.state.text}} />`
    );

    assert.dom('[data-test-md] p').doesNotExist();

    await this.state.setText('<img src=x onerror=alert(1)//>');

    assert.dom('[data-test-md] img').doesNotExist();
  });
});
