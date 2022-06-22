import { action } from '@ember/object';
import { AbstractService } from 'ember-swappable-service';

export type PreferenceChangeListener = (isDark: boolean) => void;

export default abstract class PrefersColorSchemeService extends AbstractService {
  willDestroy(): void {
    this.preferenceChangeListeners = new Set<PreferenceChangeListener>();
  }

  abstract get isDark(): boolean;

  registerPreferenceChangeListener(callback: PreferenceChangeListener): void {
    this.preferenceChangeListeners.add(callback);
  }

  protected preferenceChangeListeners = new Set<PreferenceChangeListener>();

  @action protected notifyListeners(isDark: boolean): void {
    this.preferenceChangeListeners.forEach((cb) => cb(isDark));
  }
}
