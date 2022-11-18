import { action } from '@ember/object';
import PrefersColorSchemeService from 'okapi/services/prefers-color-scheme';

export default class DefaultPrefersColorSchemeService extends PrefersColorSchemeService {
  constructor(properties?: Record<string, undefined>) {
    super(properties);
    this.setup();
  }

  override willDestroy(): void {
    this.teardown();
    super.willDestroy();
  }

  get isDark(): boolean {
    return this.darkQuery.matches;
  }

  private readonly darkQuery = window.matchMedia(
    '(prefers-color-scheme: dark)'
  );

  private setup(): void {
    // NOTE: This fires even when you are just turning on light mode
    this.darkQuery.addEventListener('change', this.preferenceDidChange);
  }

  private teardown(): void {
    this.darkQuery.removeEventListener('change', this.preferenceDidChange);
  }

  @action private preferenceDidChange(event: MediaQueryListEvent): void {
    this.notifyListeners(event.matches);
  }
}
