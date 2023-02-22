import { assert as emberAssert } from '@ember/debug';
import { render } from '@ember/test-helpers';
import fillIn from '@ember/test-helpers/dom/fill-in';
import type { TemplateFactory } from 'ember-cli-htmlbars';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupRenderingTest } from 'okapi/tests/helpers';

module('Integration | Helper | expanding-textarea', function (hooks) {
  setupRenderingTest(hooks);

  for (const t of [
    {
      name: 'native',
      // TODO: This cast should be unnecessary once types are fixed.
      template: hbs`
          <label>Fill Me In<textarea {{expanding-textarea}} /></label>
        ` as unknown as TemplateFactory,
    },
    {
      name: 'component',
      template: hbs`
          <label>Fill Me In<Textarea {{expanding-textarea}} /></label>
        ` as unknown as TemplateFactory,
    },
  ]) {
    test(`${t.name}: it adjusts height based on content`, async function (assert) {
      await render(t.template);

      let textarea = document.querySelector('textarea');
      emberAssert('expected textarea', textarea);

      let heightAtOneLine = textarea.clientHeight;

      await fillIn(textarea, 'Food\nFight');

      assert.strictEqual(
        textarea.clientHeight,
        heightAtOneLine * 2 - 6,
        'expands to two lines'
      );

      await fillIn(textarea, 'Food\nFight\nJoin\nIn!');

      assert.strictEqual(
        textarea.clientHeight,
        heightAtOneLine * 4 - 18,
        'expands to four lines'
      );

      await fillIn(textarea, 'Food');

      assert.strictEqual(
        textarea.clientHeight,
        heightAtOneLine,
        'shrinks back to one line'
      );
    });
  }
});
