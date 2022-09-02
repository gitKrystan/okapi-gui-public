import { action } from '@ember/object';
import { click, render, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

class State {
  constructor(private assert: Assert) {}

  private expectedDismiss = false;

  async expectDismiss(callback: Promise<void>): Promise<void> {
    this.expectedDismiss = true;
    await callback;
    this.expectedDismiss = false;
  }

  @action didDismiss(): void {
    if (this.expectedDismiss) {
      this.assert.ok(true, 'didDismiss callback was called on dismiss');
    } else {
      this.assert.ok(false, 'unexpected dismiss');
    }
  }
}

interface Context extends TestContext {
  state: State;
}

module('Integration | Component | dropdown', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: Context, assert) {
    this.state = new State(assert);

    await render(hbs`
      <Button id="outside">Click outside</Button>
      <Dropdown @didDismiss={{this.state.didDismiss}}>
        <:trigger as |d|>
          <Button id="toggle-trigger" aria-expanded="{{d.isExpanded}}" {{on "click" d.toggle}}>
            Click to toggle
          </Button>
          <Button id="open-trigger" aria-expanded="{{d.isExpanded}}" {{on "click" d.open}}>
            Click to open
          </Button>
          <Button id="close-trigger" aria-expanded="{{d.isExpanded}}" {{on "click" d.close}}>
            Click to close
          </Button>
          <Button id="delayed-close-trigger" aria-expanded="{{d.isExpanded}}" {{on "click" d.delayedClose}}>
            Click to close (with delay)
          </Button>
        </:trigger>
        <:content as |d|>
          <Button id="content" {{on "click" d.toggle}}>
            Clickable content
          </Button>
        </:content>
      </Dropdown>
    `);
  });

  test('the trigger block has access to the DropdownApi', async function (this: Context, assert) {
    assert.dom('#content').doesNotExist('collapsed by default');

    await click('#toggle-trigger');

    assert.dom('#content').exists('expanded on toggle trigger click');

    await click('#toggle-trigger');

    assert.dom('#content').doesNotExist('collapsed on toggle trigger click');

    await click('#open-trigger');

    assert.dom('#content').exists('expanded on open trigger click');

    await click('#close-trigger');

    assert.dom('#content').doesNotExist('collapsed on close trigger click');

    await click('#open-trigger');

    assert.dom('#content').exists('expanded (again) on open trigger click');

    await click('#delayed-close-trigger');

    assert
      .dom('#content')
      .doesNotExist('collapsed on delayed-close trigger click');
  });

  test('the content block has access to the DropdownApi', async function (this: Context, assert) {
    assert.dom('#content').doesNotExist('collapsed by default');

    await click('#toggle-trigger');

    assert.dom('#content').exists('expanded on toggle trigger click');

    await click('#content');

    assert.dom('#content').doesNotExist('collapsed on content click');
  });

  test('the DropdownApi provides info about the state of the component', async function (this: Context, assert) {
    assert.dom('#content').doesNotExist('collapsed by default');
    assert.dom('#toggle-trigger').hasAria('expanded', 'false');

    await click('#toggle-trigger');

    assert.dom('#content').exists('expanded on toggle trigger click');
    assert.dom('#toggle-trigger').hasAria('expanded', 'true');
  });

  test('it can be dismissed', async function (this: Context, assert) {
    assert.dom('#content').doesNotExist('collapsed by default');

    await click('#toggle-trigger');

    assert.dom('#content').exists('expanded on toggle trigger click');

    await this.state.expectDismiss(click('#outside'));

    assert.dom('#content').doesNotExist('collapsed on content click');
  });
});
