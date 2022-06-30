import { AbstractService } from 'ember-swappable-service';

/**
 * Provides the `window.location` global as a service that is mocked by default
 * in tests.
 */
export default abstract class LocationService extends AbstractService {
  abstract get id(): string;
  abstract set id(value: string);
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    location: LocationService;
  }
}
