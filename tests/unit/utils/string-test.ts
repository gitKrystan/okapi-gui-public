import { module, test } from 'qunit';

import { setupTest } from 'okapi/tests/helpers';
import { escapeStringForRegex } from 'okapi/utils/string';

module('Unit | Utils | String', function (hooks) {
  setupTest(hooks);

  module('escapeStringForRegex', function () {
    test('it escapes special regexp characters in a string', function (assert) {
      assert.strictEqual(escapeStringForRegex('hello world'), 'hello world');
      assert.strictEqual(
        escapeStringForRegex('hello world...'),
        'hello world\\.\\.\\.'
      );
      assert.strictEqual(escapeStringForRegex('1+2*3'), '1\\+2\\*3');
    });

    test('the resulting string can be passed to the RegExp constructor', function (assert) {
      let regexp = new RegExp(escapeStringForRegex('1+2*3'));
      assert.ok(regexp.test('1+2*3'), 'should match 1+2*3');
      assert.notOk(regexp.test('11223'), 'should not match 11223');
    });
  });
});
