import { module, test } from 'qunit';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | project-settings/form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<ProjectSettings::Form />`);

    assert.dom().hasText('Choose a setting to configure.');
  });
});
