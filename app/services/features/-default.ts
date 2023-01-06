import type Owner from '@ember/owner';

import FeaturesService from 'okapi/services/features';

const FEATURE_FLAG_STORAGE_KEY = 'events-app-feature-flags';

/**
 * This implementation of the FeaturesService uses window.localStorage for
 * persistence.
 *
 * TODO: Rewrite this in a future PR to use the real backend for persistence.
 */
export default class DefaultFeaturesService extends FeaturesService {
  constructor(owner: Owner) {
    super(owner);

    void this.fetchOverrides();
  }

  // We are using async here to ensure we return a promise to fulfill the
  // requirements of the FeaturesService interface.
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async fetchFeatures(): Promise<string[]> {
    let features: string[] = [];

    let loadedFeaturesFromStorage =
      localStorage.getItem(FEATURE_FLAG_STORAGE_KEY) ?? '';
    for (let feature of loadedFeaturesFromStorage.split(',')) {
      try {
        features.push(feature);
      } catch {
        this.logger?.log('failed to parse feature:' + feature);
      }
    }

    return features;
  }

  // We are using async here to ensure we return a promise to fulfill the
  // requirements of the FeaturesService interface.
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async saveFeatures(): Promise<void> {
    localStorage.setItem(FEATURE_FLAG_STORAGE_KEY, this.serialize().join(','));
  }
}
