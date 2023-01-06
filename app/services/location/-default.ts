import type Owner from '@ember/owner';

import LocationService from 'okapi/services/location';

export interface Location {
  hash: string;
}

export default class DefaultLocationService extends LocationService {
  constructor(
    owner: Owner,
    // eslint-disable-next-line no-restricted-properties
    private location: Location = window.location
  ) {
    super(owner);
  }

  get id(): string {
    return this.location.hash.slice(1);
  }

  set id(value: string) {
    this.location.hash = value;
  }
}
