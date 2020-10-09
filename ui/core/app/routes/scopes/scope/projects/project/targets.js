import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../../../decorators/confirm';
import { notifySuccess, notifyError } from '../../../../../decorators/notify';

export default class ScopesScopeProjectsProjectTargetsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all targets under current project scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope.projects.project');
    return this.store.query('target', { scope_id });
  }

  // =actions

  /**
   * Rollback changes on a target.
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { isNew } = target;
    target.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.projects.project.targets');
  }

  /**
   * Handle save.
   * @param {TargetModel} target
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) => isNew ? 'notifications.create-success' : 'notifications.save-success')
  async save(target) {
    await target.save();
    await this.transitionTo('scopes.scope.projects.project.targets.target', target);
    this.refresh();
  }

  /**
   * Deletes a target and redirects to targets index.
   * @param {TargetModel} target
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(target) {
    await target.destroyRecord();
    await this.replaceWith('scopes.scope.projects.project.targets');
    this.refresh();
  }
}
