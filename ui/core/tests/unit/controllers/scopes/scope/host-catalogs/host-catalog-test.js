import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | scopes/scope/host-catalogs/host-catalog', function (
  hooks
) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/host-catalogs/host-catalog'
    );
    assert.ok(controller);
  });
});
