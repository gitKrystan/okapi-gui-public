import { tracked } from '@glimmer/tracking';
import { AbstractService } from 'ember-swappable-service';
import getDefaultFeatures from 'okapi/services/features/private/default-features';
import type {
  ExternalFeature,
  InternalFeature,
} from './features/private/feature-classes';

export {
  ExternalFeature,
  InternalFeature,
} from './features/private/feature-classes';

declare global {
  interface Window {
    __ok__features?: FeaturesService;
  }
}

/**
 * An object containing all of the available feature flags and their statuses.
 * The object is keyed with the feature flag key. The corresponding value can be
 * either an `ExternalFeature` (displayed on the Labs page) or an
 * `InternalFeature` (not displayed on the Labs page).
 *
 * @example
 * {
 *   internalFlag: new InternalFeature('An Internal Flag') {
 *     description: 'This flag will not be exposed to users in the UI but will be ' +
 *                  'available via window.__ok__features.toggle("internalFlag").',
 *     isEnabled: true, // defaults to false
 *     cutoffDate: February 14th, 2023
 *   },
 *   externalFlag: new ExternalFeature('An External Flag', {
 *     description: 'This flag will be visible to users in the UI and can ' +
 *                  'also be changed with window.__ok__features.toggle("externalFlag").',
 *     isEnabled: true, // defaults to false
 *     cutoffDate: February 14th, 2023
 *     imagePath: 'images/settings/labs/labs-placeholder.png',
 *     imageAltText: 'Alt text for screen readers or to display if the image ' +
 *                   'does not load',
 *   }
 * }
 */
export type Features = Record<string, Feature>;

export type Feature = InternalFeature | ExternalFeature;

export type Overrides = Record<string, true>;

/**
 * A service for fetching, persisting, querying, and updating feature flags.
 */
export default abstract class FeaturesService extends AbstractService {
  @tracked private _flags = this.defaultFeatures();

  get flags(): Readonly<Features> {
    return Object.freeze(this._flags);
  }

  protected abstract fetchFeatures(): Promise<string[]>;

  protected abstract saveFeatures(): Promise<void>;

  protected logger: Console | null = console;

  constructor(owner: unknown) {
    super(owner);

    window.__ok__features = this;
  }

  willDestroy(): void {
    window.__ok__features = undefined;
  }

  /**
   * Determine if the given flag is enabled.
   *
   * @param flag flag to check
   * @returns Whether or not the user has enabled the flag.
   */
  isEnabled(flag: string): boolean {
    return this.flags[flag]?.isEnabled ?? false;
  }

  /**
   * Enable a feature.
   *
   * @param flag flag to enable
   * @returns the set value
   */
  enable(flag: string): boolean {
    return this.setFeature(flag, true);
  }

  /**
   * Disable a feature.
   *
   * @param flag the flag to disable
   * @returns the set value
   */
  disable(flag: string): boolean {
    return this.setFeature(flag, false);
  }

  /**
   * Toggle a feature.
   *
   * @param flag the flag to toggle
   * @returns the updated value
   */
  toggle(flag: string): boolean {
    return this.setFeature(flag, !this.isEnabled(flag));
  }

  /**
   * Reset all features to their default value.
   *
   * @param options options
   * @param [options.save=true] whether to save
   */
  reset({ save = true }: { save?: boolean } = {}): void {
    this._flags = this.defaultFeatures();

    if (save) {
      void this.saveFeatures();
    }
  }

  /**
   * A function returning all the default features.
   * This is provided as a function (as opposed to just a POJO) to allow us to
   * easily get a fresh copy of all the available features (and their default
   * values) without having to implement deep-cloning. This comes in handy for
   * operations such as `reset`.
   */
  protected defaultFeatures(): Features {
    return getDefaultFeatures();
  }

  /**
   * Serialize the overrides into an array that can be saved to the server.
   *
   * @returns The serialized flags.
   */
  protected serialize(): string[] {
    let flags: string[] = [];

    for (let flagName of Object.keys(this.flags).sort((a, b) =>
      a.localeCompare(b)
    )) {
      if (this.isEnabled(flagName)) {
        flags.push(flagName);
      }
    }

    return flags;
  }

  /**
   * Tries to load any persisted overrides.
   *
   * @returns The persisted overrides, if found.
   */
  protected async fetchOverrides(): Promise<void> {
    let fetchFeatures = await this.fetchFeatures();

    for (let flag of fetchFeatures) {
      this.setFeature(flag, true, { save: false });
    }
  }

  /**
   * Set a feature to on (`true`) or off (`false`). If the feature is being turned
   * on, `save` will be called, unless otherwise specified in the options.
   *
   * @param flag flag to set
   * @param value value to set
   * @param options options
   * @param [options.save=true] whether to save the value
   * @returns the set value
   */
  private setFeature(
    flag: string,
    value: boolean,
    { save = true }: { save?: boolean } = {}
  ): boolean {
    let feature = this._flags[flag];

    if (!feature) {
      return false;
    }

    feature.isEnabled = value;
    let toggleValue = value ? 'On' : 'Off';

    if (save) {
      void this.saveFeatures().then((): void => {
        this.logger?.log(`${flag} has been turned ${toggleValue} and saved`);
      });
    } else {
      this.logger?.log(`${flag} has been turned ${toggleValue} but NOT saved`);
    }

    return value;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    features: FeaturesService;
  }
}
