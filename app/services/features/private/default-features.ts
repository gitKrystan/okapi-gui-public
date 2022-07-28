import { Features, InternalFeature } from 'okapi/services/features';

/**
 * Function that returns the initial Features object with defaults to be
 * overridden by the persisted features.
 *
 * Input new features here!
 */
export default function getDefaultFeatures(): Features {
  return {
    enum: new InternalFeature('Enum', {
      description: 'Enum inputs',
    }),
  };
}
