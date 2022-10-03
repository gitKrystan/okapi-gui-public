import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ProjectSetting from 'okapi/models/project-setting';
import type { MatchItem, MatchMetadata } from 'okapi/utils/filter-search';
import ProjectSettingSearch, {
  IndexedSetting,
  StringSequentialFilter,
  StringWildcardFilter,
} from 'okapi/utils/project-setting-search';

function makeSetting({
  name = 'Vault Schema Migration',
  id = 'experimental.vault.schema_version',
  description = 'It does a thing.',
  type = 'boolean' as const,
} = {}): IndexedSetting {
  let setting = new ProjectSetting({ name, id, description, type });
  return new IndexedSetting(setting);
}

module('Unit | Utils | project-setting-search', function (hooks) {
  setupTest(hooks);

  module('StringSequentialFilter', function () {
    test('it can match a setting description', function (assert) {
      let filter = new StringSequentialFilter('description');

      let match = (desc: string, query: string): MatchMetadata[] | false => {
        let setting = makeSetting({ description: desc });
        let parsed = filter.parse(query.split(' '));
        return filter.match(setting, parsed);
      };

      let assertMatch = (
        desc: string,
        ...cases: Array<{
          query: string;
          matches: Array<{ token: string; score: number }>;
        }>
      ): void => {
        for (let expected of cases) {
          let actual = match(desc, expected.query);
          if (actual) {
            assert.deepEqual(
              actual.map((m) => ({ token: m.token, score: m.score })),
              expected.matches,
              `"${desc}" should match "${expected.query}"`
            );
          } else {
            assert.ok(false, `"${desc}" should match "${expected.query}"`);
          }
        }
      };

      let assertNoMatch = (desc: string, ...queries: string[]): void => {
        for (let query of queries) {
          assert.false(
            match(desc, query),
            `"${desc}" should not match "${query}"`
          );
        }
      };

      assertMatch(
        'It does a thing.',
        {
          query: 'It does a thing.',
          matches: [{ token: 'It does a thing.', score: 0 }],
        },
        {
          query: 'i d a t',
          matches: [{ token: 'i d a t', score: 0.2708 }],
        },
        { query: 'i', matches: [{ token: 'i', score: 0.3125 }] },
        { query: 'does', matches: [{ token: 'does', score: 0.3125 }] }
      );

      assertNoMatch('It does a thing.', 'itdoesathing', 'z', 'idat');
    });
  });

  module('StringWildcardFilter', function () {
    test('it can match a setting id', function (assert) {
      let filter = new StringWildcardFilter('id');

      let match = (id: string, query: string): MatchMetadata[] | false => {
        let setting = makeSetting({ id });
        let parsed = filter.parse(query.split(' '));
        return filter.match(setting, parsed);
      };

      let assertMatch = (
        id: string,
        ...cases: Array<{
          query: string;
          matches: Array<{ token: string; score: number }>;
        }>
      ): void => {
        for (let expected of cases) {
          let actual = match(id, expected.query);
          if (actual) {
            assert.deepEqual(
              actual.map((m) => ({ token: m.token, score: m.score })),
              expected.matches,
              `"${id}" should match "${expected.query}"`
            );
          } else {
            assert.ok(false, `"${id}" should match "${expected.query}"`);
          }
        }
      };

      let assertNoMatch = (id: string, ...queries: string[]): void => {
        for (let query of queries) {
          assert.false(match(id, query), `"${id}" should not match "${query}"`);
        }
      };

      assertMatch(
        'experimental.vault.schema_version',
        {
          query: 'experimental.vault.schema_version',
          matches: [{ token: 'experimental.vault.schema_version', score: 0 }],
        },
        {
          query: 'experimental',
          matches: [{ token: 'experimental', score: 0.2121 }],
        },
        { query: 'i', matches: [{ token: 'i', score: 0.3737 }] },
        {
          query: 'ev schema',
          matches: [{ token: 'ev schema', score: 0.404 }],
        },
        {
          query: 'e v s',
          matches: [{ token: 'e v s', score: 0.4343 }],
        },
        {
          query: 'evs',
          matches: [{ token: 'evs', score: 0.4747 }],
        },
        {
          query: 'evs xac',
          matches: [{ token: 'evs', score: 0.4747 }],
        }
      );

      assertNoMatch('experimental.vault.schema_version', 'z', 'vx');
    });
  });

  module('ProjectSettingSearch', function () {
    test('it searches multiple fields', function (assert) {
      let settings = [
        new ProjectSetting({
          name: 'Vault Schema Migration',
          id: 'experimental.vault.schema_version',
          description: 'It does a thing.',
          type: 'boolean',
        }),
        new ProjectSetting({
          name: 'Autoscale',
          id: 'servers.scaling.autoscale',
          description: 'Scales things automagically.',
          type: 'boolean',
        }),
        new ProjectSetting({
          name: 'Russian Invasion',
          id: 'invasions.foreign.russian',
          description: 'It opens a door for large-scale Russian invasion.',
          type: 'boolean',
        }),
      ];

      let search = ProjectSettingSearch.from(settings);

      let match = (query: string): ReadonlyArray<MatchItem<ProjectSetting>> => {
        search.query = query;
        return search.results;
      };

      let assertMatches = (
        ...cases: Array<{
          query: string;
          matches: Array<{ id: string; score: number }>;
        }>
      ): void => {
        for (let expected of cases) {
          let actual = match(expected.query);
          assert.deepEqual(
            actual.map((m) => ({ id: m.item.id, score: m.score })),
            expected.matches,
            `"${expected.query}" should match the given items`
          );
        }
      };

      let assertNoMatch = (...queries: string[]): void => {
        for (let query of queries) {
          assert.deepEqual(
            match(query),
            [],
            `"${query}" should not match the given items`
          );
        }
      };

      assertMatches(
        {
          query: 'experimental.vault.schema_version',
          matches: [{ id: 'experimental.vault.schema_version', score: 0 }],
        },
        {
          query: 'experimental',
          matches: [{ id: 'experimental.vault.schema_version', score: 0.2121 }],
        },
        {
          query: 'experimental thing',
          matches: [{ id: 'experimental.vault.schema_version', score: 0.3248 }],
        },
        {
          query: 'scale',
          matches: [
            { id: 'servers.scaling.autoscale', score: 0.3678 },
            { id: 'invasions.foreign.russian', score: 0.4762 },
          ],
        },
        {
          query: 'e',
          matches: [
            {
              id: 'experimental.vault.schema_version',
              score: 0.3981,
            },
            {
              id: 'invasions.foreign.russian',
              score: 0.4269,
            },
            {
              id: 'servers.scaling.autoscale',
              score: 0.4316,
            },
          ],
        }
      );

      assertNoMatch('pickle', 'experimental thing butt');
    });
  });
});
