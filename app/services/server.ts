import { AbstractService } from 'ember-swappable-service';
import type Method from 'okapi/models/method';
import type Project from 'okapi/models/project';

export class ServerError extends Error {}

export class NotFound extends ServerError {}

export default abstract class ServerService extends AbstractService {
  abstract getProjectList(): Promise<Project[]>;
  abstract findProject(id: string): Promise<Project | null>;
  abstract call(
    method: Method,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>>;

  async getProject(id: string): Promise<Project> {
    let project = await this.findProject(id);

    if (project) {
      return project;
    } else {
      throw new NotFound(`Could not find project "${id}."`);
    }
  }
}
