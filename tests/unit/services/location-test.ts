import { getOwner } from '@ember/application';
import DefaultLocationService, {
  Location,
} from 'okapi/services/location/-default';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

class MockLocation implements Location {
  private _hash = '';

  get hash(): string {
    return `#${this._hash}`;
  }

  set hash(value: string) {
    this._hash = value;
  }
}

// Tests the location/-default implementation
module('Unit | Service | location', function (hooks) {
  setupTest(hooks);

  test('id delegates to location.href (without #)', function (assert) {
    let mockLocation = new MockLocation();
    let service = new DefaultLocationService(getOwner(this), mockLocation);
    service.id = 'Aino';

    assert.deepEqual(mockLocation.hash, '#Aino');
  });
});
