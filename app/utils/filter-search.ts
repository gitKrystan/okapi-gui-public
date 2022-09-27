import { tracked } from '@glimmer/tracking';
import { dictionary } from 'okapi/types/utils';

/**
 * Provides type signatures for abstract methods that can be used to convert an
 * indexed item into an internal format as well as extract the original item
 * from the indexed format.
 *
 * @template Item The raw item.
 * @template IndexedItem The internal format of an item intended to make it
 * easier to find matches for a query.
 */
export abstract class Indexer<Item, IndexedItem> {
  /**
   * Index an item into the internal Index entry.
   *
   * @param item The item to index
   */
  abstract index(item: Item): IndexedItem;

  /**
   * Extract the item from the internal Index entry.
   *
   * @param indexedItem The search index entry
   */
  abstract extract(indexedItem: IndexedItem): Item;
}

export interface MatchMetadata {
  score: number;
  token: string;
  [key: string]: unknown;
}

/**
 * An abstract class used to create individual filters for a new instance of the
 * `FilterSearch` class.
 * Provides type signatures for parsing a search query into tokens and
 * determining whether an `IndexedItem` matches the parsed query.
 */
export abstract class Filter<IndexedItem, Query = unknown> {
  /**
   * Parse a user search query into the internal format.
   *
   * @param tokens The tokenized search query
   */
  abstract parse(tokens: string[]): Query;

  /**
   * The implementation for this should check whether an Index entry matches
   * a parsed Query, and either return a boolean reflecting the match status OR
   * an object with extra information on the match when the check is truthy and
   * false otherwise.
   *
   * @param item The search index entry
   * @param query The parsed search query
   */
  abstract match(item: IndexedItem, query: Query): MatchMetadata[] | false;
}

export interface MatchItem<Item> {
  item: Item;
  score: number;
  metadata?: Record<string, MatchMetadata[]>;
}

/**
 * Given a user query and items to search through, this class coordinates
 * multiple filters and an indexer that makes searching through the items
 * easier. It contains properties that return results for display.
 */
export default class FilterSearch<Item, IndexedItem = Item> {
  @tracked private _query: string;

  constructor(
    readonly items: readonly Item[],
    private readonly indexer: Indexer<Item, IndexedItem>,
    private readonly filters: Record<string, Filter<IndexedItem>> = {},
    query = '',
    private readonly multiTokenStrategy: 'any' | 'every' = 'every'
  ) {
    this._query = query;
  }

  /**
   * The user query.
   */
  get query(): string {
    return this._query;
  }

  set query(query: string) {
    if (this._query !== query) {
      this._query = query;
    }
  }

  /**
   * A list of filter names.
   */
  get filterNames(): string[] {
    return Object.keys(this.filters).map((name) => `${name}:`);
  }

  /**
   * Given a list of search tokens, separate out any named filters and the
   * default string filter, then use those to filter the indexedItems and return
   * only those items that match all of the filters in the user query.
   *
   */
  // eslint-disable-next-line complexity
  get results(): ReadonlyArray<MatchItem<Item>> {
    let tokens = this.searchTokens;
    let filters = Object.entries(this.filters).map(([name, filter]) => ({
      filter,
      name,
      query: filter.parse(tokens),
    }));

    let results = [];

    for (let indexedItem of this.indexedItems) {
      let metadata = dictionary<MatchMetadata[]>();
      let matchedTokens = new Set<string>();
      let totalScore = 0;
      let metaCount = 0;

      for (let { filter, name, query } of filters) {
        let matchMetadata = filter.match(indexedItem, query);

        if (matchMetadata) {
          metadata[name] = matchMetadata;
          for (let meta of matchMetadata) {
            matchedTokens.add(meta.token);
            totalScore += meta.score;
            metaCount += 1;
          }
        }
      }

      if (
        matchedTokens.has(this.trimmedQuery) ||
        tokens[this.multiTokenStrategy]((t) => matchedTokens.has(t))
      ) {
        let item = this.indexer.extract(indexedItem);
        results.push({
          item,
          metadata,
          score: Number((totalScore / metaCount).toPrecision(4)),
        });
      }
    }

    return results.sort((a, b) => a.score - b.score);
  }

  get unfilteredResults(): ReadonlyArray<MatchItem<Item>> {
    return this.items.map((item) => ({ item, score: 0 }));
  }

  private get trimmedQuery(): string {
    return this.query.trim();
  }

  /**
   * The search tokens.
   */
  private get searchTokens(): string[] {
    let { trimmedQuery } = this;

    if (trimmedQuery === '') {
      return [];
    } else {
      return trimmedQuery.split(/\s+/);
    }
  }

  /**
   * The search index.
   */
  private get indexedItems(): IndexedItem[] {
    return this.items.map((item) => this.indexer.index(item));
  }
}
