import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service intl;

  @tracked selectedItems = [];

  @action
  async checkboxGroupChanged(selected) {
    this.selectedItems = [...selected];
    //call the route action
    this.send('filterSession', this.selectedItems);
  }

  @action
  clearSelected() {
    this.selectedItems = [];
   }
}
