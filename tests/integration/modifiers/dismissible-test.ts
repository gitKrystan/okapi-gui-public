import { assert as emberAssert } from '@ember/debug';
import { action } from '@ember/object';
import {
  click,
  render,
  TestContext,
  triggerKeyEvent,
} from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

interface TrackedEvent {
  type: string;
  elementId: string;
}

class State {
  events: TrackedEvent[] = [];

  @tracked related?: Element | Element[] | null = null;

  @tracked disableWhen?: boolean;

  @tracked dismissOnFocusChange?: boolean;

  get dismissedCount(): number {
    return this.events.filter((e) => e.type === 'dismissed').length;
  }

  @action dismissed(e: Event): void {
    let elementId: string;
    if (e.target === document) {
      elementId = 'document';
    } else {
      emberAssert(
        'target should have an id',
        e.target instanceof HTMLElement && typeof e.target.id === 'string'
      );
      elementId = e.target.id;
    }

    this.events.push({ type: 'dismissed', elementId });
  }

  trackEvents = modifier(
    (el: HTMLElement) => {
      el.addEventListener('mousedown', this.onEvent);
      el.addEventListener('focusin', this.onEvent);
      el.addEventListener('mouseup', this.onEvent);
      el.addEventListener('click', this.onEvent);

      return (): void => {
        el.removeEventListener('mousedown', this.onEvent);
        el.removeEventListener('focusin', this.onEvent);
        el.removeEventListener('mouseup', this.onEvent);
        el.removeEventListener('click', this.onEvent);
      };
    },
    { eager: false }
  );

  @action private onEvent(e: Event): void {
    emberAssert(
      'target should have an id',
      e.target instanceof HTMLElement && typeof e.target.id === 'string'
    );
    this.events.push({ type: e.type, elementId: e.target.id });
  }
}

module('Integration | Modifier | dismissible', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: Context) {
    this.state = new State();

    await render(hbs`
      <Button id="related-1">Should not dismiss if added to related</Button>
      <Button id="related-2">Should not dismiss if added to related</Button>
      <div
        id="dismissible"
        {{dismissible
          dismissed=this.state.dismissed
          disableWhen=this.state.disableWhen
          related=this.state.related
          dismissOnFocusChange=this.state.dismissOnFocusChange
        }}
        {{this.state.trackEvents}}
      >
        <Button id="inside" {{this.state.trackEvents}}>
          Click should NOT dismiss
        </Button>
        <Button id="else-inside" {{this.state.trackEvents}}>
          Click should NOT dismiss
        </Button>
      </div>
      <Button id="outside" {{this.state.trackEvents}}>
        Click should dismiss
      </Button>
    `);
  });

  module('`dismissOnFocusChange` is true (default)', function () {
    clickAwayTest([
      { elementId: 'outside', type: 'mousedown' },
      { elementId: 'outside', type: 'dismissed' },
      { elementId: 'outside', type: 'focusin' },
      // Twice bc both mousedown and focus trigger dismissed :-(
      { elementId: 'outside', type: 'dismissed' },
      { elementId: 'outside', type: 'mouseup' },
      { elementId: 'outside', type: 'click' },
    ]);

    escapeTest(true);

    loseFocusTest(true);

    focusWithinTest();

    clickWithinTest();

    relatedTest([
      { elementId: 'outside', type: 'mousedown' },
      { elementId: 'outside', type: 'dismissed' },
      { elementId: 'outside', type: 'focusin' },
      // Twice bc both mousedown and focus trigger dismissed :-(
      { elementId: 'outside', type: 'dismissed' },
      { elementId: 'outside', type: 'mouseup' },
      { elementId: 'outside', type: 'click' },
    ]);

    disableWhenTest();
  });

  module('`dismissOnFocusChange` is false', function (hooks) {
    hooks.beforeEach(function (this: Context) {
      this.state.dismissOnFocusChange = false;
    });

    clickAwayTest([
      { elementId: 'outside', type: 'mousedown' },
      { elementId: 'outside', type: 'dismissed' },
      { elementId: 'outside', type: 'focusin' },
      { elementId: 'outside', type: 'mouseup' },
      { elementId: 'outside', type: 'click' },
    ]);

    escapeTest(true);

    loseFocusTest(false);

    focusWithinTest();

    clickWithinTest();

    relatedTest([
      { elementId: 'outside', type: 'mousedown' },
      { elementId: 'outside', type: 'dismissed' },
      { elementId: 'outside', type: 'focusin' },
      { elementId: 'outside', type: 'mouseup' },
      { elementId: 'outside', type: 'click' },
    ]);

    disableWhenTest();
  });
});

function clickWithinTest(): void {
  test('it DOES NOT dismiss when clicking inside the element with the dismissible modifier on it', async function (this: Context, assert) {
    await click('#inside');

    assert.strictEqual(this.state.dismissedCount, 0, 'did not dismiss');
  });
}

function clickAwayTest(expectedEvents: TrackedEvent[]): void {
  test('it has the correct events when you click away', async function (this: Context, assert) {
    assert.deepEqual(this.state.events, [], 'events have not been pushed yet');

    await click('#outside');

    assert.deepEqual(
      this.state.events,
      expectedEvents,
      'events fire in the expected sequence'
    );
  });
}

function escapeTest(shouldDismiss: boolean): void {
  test(`it ${
    shouldDismiss ? 'dismisses' : 'DOES NOT dismiss'
  } when you hit escape`, async function (this: Context, assert) {
    await triggerKeyEvent(document, 'keydown', 'Escape');

    if (shouldDismiss) {
      assert.strictEqual(this.state.dismissedCount, 1, 'did dismiss');
    } else {
      assert.strictEqual(this.state.dismissedCount, 0, 'did not dismiss');
    }
  });
}

function loseFocusTest(shouldDismiss: boolean): void {
  test(`it ${
    shouldDismiss ? 'dismisses' : 'DOES NOT dismiss'
  } when the dismissible element loses focus`, async function (this: Context, assert) {
    await click('#inside');

    assert.dom('#inside').isFocused();
    assert.dom('#outside').isNotFocused();
    assert.strictEqual(
      this.state.dismissedCount,
      0,
      'dismissed has not been called'
    );

    let outsideElement = document.getElementById('outside');
    emberAssert('outside not found', outsideElement);
    outsideElement.focus();

    assert.dom('#inside').isNotFocused();
    assert.dom('#outside').isFocused();

    if (shouldDismiss) {
      assert.strictEqual(this.state.dismissedCount, 1, 'did dismiss');
    } else {
      assert.strictEqual(this.state.dismissedCount, 0, 'did not dismiss');
    }
  });
}

function focusWithinTest(): void {
  test('it DOES NOT dismiss when the focus changes within the dismissible element', async function (this: Context, assert) {
    await click('#inside');

    assert.dom('#inside').isFocused();
    assert.dom('#outside').isNotFocused();
    assert.strictEqual(this.state.dismissedCount, 0);

    let secondElement = document.getElementById('else-inside');
    emberAssert('else-inside not found', secondElement);
    secondElement.focus();

    assert.dom('#inside').isNotFocused();
    assert.dom('#else-inside').isFocused();
    assert.dom('#outside').isNotFocused();
    assert.strictEqual(this.state.dismissedCount, 0);
  });
}

function relatedTest(expectedClickawayEvents: TrackedEvent[]): void {
  module('related', function () {
    test('it DOES NOT dismiss when a single `related` HTML element is clicked on', async function (this: Context, assert) {
      let related = document.querySelector('#related-1');
      emberAssert('expected to find element with id=related-1', related);

      this.state.related = related;

      await click('#related-1');

      assert.strictEqual(this.state.dismissedCount, 0, 'did not dismiss');

      await click('#outside');

      assert.ok(this.state.dismissedCount, 'did dismiss');
    });

    test('it DOES NOT dismiss when you click on any of the HTML elements passed in an array of `related`', async function (this: Context, assert) {
      let related1 = document.querySelector('#related-1');
      emberAssert('expected to find element with id=related-1', related1);

      let related2 = document.querySelector('#related-2');
      emberAssert('expected to find element with id=related-2', related2);

      this.state.related = [related1, related2];

      await click('#related-1');

      assert.strictEqual(this.state.dismissedCount, 0, 'did not dismiss');

      await click('#related-2');

      assert.strictEqual(this.state.dismissedCount, 0, 'did not dismiss');

      await click('#outside');

      assert.ok(this.state.dismissedCount, 'did dismiss');
    });

    clickAwayTest(expectedClickawayEvents);
  });
}

function disableWhenTest(): void {
  module('disableWhen=true', function (hooks) {
    hooks.beforeEach(function (this: Context) {
      this.state.disableWhen = true;
    });

    clickAwayTest([
      { elementId: 'outside', type: 'mousedown' },
      { elementId: 'outside', type: 'focusin' },
      { elementId: 'outside', type: 'mouseup' },
      { elementId: 'outside', type: 'click' },
    ]);

    escapeTest(false);
  });
}
