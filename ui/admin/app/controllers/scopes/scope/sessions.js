import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeSessionsController extends Controller {
  // =services

  @service intl;
  // =attributes
  queryParams = ['status'];
  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.session.title_plural');
  }
}
