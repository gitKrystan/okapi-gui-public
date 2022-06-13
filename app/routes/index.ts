import Route from '@ember/routing/route';
import Project from 'okapi/models/project';

export default class IndexRoute extends Route {
  model(): Project[] {
    return [
      new Project('Direwolf'),
      new Project('Wiredolf'),
      new Project('Firewold'),
    ];
  }
}
