import { assert as emberAssert } from '@ember/debug';
import { render } from '@ember/test-helpers';
import fillIn from '@ember/test-helpers/dom/fill-in';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | expanding-textarea', function (hooks) {
  setupRenderingTest(hooks);

  [
    { name: 'native', template: hbs`<textarea {{expanding-textarea}} />` },
    { name: 'component', template: hbs`<Textarea {{expanding-textarea}} />` },
  ].forEach((t) => {
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
  });
});
