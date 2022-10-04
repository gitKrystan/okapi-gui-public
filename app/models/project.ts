import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { ApiParams } from 'okapi/models/api';
import Api from 'okapi/models/api';
import type { RawProjectSetting } from 'okapi/models/project-setting';
import ProjectSetting from 'okapi/models/project-setting';
import type { ProviderParams } from 'okapi/models/provider';
import Provider from 'okapi/models/provider';

export enum ProjectStatus {
  Starting = 'starting',
  Started = 'started',
  Stopping = 'stopping',
  Stopped = 'stopped',
}

export interface ProjectParams {
  name: string;
  status: ProjectStatus;
  apis: ApiParams[];
  providers: ProviderParams[];
  settings: RawProjectSetting[];
}

export default class Project {
  static from({
    name,
    status,
    apis,
    providers,
    settings,
  }: ProjectParams): Project {
    return new Project(
      name,
      status,
      apis.map((a) => Api.from(a)),
      providers.map((p) => Provider.from(p)),
      prepareSettings(settings.map((s) => new ProjectSetting(s)))
    );
  }

  private constructor(
    readonly name: string,
    status: ProjectStatus,
    readonly apis: Api[],
    readonly providers: Provider[],
    settings: Set<ProjectSetting>
  ) {
    this.status = status;
    this._settings = settings;
  }

  get id(): string {
    return this.name;
  }

  @tracked status: ProjectStatus;

  @tracked _settings: Set<ProjectSetting>;

  get settings(): ReadonlySet<ProjectSetting> {
    return this._settings;
  }

  findApi(apiId: string): Api | null {
    return this.apis.find((api) => api.id === apiId) ?? null;
  }

  findApiOrError(apiId: string): Api {
    let api = this.findApi(apiId);
    if (!api) {
      throw new Error(
        `Could not find API with id ${apiId} for project ${this.id}`
      );
    }
    return api;
  }

  @action addSetting(setting: ProjectSetting): void {
    let settings = [...this._settings.add(setting.copy())];
    this._settings = prepareSettings(settings);
  }
}

function prepareSettings(settings: ProjectSetting[]): Set<ProjectSetting> {
  return new Set(settings.sort((a, b) => a.id.localeCompare(b.id)));
}
