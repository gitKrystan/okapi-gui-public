import Route from '@ember/routing/route';

export type NotFoundRouteModel = string;

export interface NotFoundRouteParams {
  path: string;
}

export default class NotFoundRoute extends Route<
  NotFoundRouteModel,
  NotFoundRouteParams
> {
  override model({ path }: NotFoundRouteParams): NotFoundRouteModel {
    return path;
  }
}
