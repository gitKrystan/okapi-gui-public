import { AbstractService } from 'ember-swappable-service';

import type Method from 'okapi/models/method';
import type Project from 'okapi/models/project';
import type ProjectSetting from 'okapi/models/project-setting';

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export class NotFoundError extends ServerError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export default abstract class ServerService extends AbstractService {
  abstract getProjectList(): Promise<readonly Project[]>;

  abstract getSettingsList(): Promise<readonly ProjectSetting[]>;

  abstract updateProjectSetting(
    project: Project,
    setting: ProjectSetting
  ): Promise<void>;

  abstract restartProject(project: Project): Promise<void>;

  async getProject(id: string): Promise<Project> {
    let project = await this.findProject(id);

    if (project) {
      return project;
    } else {
      throw new NotFoundError(`Could not find project "${id}."`);
    }
  }

  abstract call(
    method: Method,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>>;

  protected abstract findProject(id: string): Promise<Project | null>;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    // @ts-expect-error Property...is not assignable to 'string' index type 'Service'.
    server: ServerService;
  }
}
