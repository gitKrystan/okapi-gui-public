import { assert } from '@ember/debug';
import { isBlank } from '@ember/utils';
import Component from '@glimmer/component';

export interface RegExpHighlightSig {
  Args: {
    text: string;
    matches: RegExpExecArray[];
  };
}

interface Token {
  text: string;
  isMatch: boolean;
}

/**
 * This function combines adjacent highlight tokens that get wrapped in span
 * tags, preventing two adjacent highlight tokens from having separate spans.
 * This can happen because we capture word and non-word character groups
 * separately to fuzzify the search.
 */
function extractTokens(text: string, execArrays: RegExpExecArray[]): Token[] {
  let chars: Token[] = text.split('').map((char) => ({
    text: char,
    isMatch: false,
  }));

  for (let execArray of execArrays) {
    // Exec Arrays are the result of RegExp.exec, meaning the first item
    // contains the entire matched value. We only want the capture groups that
    // follow.
    let [_, ...captures] = execArray;
    let charIndex = execArray.index;

    captures.forEach((capture, i) => {
      if (i % 2) {
        // odd captures are not matches for this execArray, so skip those chars
        charIndex += capture.length;
      } else {
        // even captures are matches, so mark the relevant characters as matched
        for (let match of capture) {
          let char = chars[charIndex];
          assert(
            `Expected to find char matching ${match} at index ${charIndex} for text ${text}`,
            char?.text === match
          );
          char.isMatch = true;
          charIndex += 1;
        }
      }
    });
  }

  // [{ text: 'matched', isMatch: true }, { text: 'nope', isMatch: false }]
  let merged: Token[] = [];
  chars.forEach((char, i) => {
    let prev = merged[merged.length - 1];
    let next = chars[i + 1];
    if (
      // Merge together characters with the same `isMatch`
      prev?.isMatch === char.isMatch ||
      // Merge whitespace characters if the prev and next tokens have the same `isMatch`
      (isBlank(char.text) && prev && prev.isMatch === next?.isMatch)
    ) {
      prev.text += char.text;
    } else {
      merged.push(char);
    }
  });

  return merged;
}

export default class RegExpHighlight extends Component<RegExpHighlightSig> {
  <template>
    {{#each this.tokens as |token i|}}
      {{#if token.isMatch~}}
        <mark class="RegExpHighlight">{{token.text}}</mark>
      {{~else~}}
        {{token.text}}
      {{~/if}}
    {{/each}}
  </template>

  private get tokens(): Token[] {
    let { text, matches } = this.args;
    assert('matches array has no length', matches.length);
    return extractTokens(text, matches);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    RegExpHighlight: typeof RegExpHighlight;
  }
}
