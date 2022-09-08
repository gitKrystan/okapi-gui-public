import type { TestContext } from '@ember/test-helpers';
import { click, settled, visit } from '@ember/test-helpers';
import type TestingPrefersColorSchemeService from 'okapi/services/prefers-color-scheme/-testing';
import { DARK_CLASS } from 'okapi/services/theme';
import { setupApplicationTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface PrefersColorSchemeContext extends TestContext {
  prefersColorScheme: TestingPrefersColorSchemeService;
}

module('Acceptance | theme', function (hooks) {
  setupApplicationTest(hooks);

  test('can be manually toggled', async function (assert) {
    await visit('/');

    // assert.dom with no selector will select the `.ember-application` element.
    assert.dom().doesNotHaveClass(DARK_CLASS);

    await click('[data-test-theme-toggle-button]');

    assert.dom().hasClass(DARK_CLASS);

    await click('[data-test-theme-toggle-button]');

    assert.dom().doesNotHaveClass(DARK_CLASS);
  });

  module('prefers-color-scheme', function (hooks) {
    hooks.beforeEach(function (this: PrefersColorSchemeContext) {
      this.prefersColorScheme = this.owner.lookup(
        'service:prefers-color-scheme'
      ) as TestingPrefersColorSchemeService;
    });

    module('dark', function (hooks) {
      hooks.beforeEach(async function (
        this: PrefersColorSchemeContext,
        assert
      ) {
        this.prefersColorScheme.isDark = true;

        await visit('/');

        assert.dom().hasClass(DARK_CLASS, 'starts off as dark');
      });

      test('can be manually toggled', async function (this: PrefersColorSchemeContext, assert) {
        await click('[data-test-theme-toggle-button]');

        assert.dom().doesNotHaveClass(DARK_CLASS);

        await click('[data-test-theme-toggle-button]');

        assert.dom().hasClass(DARK_CLASS);
      });

      test('can be toggled with prefers-color-scheme setting', async function (this: PrefersColorSchemeContext, assert) {
        this.prefersColorScheme.isDark = false;
        await settled();

        assert.dom().doesNotHaveClass(DARK_CLASS);

        this.prefersColorScheme.isDark = true;
        await settled();

        assert.dom().hasClass(DARK_CLASS);
      });

      test('can be toggled by all the things', async function (this: PrefersColorSchemeContext, assert) {
        await click('[data-test-theme-toggle-button]');

        assert.dom().doesNotHaveClass(DARK_CLASS);

        this.prefersColorScheme.isDark = true;
        await settled();

        assert.dom().hasClass(DARK_CLASS);

        this.prefersColorScheme.isDark = false;
        await settled();

        assert.dom().doesNotHaveClass(DARK_CLASS);

        await click('[data-test-theme-toggle-button]');

        assert.dom().hasClass(DARK_CLASS);
      });
    });

    module('light', function (hooks) {
      hooks.beforeEach(async function (
        this: PrefersColorSchemeContext,
        assert
      ) {
        // this is the default, but just in case
        this.prefersColorScheme.isDark = false;

        await visit('/');

        assert.dom().doesNotHaveClass(DARK_CLASS, 'starts off as light');
      });

      test('can be manually toggled', async function (this: PrefersColorSchemeContext, assert) {
        await click('[data-test-theme-toggle-button]');

        assert.dom().hasClass(DARK_CLASS);

        await click('[data-test-theme-toggle-button]');

        assert.dom().doesNotHaveClass(DARK_CLASS);
      });

      test('can be toggled with prefers-color-scheme setting', async function (this: PrefersColorSchemeContext, assert) {
        this.prefersColorScheme.isDark = true;
        await settled();

        assert.dom().hasClass(DARK_CLASS);

        this.prefersColorScheme.isDark = false;
        await settled();

        assert.dom().doesNotHaveClass(DARK_CLASS);
      });

      test('can be toggled by all the things', async function (this: PrefersColorSchemeContext, assert) {
        await click('[data-test-theme-toggle-button]');

        assert.dom().hasClass(DARK_CLASS);

        this.prefersColorScheme.isDark = false;
        await settled();

        assert.dom().doesNotHaveClass(DARK_CLASS);

        this.prefersColorScheme.isDark = true;
        await settled();

        assert.dom().hasClass(DARK_CLASS);

        await click('[data-test-theme-toggle-button]');

        assert.dom().doesNotHaveClass(DARK_CLASS);
      });
    });
  });
});
