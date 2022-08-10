import { tracked } from 'tracked-built-ins';

export interface InternalFeatureOptions {
  description?: string;
  isEnabled?: boolean;
  cutoffDate?: string;
}

/**
 * Internal features are not shown on the Labs page and must be enabled with
 * `window.__ok__features.enable('flagKey');` in the console.
 */
export class InternalFeature {
  constructor(
    /**
     * Descriptive feature flag name.
     * Not to be confused with the `flagKey`.
     *
     * @example 'My Feature'
     */
    readonly name: string,
    {
      /**
       * Whether this flag is enabled.
       * Usually `false` by default for internal features.
       */
      isEnabled = false,
      /**
       * Feature flag description.
       *
       * @example
       * 'My feature displays a cat image at the top of every page.'
       */
      description,
      /**
       * If the flag will be removed on a specific date, use this to show the date
       * in the alpha-banner.
       *
       * @example
       * "February 14th, 2023"
       */
      cutoffDate,
    }: InternalFeatureOptions = {}
  ) {
    this.isEnabled = isEnabled;
    this.description = description;
    this.cutoffDate = cutoffDate;
  }

  @tracked isEnabled: boolean;

  /**
   * Whether the flag is visible on the Labs page.
   * Always `false` for internal features.
   */
  readonly isVisible = false as const;

  readonly description?: string;

  readonly cutoffDate?: string;
}

export interface ExternalFeatureOptions {
  description: string;
  isEnabled?: boolean;
  cutoffDate?: string;
  imagePath?: string;
  imageAltText?: string;
}

/**
 * External features will be displayed to users on the Labs page and can be
 * enabled there _or_ by using `window.__ok__features.enable('flagKey');` in the console.
 */
export class ExternalFeature {
  constructor(
    /**
     * Descriptive feature flag name.
     * Not to be confused with the `flagKey`.
     *
     * @example 'My Feature'
     */
    readonly name: string,
    {
      /**
       * Whether this flag is enabled.
       * Usually, we set this to `false` by default.
       * If `false`, users must enable the flag Labs or the console.
       */
      isEnabled = false,
      /**
       * User-facing feature flag description.
       *
       * @example
       * 'My feature displays a cat image at the top of every page.'
       */
      description,
      /**
       * If the flag will be removed on a specific date, use this to show the date
       * in the alpha-banner.
       *
       * @example
       * "February 14th, 2023"
       */
      cutoffDate,
      /**
       * Path to an image example of the feature, to be displayed on the Labs page.
       * If we don't include a path here, the UI will fall back to a default image,
       * so it's highly recommended to include a path here.
       *
       * @example
       * 'images/settings/labs/my-feature.png'
       */
      imagePath,
      /**
       * Alt text for screen readers or to display if the image does not load.
       * If we don't include text here, the UI will fall back to default text, so
       * it's highly recommended to include alt text here.
       *
       * @example
       * 'An image showing a cat at the top of the screen'
       */
      imageAltText,
    }: ExternalFeatureOptions
  ) {
    this.isEnabled = isEnabled;
    this.description = description;
    this.cutoffDate = cutoffDate;
    this.imagePath = imagePath;
    this.imageAltText = imageAltText;
  }
  @tracked isEnabled: boolean;

  /**
   * Whether the flag is visible on the Labs page.
   * Always `true` for external features.
   */
  readonly isVisible = true as const;

  readonly description: string;

  readonly cutoffDate?: string;

  readonly imagePath?: string;

  readonly imageAltText?: string;
}
