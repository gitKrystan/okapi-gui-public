import type Method from 'okapi/models/method';
import type Project from 'okapi/models/project';
import type ProjectSetting from 'okapi/models/project-setting';
import ServerService from 'okapi/services/server';

export default class TestingServerService extends ServerService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async getProjectList(): Promise<readonly Project[]> {
    return this.projectList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSettingsList(): Promise<readonly ProjectSetting[]> {
    return this.settingsList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async call(
    method: Method,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    let response = this.methodCallResponse;
    if (!response) {
      throw new Error('called a method without a mocked response');
    }
    return response(method, args);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateProjectSetting(
    _project: Project,
    setting: ProjectSetting
  ): Promise<void> {
    setting.info.value = setting.param.value;
  }

  mockProjects(projects: Project[]): void {
    this.projectList = projects;
  }

  mockSettings(settings: ProjectSetting[]): void {
    this.settingsList = settings;
  }

  mockMethodCallResponse(
    response: (
      method: Method,
      args: Record<string, unknown>
    ) => Record<string, unknown>
  ): void {
    this.methodCallResponse = response;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async findProject(id: string): Promise<Project | null> {
    return this.projectList.find((m) => m.id === id) ?? null;
  }

  private projectList: readonly Project[] = [];

  private settingsList: readonly ProjectSetting[] = [];

  private methodCallResponse:
    | ((
        method: Method,
        args: Record<string, unknown>
      ) => Record<string, unknown>)
    | null = null;
}
