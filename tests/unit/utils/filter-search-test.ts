import { module, test } from 'qunit';

import { setupTest } from 'okapi/tests/helpers';
import type { MatchItem, MatchMetadata } from 'okapi/utils/filter-search';
import FilterSearch, { Filter, Indexer } from 'okapi/utils/filter-search';
import { escapeStringForRegex } from 'okapi/utils/string';

module('Unit | Utils | filter-search', function (hooks) {
  setupTest(hooks);

  module('StringFilterSearch', function () {
    interface IndexedString {
      item: string;
      indexed: string;
    }

    interface Query {
      tokens: string[];
      regexp: RegExp;
    }

    class StringIndexer extends Indexer<string, IndexedString> {
      index(item: string): IndexedString {
        return { item, indexed: item.toLowerCase() };
      }

      extract({ item }: IndexedString): string {
        return item;
      }
    }

    class StringFilter extends Filter<IndexedString, Query> {
      parse(tokens: string[]): Query {
        // stripe con create => /stripe.*con.*create/i
        let regexp = new RegExp(
          tokens.map((token) => escapeStringForRegex(token)).join('.*'),
          'i'
        );

        return { tokens, regexp };
      }

      match({ item }: IndexedString, query: Query): MatchMetadata[] | false {
        let results: MatchMetadata[] = [];
        // This is weird but should work for the existing tests
        if (query.regexp.test(item)) {
          results.push({ token: query.tokens.join(' '), score: 0 });
        }

        return results.length ? results : false;
      }
    }

    function buildSearch(
      items: string[],
      query = ''
    ): FilterSearch<string, IndexedString> {
      return new FilterSearch(
        items,
        new StringIndexer(),
        {
          default: new StringFilter(),
        },
        query,
        'any'
      );
    }

    test('it can filter a list of strings based on case-insensitive substring matching', function (assert) {
      let items = [
        'SessionsController#new',
        'ErrorsController#not_found',
        'GithubController#commit',
        'ActionDispatch::Routing::RouteSet',
        'OssDeploysController#index',
        'StripeController#webhook[invoice.created]',
        'TeamsController#add',
        'StripeController#webhook[customer.updated]',
        'ContactController#create',
        'SessionsController#github_create',
        'Sidekiq::Admin',
      ];

      let search = buildSearch(items);

      assert.strictEqual(search.query, '', 'query is initially empty');

      assert.deepEqual(
        search.results.map((r) => r.item),
        items,
        'empty query matches every item'
      );

      search.query = 'c';

      assert.deepEqual(
        search.results.map((r) => r.item),
        [
          'SessionsController#new',
          'ErrorsController#not_found',
          'GithubController#commit',
          'ActionDispatch::Routing::RouteSet',
          'OssDeploysController#index',
          'StripeController#webhook[invoice.created]',
          'TeamsController#add',
          'StripeController#webhook[customer.updated]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing c (case insensitive)'
      );

      search.query = 'create';

      assert.deepEqual(
        search.results.map((r) => r.item),
        [
          'StripeController#webhook[invoice.created]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing create'
      );

      search.query = 'created';

      assert.deepEqual(
        search.results.map((r) => r.item),
        ['StripeController#webhook[invoice.created]'],
        'it matches items containing created'
      );
    });

    test('it can filter a list of strings against multiple search tokens', function (assert) {
      let items = [
        'SessionsController#new',
        'ErrorsController#not_found',
        'GithubController#commit',
        'ActionDispatch::Routing::RouteSet',
        'OssDeploysController#index',
        'StripeController#webhook[invoice.created]',
        'TeamsController#add',
        'StripeController#webhook[customer.updated]',
        'ContactController#create',
        'SessionsController#github_create',
        'Sidekiq::Admin',
      ];

      let search = buildSearch(items);

      assert.strictEqual(search.query, '', 'query is initially empty');

      assert.deepEqual(
        search.results.map((r) => r.item),
        items,
        'empty query matches every item'
      );

      search.query = 'con';

      assert.deepEqual(
        search.results.map((r) => r.item),
        [
          'SessionsController#new',
          'ErrorsController#not_found',
          'GithubController#commit',
          'OssDeploysController#index',
          'StripeController#webhook[invoice.created]',
          'TeamsController#add',
          'StripeController#webhook[customer.updated]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing con (case insensitive)'
      );

      search.query = 'con create';

      assert.deepEqual(
        search.results.map((r) => r.item),
        [
          'StripeController#webhook[invoice.created]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing con and create'
      );

      search.query = 'con create stripe';

      assert.deepEqual(
        search.results.map((r) => r.item),
        [],
        'it matches items containing con, create and stripe, in that order (there are none)'
      );

      search.query = 'stripe con create';

      assert.deepEqual(
        search.results.map((r) => r.item),
        ['StripeController#webhook[invoice.created]'],
        'it matches items containing stripe, con and create, in that order'
      );
    });
  });

  module('EndpointishFilterSearch', function () {
    class Endpointish {
      constructor(
        readonly name: string,
        readonly response?: string,
        readonly typical = 50,
        readonly problem = 100
      ) {}

      toString(): string {
        let { name, response } = this;

        if (response) {
          return `${name} (${response})`;
        } else {
          return name;
        }
      }
    }

    class IndexedEndpointish {
      readonly tokens: string[];

      constructor(readonly endpoint: Endpointish) {
        this.tokens = [
          ...new Set([
            // [SessionsController#create]
            endpoint.name,
            // [SessionsController, create]
            ...endpoint.name.split(/\W+/),
          ]),
        ];
      }

      get name(): string {
        return this.endpoint.name;
      }

      get response(): string | undefined {
        return this.endpoint.response;
      }

      get typical(): number {
        return this.endpoint.typical;
      }

      get problem(): number {
        return this.endpoint.problem;
      }
    }

    class EndpointIndexer extends Indexer<Endpointish, IndexedEndpointish> {
      index(item: Endpointish): IndexedEndpointish {
        return new IndexedEndpointish(item);
      }

      extract(item: IndexedEndpointish): Endpointish {
        return item.endpoint;
      }
    }

    interface EndpointNameQuery {
      tokens: string[];
      regexp: RegExp;
      highlightRegex: RegExp;
    }

    class EndpointNameFilter extends Filter<
      IndexedEndpointish,
      EndpointNameQuery
    > {
      parse(tokens: string[]): EndpointNameQuery {
        tokens = tokens.filter((t) => t.split(':').length === 1);
        let regexp = new RegExp(
          tokens.map((token) => escapeStringForRegex(token)).join('.*'),
          'i'
        );
        let highlightRegex = new RegExp(
          `(.*?)${tokens
            .map((token) => `(${escapeStringForRegex(token)})`)
            .join('(.*?)')}(.*)`,
          'i'
        );

        return {
          tokens,
          regexp,
          highlightRegex,
        };
      }

      match(
        entry: IndexedEndpointish,
        query: EndpointNameQuery
      ): MatchMetadata[] | false {
        if (query.regexp.test(entry.name)) {
          return [
            {
              token: query.tokens.join(' '),
              score: 0,
              highlightRegex: query.highlightRegex,
            },
          ];
        } else {
          return false;
        }
      }
    }

    class ResponseTypeFilter extends Filter<IndexedEndpointish, string[]> {
      // tokens = ["json", "html"]
      parse(tokens: string[]): string[] {
        let parsed = [];
        for (let token of tokens) {
          let [field, value] = token.split(':');
          if (field === 'response' && value) {
            parsed.push(value);
          }
        }
        return parsed;
      }

      match(
        { response }: IndexedEndpointish,
        responses: string[]
      ): MatchMetadata[] | false {
        if (response !== undefined && responses.includes(response)) {
          return [{ token: `response:${response}`, score: 0 }];
        } else {
          return false;
        }
      }
    }

    class Range {
      static parse(query: string): Range {
        if (query.startsWith('>=')) {
          // ">=5" => lowerBound 5, includeLowerBound: true
          return new Range(parseInt(query.slice(2), 10), Infinity, true);
        } else if (query.startsWith('>')) {
          // ">5"  => lowerBound 5, includeLowerBound: false
          return new Range(parseInt(query.slice(1), 10), Infinity);
        } else if (query.startsWith('<=')) {
          // "<=5" => upperBound 5, inclusiveUpperBound: true
          return new Range(
            -Infinity,
            parseInt(query.slice(2), 10),
            false,
            true
          );
        } else {
          // "<5"  => upperBound 5, inclusiveUpperBound: false
          return new Range(-Infinity, parseInt(query.slice(1), 10));
        }
      }

      constructor(
        private lowerBound: number,
        private upperBound: number,
        private inclusiveLowerBound = false,
        private inclusiveUpperBound = false
      ) {}

      contains(value: number): boolean {
        let {
          lowerBound,
          upperBound,
          inclusiveLowerBound,
          inclusiveUpperBound,
        } = this;

        return (
          (inclusiveLowerBound ? value >= lowerBound : value > lowerBound) &&
          (inclusiveUpperBound ? value <= upperBound : value < upperBound)
        );
      }
    }

    class ResponseTimeFilter extends Filter<IndexedEndpointish, Range[]> {
      constructor(private field: 'typical' | 'problem') {
        super();
      }

      parse(tokens: string[]): Range[] {
        let parsed = [];
        for (let token of tokens) {
          let [field, value] = token.split(':');
          if (field === this.field && value) {
            parsed.push(Range.parse(value));
          }
        }
        return parsed;
      }

      match(
        endpoint: IndexedEndpointish,
        query: Range[]
      ): MatchMetadata[] | false {
        let responseTime = endpoint[this.field];
        if (query.every((range) => range.contains(responseTime))) {
          return [{ token: query.join(' '), score: 0 }];
        } else {
          return false;
        }
      }
    }

    function buildSearch(
      items: Endpointish[]
    ): FilterSearch<Endpointish, IndexedEndpointish> {
      return new FilterSearch(
        items,
        new EndpointIndexer(),
        {
          default: new EndpointNameFilter(),
          typical: new ResponseTimeFilter('typical'),
          problem: new ResponseTimeFilter('problem'),
          response: new ResponseTypeFilter(),
        },
        undefined,
        'any'
      );
    }

    function namesFor(
      results: ReadonlyArray<MatchItem<Endpointish>>
    ): string[] {
      return results.map((result) => result.item.toString());
    }

    test('it can filter a list of endpoints-ish based on case-insensitive substring matching against their names', function (assert) {
      let items = [
        new Endpointish('SessionsController#new'),
        new Endpointish('Errors#not_found'),
        new Endpointish('GithubController#commit'),
        new Endpointish('ActionDispatch::Routing::RouteSet'),
        new Endpointish('OssDeploysController#index'),
        new Endpointish('StripeController#webhook[invoice.created]'),
        new Endpointish('TeamsController#add'),
        new Endpointish('StripeController#webhook[customer.updated]'),
        new Endpointish('ContactController#create'),
        new Endpointish('SessionsController#github_create'),
        new Endpointish('Sidekiq::Admin'),
      ];

      let search = buildSearch(items);

      assert.strictEqual(search.query, '', 'query is initially empty');

      assert.deepEqual(
        search.results.map((r) => r.item),
        items,
        'empty query matches every item'
      );

      search.query = 'c';

      assert.deepEqual(
        namesFor(search.results),
        [
          'SessionsController#new',
          'GithubController#commit',
          'ActionDispatch::Routing::RouteSet',
          'OssDeploysController#index',
          'StripeController#webhook[invoice.created]',
          'TeamsController#add',
          'StripeController#webhook[customer.updated]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing c (case insensitive)'
      );

      search.query = 'create';

      assert.deepEqual(
        namesFor(search.results),
        [
          'StripeController#webhook[invoice.created]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing create'
      );

      search.query = 'created';

      assert.deepEqual(
        namesFor(search.results),
        ['StripeController#webhook[invoice.created]'],
        'it matches items containing created'
      );
    });

    test('it can filter a list of endpoints-ish against multiple search tokens', function (assert) {
      let items = [
        new Endpointish('SessionsController#new'),
        new Endpointish('Errors#not_found'),
        new Endpointish('GithubController#commit'),
        new Endpointish('ActionDispatch::Routing::RouteSet'),
        new Endpointish('OssDeploysController#index'),
        new Endpointish('StripeController#webhook[invoice.created]'),
        new Endpointish('TeamsController#add'),
        new Endpointish('StripeController#webhook[customer.updated]'),
        new Endpointish('ContactController#create'),
        new Endpointish('SessionsController#github_create'),
        new Endpointish('Sidekiq::Admin'),
      ];

      let search = buildSearch(items);

      assert.strictEqual(search.query, '', 'query is initially empty');

      assert.deepEqual(
        search.results.map((r) => r.item),
        items,
        'empty query matches every item'
      );

      search.query = 'con';

      assert.deepEqual(
        namesFor(search.results),
        [
          'SessionsController#new',
          'GithubController#commit',
          'OssDeploysController#index',
          'StripeController#webhook[invoice.created]',
          'TeamsController#add',
          'StripeController#webhook[customer.updated]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing con (case insensitive)'
      );

      search.query = 'con create';

      assert.deepEqual(
        namesFor(search.results),
        [
          'StripeController#webhook[invoice.created]',
          'ContactController#create',
          'SessionsController#github_create',
        ],
        'it matches items containing con and create'
      );

      search.query = 'con create stripe';

      assert.deepEqual(
        namesFor(search.results),
        [],
        'it matches items containing con, create and stripe, in that order (there are none)'
      );

      search.query = 'stripe con create';

      assert.deepEqual(
        namesFor(search.results),
        ['StripeController#webhook[invoice.created]'],
        'it matches items containing stripe, con and create, in that order'
      );
    });

    test('it can filter a list of endpoints-ish both by name and by response types', function (assert) {
      let items = [
        new Endpointish('SessionsController#new', 'html'),
        new Endpointish('Errors#not_found'),
        new Endpointish('Errors#not_found', 'html'),
        new Endpointish('Errors#not_found', 'json'),
        new Endpointish('Errors#not_found', 'xml'),
        new Endpointish('GithubController#commit', 'json'),
        new Endpointish('ActionDispatch::Routing::RouteSet'),
        new Endpointish('OssDeploysController#index', 'json'),
        new Endpointish('StripeController#webhook[invoice.created]', 'xml'),
        new Endpointish('TeamsController#add', 'json'),
        new Endpointish('StripeController#webhook[customer.updated]', 'xml'),
        new Endpointish('ContactController#create', 'html'),
        new Endpointish('SessionsController#github_create', 'html'),
        new Endpointish('Sidekiq::Admin', 'html'),
      ];

      let search = buildSearch(items);

      assert.strictEqual(search.query, '', 'query is initially empty');

      assert.deepEqual(
        search.results.map((r) => r.item),
        items,
        'empty query matches every item'
      );

      search.query = 'response:json';

      assert.deepEqual(
        namesFor(search.results),
        [
          'Errors#not_found (json)',
          'GithubController#commit (json)',
          'OssDeploysController#index (json)',
          'TeamsController#add (json)',
        ],
        'it matches endpoints with response type json'
      );

      search.query = 'response:json response:html';

      assert.deepEqual(
        namesFor(search.results),
        [
          'SessionsController#new (html)',
          'Errors#not_found (html)',
          'Errors#not_found (json)',
          'GithubController#commit (json)',
          'OssDeploysController#index (json)',
          'TeamsController#add (json)',
          'ContactController#create (html)',
          'SessionsController#github_create (html)',
          'Sidekiq::Admin (html)',
        ],
        'it matches endpoints with response type json OR html'
      );
    });

    test('the endpoint name filter includes metadata for a highlight regex', function (assert) {
      let items = [
        new Endpointish('StripeController#webhook[invoice.created]'),
        new Endpointish('TeamsController#add'),
        new Endpointish('StripeController#webhook[customer.updated]'),
        new Endpointish('ContactController#create'),
        new Endpointish('SessionsController#github_create'),
      ];

      let search = buildSearch(items);
      search.query = 'troll ate';
      let expected = /(.*?)(troll)(.*?)(ate)(.*)/i;
      let nameMetadata = search.results[0]?.metadata?.['default'];

      assert.deepEqual(nameMetadata?.[0]?.['highlightRegex'], expected);
    });
  });
});
