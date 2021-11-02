import Route from '@ember/routing/route';
import { options } from 'api/models/session';

export default class ScopesScopeSessionsIndexRoute extends Route {
  setupController(controller) {
    const availableSessions = options;
    super.setupController(...arguments);
    controller.setProperties({ availableSessions });
  }

}
