import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type PrefersColorSchemeService from 'okapi/services/prefers-color-scheme';

export const DARK_CLASS = 'Application--theme-dark';

export default class ThemeService extends Service {
  @service private declare prefersColorScheme: PrefersColorSchemeService;

  constructor(properties?: Record<string, undefined>) {
    super(properties);
    this.setup();
  }

  get isDark(): boolean {
    return this._isDark;
  }

  @action toggle(): void {
    this.updateDark(!this.isDark);
  }

  @tracked private _isDark = false;

  private get appElement(): HTMLElement {
    let element = document.querySelector('.ember-application');
    assert(
      'expected to find .ember-application HTMLElement',
      element instanceof HTMLElement
    );
    return element;
  }

  private setup(): void {
    this.updateDark(this.prefersColorScheme.isDark);
    this.prefersColorScheme.registerPreferenceChangeListener(this.updateDark);
  }

  @action private updateDark(isDark: boolean): void {
    this._isDark = isDark;
    if (isDark) {
      this.appElement.classList.add(DARK_CLASS);
    } else {
      this.appElement.classList.remove(DARK_CLASS);
    }
  }
}
