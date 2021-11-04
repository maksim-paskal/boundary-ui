import Route from '@ember/routing/route';
import { setupFilters } from '../../../utils/setupFilters';

export default class ScopesScopeSessionsIndexRoute extends Route {
  setupController(controller) {
  super.setupController(...arguments);
  const scopeModel = this.modelFor('scopes.scope');
  const route = 'scopes.scope.sessions'
  //const defaultValues = ['active', 'pending'];
  controller.setProperties({
    scopeModel,
    //defaultValues,
     filters: {
      status: {
        items: ['active', 'pending', 'terminated', 'cancelling'],
        selectedItems: setupFilters(this, route, 'status')
      }
    }
  });
}
}
