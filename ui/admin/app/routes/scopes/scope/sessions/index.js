import Route from '@ember/routing/route';
import { options } from 'api/models/session';

export default class ScopesScopeSessionsIndexRoute extends Route {
  setupController(controller) {
    const type = this.controllerFor('scopes.scope.sessions')['filter-type'];
    controller.setProperties({
      scopeModel,
      filters: {
        type: {
          items: ['status'],
          selectedItems: type ? JSON.parse(type) : null
        }
      }
    });
  }
}
