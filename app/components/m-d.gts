import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

import hljs from 'highlight.js';
import { marked } from 'marked';
import { sanitize } from 'dompurify';

interface MdSignature {
  Element: HTMLDivElement;
  Args: {
    raw: string;
    profile: 'description';
  };
}

/**
 * Renders sanitized markdown for the provided raw text.
 */
export default class Markdown extends Component<MdSignature> {
  <template><div data-test-md ...attributes>{{this.html}}</div></template>

  private parser = makeParser();

  private get html(): ReturnType<typeof htmlSafe> {
    return htmlSafe(this.sanitized);
  }

  private get sanitized(): string {
    return sanitize(this.parsed, this.sanitizationConfig);
  }

  private get parsed(): string {
    return this.parser.parse(this.args.raw);
  }

  private get sanitizationConfig(): {
    ALLOWED_TAGS: string[];
    ALLOWED_ATTR: string[];
  } {
    return {
      description: {
        ALLOWED_TAGS: ['code', 'p', 'pre', 'span'],
        ALLOWED_ATTR: ['class'],
      },
    }[this.args.profile];
  }
}

function makeParser(): typeof marked {
  hljs.configure({
    classPrefix: 'Syntax--highlighted__',
  });

  marked.setOptions({
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'Syntax Syntax--block Syntax--highlighted Syntax--language-',
  });

  return marked;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    MD: typeof Markdown;
  }
}
