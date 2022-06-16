import Route from '@ember/routing/route';

export type NotFoundRouteModel = string;

export type NotFoundRouteParams = {
  path: string;
};

export default class NotFoundRoute extends Route<
  NotFoundRouteModel,
  NotFoundRouteParams
> {
  model({ path }: NotFoundRouteParams): NotFoundRouteModel {
    return path;
  }
}
