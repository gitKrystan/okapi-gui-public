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
    for (const cb of this.preferenceChangeListeners) cb(isDark);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    // @ts-expect-error Property...is not assignable to 'string' index type 'Service'.
    'prefers-color-scheme': PrefersColorSchemeService;
  }
}
