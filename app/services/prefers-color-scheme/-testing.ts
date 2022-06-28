import { tracked } from '@glimmer/tracking';
import PrefersColorSchemeService from 'okapi/services/prefers-color-scheme';

export default class TestingPrefersColorSchemeService extends PrefersColorSchemeService {
  @tracked private _isDark = false;

  get isDark(): boolean {
    return this._isDark;
  }

  /** Test-only setter */
  set isDark(value: boolean) {
    this._isDark = value;
    this.notifyListeners(value);
  }
}
