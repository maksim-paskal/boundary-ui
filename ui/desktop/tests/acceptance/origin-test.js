import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  find,
  //findAll,
  //getRootElement
  //setupOnerror,
} from '@ember/test-helpers';
import { run, later } from '@ember/runloop';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
//import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import sinon from 'sinon';
import {
  currentSession,
  // authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import config from '../../config/environment';

module('Acceptance | origin', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let mockIPC;
  let messageHandler;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethods: {
      global: null,
      org: null,
    },
    hostCatalog: null,
    target: null,
  };

  const stubs = {
    global: null,
    org: null,
    ipcService: null,
  };

  const urls = {
    index: '/',
    origin: '/origin',
    scopes: {
      global: null,
      org: null,
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    targets: null,
  };

  hooks.beforeEach(function () {
    invalidateSession();

    // create scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    stubs.global = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: stubs.global,
    });
    stubs.org = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: stubs.org,
    });
    stubs.project = { id: instances.scopes.project.id, type: 'project' };

    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });

    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren'
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withRandomHostSets'
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.global}/projects`;
    urls.targets = `${urls.projects}/targets`;

    class MockIPC {
      origin = null;

      invoke(method, payload) {
        return this[method](payload);
      }

      getOrigin() {
        return this.origin;
      }

      setOrigin(origin) {
        this.origin = origin;
        return this.origin;
      }

      resetOrigin() {}
    }

    mockIPC = new MockIPC();
    messageHandler = async function (event) {
      if (event.origin !== window.location.origin) return;
      const { method, payload } = event.data;
      if (method) {
        const response = await mockIPC.invoke(method, payload);
        event.ports[0].postMessage(response);
      }
    };

    window.addEventListener('message', messageHandler);
  });

  hooks.afterEach(function () {
    window.removeEventListener('message', messageHandler);
    sinon.restore();
  });

  test('visiting index', async function (assert) {
    assert.expect(1);
    await visit(urls.origin);
    await a11yAudit();
    assert.equal(currentURL(), urls.origin);
  });

  test('visiting index without an origin specified redirects to origin route', async function (assert) {
    assert.expect(2);
    await visit(urls.index);
    await a11yAudit();
    assert.notOk(mockIPC.origin);
    assert.equal(currentURL(), urls.origin);
  });

  test('can set origin', async function (assert) {
    assert.expect(3);
    assert.notOk(mockIPC.origin);
    await visit(urls.origin);
    await a11yAudit();
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    assert.equal(currentURL(), urls.authenticate.methods.global);
    assert.equal(mockIPC.origin, window.location.origin);
  });

  test('can reset origin before authentication', async function (assert) {
    assert.expect(4);
    assert.notOk(mockIPC.origin);
    await visit(urls.origin);
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    assert.equal(currentURL(), urls.authenticate.methods.global);
    assert.equal(mockIPC.origin, window.location.origin);
    await click('.change-origin a');
    assert.equal(currentURL(), urls.origin);
  });

  test('captures error on origin update', async function (assert) {
    assert.expect(2);
    assert.notOk(mockIPC.origin);
    sinon.stub(this.owner.lookup('service:origin'), 'setOrigin').throws();
    await visit(urls.origin);
    await a11yAudit();
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    assert.ok(find('.rose-notification.is-error'));
  });

  test('origin set automatically in dev mode', async function (assert) {
    assert.expect(1);
    config.autoOrigin = true;
    await visit(urls.origin);
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    assert.equal(
      this.owner.lookup('controller:origin').origin,
      window.location.origin
    );
    config.autoOrigin = false;
  });

  test('can reset origin on error', async function (assert) {
    assert.expect(4);
    await visit(urls.origin);
    await a11yAudit();
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    this.server.get('/targets', () => new Response(500));
    await later(async () => {
      run.cancelTimers();
      assert.ok(currentSession().isAuthenticated);
      assert.equal(
        find('main section button').textContent.trim(),
        'Disconnect'
      );
    }, 750);
    await click('[type="submit"]');
    later(async () => {
      assert.notOk(currentSession().isAuthenticated);
      assert.equal(currentURL(), urls.authenticate.methods.global);
    }, 750);
    await click('main section button');
  });
});
