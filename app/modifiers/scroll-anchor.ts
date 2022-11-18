import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Ember from 'ember'; // For Ember.testing
import type { ArgsFor, PositionalArgs, NamedArgs } from 'ember-modifier';
import Modifier from 'ember-modifier';
import type LocationService from 'okapi/services/location';

interface ScrollAnchorSignature {
  Element: HTMLAnchorElement;
  Args: {
    Positional: [id: string];
    Named: { link?: boolean; target?: boolean };
  };
}

function cleanup(instance: ScrollAnchor): void {
  instance.el?.removeEventListener('click', instance.mockAnchorClick);
}

export default class ScrollAnchor extends Modifier<ScrollAnchorSignature> {
  @service private declare location: LocationService;

  el: HTMLAnchorElement | null = null;

  constructor(owner: unknown, args: ArgsFor<ScrollAnchorSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  @action mockAnchorClick(): void {
    assert('expected el to be set if clicked', this.el);
    this.location.id = this.el.id;
  }

  override modify(
    anchor: HTMLAnchorElement,
    [id]: PositionalArgs<ScrollAnchorSignature>,
    { link = true, target = true }: NamedArgs<ScrollAnchorSignature>
  ): void {
    this.el = anchor;
    anchor.classList.add('ScrollAnchor');

    if (link) {
      anchor.classList.add('ScrollAnchor--link');
      if (Ember.testing) {
        anchor.addEventListener('click', this.mockAnchorClick);
      } else {
        anchor.href = `#${id}`;
      }
    }

    if (target) {
      anchor.classList.add('ScrollAnchor--target');
      anchor.id = id;

      // Scroll into view on page load if necessary
      let hashLocation = this.location.id;
      if (hashLocation === id) {
        anchor.scrollIntoView();
        anchor.focus();
      }
    }
  }
}
