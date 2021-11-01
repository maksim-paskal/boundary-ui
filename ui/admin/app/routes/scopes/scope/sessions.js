import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all, hash } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { A } from '@ember/array';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import config from '../../../config/environment';
 import { tracked } from '@glimmer/tracking';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeSessionsRoute extends Route {

  // =services

  @service intl;
  @service notify;
  @service session;



  selectedGroupsIds = A();

  // // =attributes
  // queryParams = {
  //   status: {
  //     refreshModel: true,
  //   },
  // };
  /**
   * A simple Ember Concurrency-based polling task that refreshes the route
   * every POLL_TIMEOUT_SECONDS seconds.  This is necessary to display changes
   * to session `status` that may occur.
   *
   * NOTE:  tasks are sort of attributes and sort of methods, but they are not
   * language-level constructs.  Thus we annotate this task as if it
   * is an attribute.
   * @type {Task}
   */
  @task(function * () {
    while(true) {
      yield timeout(POLL_TIMEOUT_SECONDS * 1000);
      yield this.refresh();
    }
  /* eslint-disable-next-line prettier/prettier */
  }).drop() poller;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise{[{session: SessionModel, user: UserModel, target: TargetModel}]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const sessions = await this.store.query('session', { scope_id });
    //add filter logic here..
    const sessionAggregates = await all(
      sessions.map(session => hash({
        session,
        user: session.user_id
          ? (
              this.store.peekRecord('user', session.user_id) ||
              this.store.findRecord('user', session.user_id)
            )
          : null,
        target: session.target_id
          ? (
              this.store.peekRecord('target', session.target_id) ||
              this.store.findRecord('target', session.target_id)
            )
          : null,
      }))
    );
    // Sort sessions by time created...
    let sortedSessionAggregates =
      A(sessionAggregates).sortBy('session.created_time').reverse();
    // Then move active sessions to the top...
    sortedSessionAggregates = [
      ...sortedSessionAggregates.filter((aggregate) => aggregate.session.status === 'active'),
      ...sortedSessionAggregates.filter((aggregate) => aggregate.session.status !== 'active'),
    ];
    return sortedSessionAggregates;
  }

  /**
   * When this route is activated (entered), begin polling for changes.
   */
  activate() {
    this.poller.perform();
  }

  /**
   * When this route is deactivated (exited), stop polling for changes.
   */
  deactivate() {
    this.poller.cancelAll();
  }

  // =actions

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    await session.cancelSession();
  }

  // @action
  // async submitForm(items) {
  //   console.log('submittttt', this.selectedItems)
  //   // console.log('checkbox changed!!', selected);
  //   // this.selectedItems = [...selected];
  //   // // console.log(selected, 'fin selected items!!');
  //   // await this.transitionTo('scopes.scope.sessions', {
  //   //   queryParams: { status:  selected },
  //   // });
  // }


  @action
  async checkboxGroupChanged(selected) { 
    console.log(selected, 'seeelellelelelelel');
    this.selectedItems = [...selected];
    // selected.map(i => {
    //   console.log(i.where(id => console.log(id, '???')), 'iii')
    // })

  
  //   console.log(selected, 'what comes')
  // // console.log(selected, 'SELECTED')
  // this.selectedItems = [...selected];
  // console.log( this.selectedItems, 'what comes now')
  // // console.log(this.selectedItems, 'fin selected items!!');
  // // this.send('filterStatus', this.selectedItems);

  //     if (!this.selectedGroupsIds.includes(selected)) {
  //     this.selectedGroupsIds.addObject(selected);

  //   } else {
  //     this.selectedGroupsIds.removeObject(selected);
  //   }
  //   // await this.transitionTo('scopes.scope.sessions', {
  //   //   queryParams: { status:  this.selectedGroupsIds },
  //   // });
  }
}
