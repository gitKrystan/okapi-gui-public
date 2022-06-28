import { assert as emberAssert } from '@ember/debug';
import { click, find, settled, TestContext } from '@ember/test-helpers';
import { SnapshotOptions as PercyOptions } from '@percy/core';
import percySnapshot from '@percy/ember';
import ThemeService from 'okapi/services/theme';

export interface SnapshotOptions {
  prefix?: string;
  suffix?: string;
  owner?: TestContext['owner'];
  options?: PercyOptions;
}

const USED_DESCRIPTIONS = new Set<string>();

/**
 * Generates a snapshot for visual diffing with a generated description based
 * on the passed in test assert object.
 *
 * NOTE: If you are taking more than one snapshot in a test, you need to pass a
 * prefix and/or suffix to additional snapshots to ensure snapshot description
 * uniqueness.
 */
export async function snapshot(
  assert: Assert,
  { prefix, suffix, options }: SnapshotOptions = {}
): Promise<void> {
  let description = testDescription(assert, { prefix, suffix });

  if (USED_DESCRIPTIONS.has(description)) {
    throw new Error(
      `Duplicate snapshot description "${description}". Please add a prefix or suffix to ensure uniqueness.`
    );
  } else {
    await percySnapshot(description, options);
    USED_DESCRIPTIONS.add(description);
  }
}

/**
 * Generates snapshots for visual diffing with generated descriptions based
 * on the passed in test assert object. Will take TWO snapshots when called:
 * - One in "light" (default) mode
 * - One in "dark" mode
 *
 * NOTE: If you are taking more than one snapshot in a test, you need to pass a
 * prefix and/or suffix to additional snapshots to ensure snapshot description
 * uniqueness.
 */
export async function snapshotDarkMode(
  assert: Assert,
  options?: SnapshotOptions
): Promise<void> {
  await snapshot(assert, options);

  let toggle = find('[data-test-theme-toggle-button]');

  if (toggle) {
    await click(toggle);
    assert
      .dom(toggle)
      .hasAria('checked', 'true', 'snapshot setup: toggle checked');
  } else {
    emberAssert(
      'snapshot setup failure: no data-test-theme-toggle-button element \
      detected. For non-acceptance tests, you must pass in options.owner',
      options?.owner
    );
    let theme = options.owner.lookup('service:theme') as ThemeService;
    theme.toggle();
    await settled();
  }

  assert
    .dom()
    .hasClass('Application--theme-dark', 'snapshot setup: dark mode enabled');

  let darkModeOptions = {
    ...options,
    prefix: '[DARK]',
  };

  if (options?.prefix) {
    darkModeOptions.prefix = `${darkModeOptions.prefix} ${options.prefix}`;
  }

  await snapshot(assert, darkModeOptions);
}

function testDescription(
  assert: Assert,
  { prefix, suffix }: Pick<SnapshotOptions, 'prefix' | 'suffix'> = {}
): string {
  // @ts-expect-error Assert.test is not documented
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  let name = assert.test.testName as string;

  // @ts-expect-error Assert.test is not documented
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  let module = assert.test.module.name as string;

  let description = `${module} | ${name}`;

  if (prefix) {
    description = `${prefix} ${description}`;
  }
  if (suffix) {
    description = `${description} ${suffix}`;
  }

  return description.trim();
}
