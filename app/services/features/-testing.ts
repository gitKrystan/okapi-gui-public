import type { Features } from 'okapi/services/features';
import FeaturesService from 'okapi/services/features';

/**
 * This implementation of the FeaturesService "persists" the features by storing
 * them in a property that we can inspect later in tests.
 *
 * We do this because we do not want to actually persist anything to
 * window.localStorage since it might leak into other tests.
 *
 * TODO: Once we switch to persisting to the actual back-end, we can either:
 *
 * - Get rid of this implementation altogether (and just mock/assert with Mirage),
 *   OR
 * - If we find the test-specific logic in this implementation useful, we can
 *   rewrite this implementation to extend the default implementation that
 *   relies on the mocked Mirage backend in tests but is still layered with the
 *   additional test-specific logic, OR
 * - Something else I haven't thought of yet.
 */
export default class TestingFeaturesService extends FeaturesService {
  constructor(owner: unknown) {
    super(owner);

    void this.fetchOverrides();
  }

  override logger = null;

  /**
   * An array of feature keys that would have been persisted to the backend if
   * that was implemented. Assert against this in tests.
   */
  get persistedFeatures(): readonly string[] {
    return this._persistedFeatures;
  }

  /**
   * Because the actual set of features changes frequently with development, it
   * is sometimes annoying to rely on that set for testing. For example, when
   * testing the labs page, we might not want to use the _actual_ set of
   * features because it might make the tests break every time we add/remove a
   * feature from the set. In those cases, we can use this method to override
   * the `this.features()` method that returns the feature defaults.
   *
   * In other cases, we _do_ want to use the real set of features. For example,
   * if we are writing tests for a beta feature, we want to enable/disable that
   * feature in tests as necessary. In that case, you can do
   * `featuresService.enable('flagName')` or
   * {@link TestingFeaturesService.overridePersistedFeatures}
   */
  overrideDefaultFeatures(override: () => Features): void {
    this.defaultFeatures = override;
  }

  /**
   * If we want to enable a bunch of flags at once, you can do
   * `testingFeaturesService.overridePersistedFeatures(['flag1', 'flag2'])`
   */
  overridePersistedFeatures(override: string[]): void {
    this._persistedFeatures = override;
  }

  // We are using async here to ensure we return a promise to fulfill the
  // requirements of the FeaturesService interface.
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async fetchFeatures(): Promise<string[]> {
    return this._persistedFeatures;
  }

  // We are using async here to ensure we return a promise to fulfill the
  // requirements of the FeaturesService interface.
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async saveFeatures(): Promise<void> {
    this._persistedFeatures = this.serialize();
  }

  private _persistedFeatures: string[] = [];
}
