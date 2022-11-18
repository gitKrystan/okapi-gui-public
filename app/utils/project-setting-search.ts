import { assert } from '@ember/debug';
import type ProjectSetting from 'okapi/models/project-setting';
import type { FilterKeysByType } from 'okapi/types/utils';
import { escapeStringForRegex } from 'okapi/utils/string';
import type { MatchMetadata } from './filter-search';
import FilterSearch, { Filter, Indexer } from './filter-search';

const LAZY = '(.*?)';

export class IndexedSetting {
  constructor(readonly setting: ProjectSetting) {}

  get id(): string {
    return this.setting.id;
  }

  get name(): string {
    return this.setting.name;
  }

  get description(): string {
    return this.setting.description;
  }
}

/**
 * Implements the abstract `Indexer` class for `ProjectSettings`. Uses the
 * `IndexedSetting` class to implement its `index` method for an
 * `ProjectSetting`.
 */
export class SettingIndexer extends Indexer<ProjectSetting, IndexedSetting> {
  /**
   * Indexes the setting name to the internal format to make it easier to find
   * and suggest matches for a particular query.
   *
   * @param item The setting to index.
   */
  index(item: ProjectSetting): IndexedSetting {
    return new IndexedSetting(item);
  }

  /** Extracts the setting from its indexed version. */
  extract({ setting }: IndexedSetting): ProjectSetting {
    return setting;
  }
}

export interface StringQuery {
  token: string;
  regexp: RegExp;
  match?: RegExpExecArray;
  [key: string]: unknown;
}

/**
 * A `Filter` that will search within a string.
 *
 * E.g. "Pickle" should match "I love pickles"
 */
export abstract class StringSearchFilter extends Filter<
  IndexedSetting,
  StringQuery[]
> {
  constructor(
    protected field: FilterKeysByType<IndexedSetting, string | null>
  ) {
    super();
  }

  /** Parse the tokenized query into the internal format. */
  parse(tokens: string[]): StringQuery[] {
    let tokenPatterns = this.makeTokenPatterns(tokens);

    return [
      makeAndQuery(tokens, tokenPatterns),
      ...makeOrQueries(tokenPatterns),
    ];
  }

  protected abstract makeTokenPatterns(
    tokens: string[]
  ): Record<string, string>;

  /**
   * Returns a MatchData record when the setting id query matches the tokenized
   * setting id, and false otherwise.
   */
  match(
    entry: IndexedSetting,
    query: StringQuery[]
  ): Array<StringQuery & MatchMetadata> | false {
    let value = entry[this.field];
    if (value) {
      let [andQuery, ...orQueries] = query;

      assert('expected andQuery', andQuery);
      let andMatch = andQuery.regexp.exec(value);

      if (andMatch) {
        return [
          {
            ...andQuery,
            match: andMatch,
            score: scoreMatch(value, andQuery, andMatch),
          },
        ];
      }

      return this.orQueryMatch(orQueries, value);
    } else {
      return false;
    }
  }

  protected orQueryMatch(
    orQueries: StringQuery[],
    value: string
  ): Array<StringQuery & MatchMetadata> | false {
    let result: Array<StringQuery & MatchMetadata> = [];
    for (let q of orQueries) {
      let match = q.regexp.exec(value);

      if (match) {
        result.push({ ...q, match, score: scoreMatch(value, q, match) });
      }
    }
    return result.length > 0 ? result : false;
  }
}

export class StringSequentialFilter extends StringSearchFilter {
  makeTokenPatterns(tokens: string[]): Record<string, string> {
    let tokenPatterns: Record<string, string> = {};
    for (let token of tokens) {
      tokenPatterns[token] ??= `(${escapeStringForRegex(token)})`;
    }
    return tokenPatterns;
  }
}

/**
 * A `Filter` that will search within a string using a "wildcard"-delimited
 * search.
 *
 * E.g. "ABC" should match "All Bout Camels" and "Antibiotic Cocoons"
 */
export class StringWildcardFilter extends StringSearchFilter {
  makeTokenPatterns(tokens: string[]): Record<string, string> {
    let tokenPatterns: Record<string, string> = {};
    for (let token of tokens) {
      tokenPatterns[token] ??= [...token]
        .map((char) => `(${escapeStringForRegex(char)})`)
        .join(LAZY);
    }
    return tokenPatterns;
  }

  protected override orQueryMatch(
    orQueries: StringQuery[],
    value: string
  ): Array<StringQuery & MatchMetadata> | false {
    let result: Array<StringQuery & MatchMetadata> = [];
    let lastIndex = 0;
    for (let q of orQueries) {
      let match = q.regexp.exec(value);

      if (match && match.index >= lastIndex) {
        result.push({ ...q, match, score: scoreMatch(value, q, match) });
        lastIndex += match.index + match[0].length;
      }
    }
    return result.length > 0 ? result : false;
  }
}

/**
 * Given a list of `ProjectSettings` and a user query, this class provides
 * methods for making a new search object.
 */
export default class ProjectSettingSearch extends FilterSearch<
  ProjectSetting,
  IndexedSetting
> {
  static from(
    settings: readonly ProjectSetting[],
    query = ''
  ): ProjectSettingSearch {
    return new this(
      settings,
      {
        id: new StringWildcardFilter('id'),
        name: new StringWildcardFilter('name'),
        description: new StringSequentialFilter('description'),
      },
      query
    );
  }

  private constructor(
    settings: readonly ProjectSetting[],
    filters: Record<string, Filter<IndexedSetting>>,
    query = ''
  ) {
    super(settings, new SettingIndexer(), filters, query);
  }
}

function scoreMatch(
  value: string,
  query: StringQuery,
  match: RegExpExecArray
): number {
  // score: 0 = best, infinity = worst

  // The further back the match is, the worse the score
  // E.g. "(c)at" should score better than "ugly (c)at"
  let startScore = match.index / value.length;

  // The "wider" the match is, the worse the score.
  // E.g. "(cat)" should score better than "(c)up (a) (t)ea"
  let matchLength = match[0].length;
  assert('expected matchLength', matchLength);
  let widthScore = (matchLength - query.token.length) / value.length;
  assert('expected lengthScore to be gte zero', widthScore >= 0);

  // The more un-matched characters left in the full value, the worse the score
  // E.g. "a (cat)" should score better than "a (cat)erpillar"
  // We don't do this as a true percentage of the total length because we also
  // want to prioritize matching shorter fields (e.g. id fields vs descriptions)
  let percentScore = (value.length - query.token.length) / value.length;
  assert('expected percentScore to be gte zero', percentScore >= 0);

  return Number(((startScore + widthScore + percentScore) / 3).toPrecision(4));
}

function searchRegExp(pattern: string): RegExp {
  return new RegExp(pattern, 'i');
}

function makeAndQuery(
  tokens: string[],
  tokenPatterns: Record<string, string>
): {
  token: string;
  regexp: RegExp;
} {
  return {
    token: tokens.join(' '),
    regexp: searchRegExp(
      tokens
        .map((token) => {
          let pattern = tokenPatterns[token];
          assert(`could not find pattern for token ${token}`, pattern);
          return pattern;
        })
        .join(LAZY)
    ),
  };
}

function makeOrQueries(tokenPatterns: Record<string, string>): Array<{
  token: string;
  regexp: RegExp;
}> {
  return Object.entries(tokenPatterns).map(([token, pattern]) => {
    let regexp = searchRegExp(pattern);
    return {
      token,
      regexp,
    };
  });
}
