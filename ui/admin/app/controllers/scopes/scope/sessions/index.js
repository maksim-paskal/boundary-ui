import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
 
export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service intl;
  @tracked selectedItems=['00000'];
  queryParams = ['status'];
  @tracked status;
 
  @action
  async checkboxGroupChanged(selected) {
  console.log(selected, 'SELECTED')
  this.selectedItems = [...selected];
  console.log(this.selectedItems, 'fin selected items!!');
  this.send('filterStatus', this.selectedItems);
  }
}
