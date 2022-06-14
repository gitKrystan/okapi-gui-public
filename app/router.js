import EmberRouter from '@ember/routing/router';
import config from 'okapi/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

// TODO: As of ember-cli 4.4, TypeScript route generators will not work if this
// file is converted to TS

// eslint-disable-next-line @typescript-eslint/no-empty-function
Router.map(function () {
  this.route('project', { path: '/:project_id' });
});
