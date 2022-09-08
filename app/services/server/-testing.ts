import type Method from 'okapi/models/method';
import type Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

export default class TestingServerService extends ServerService {
  private projectList: Project[] = [];
  private methodCallResponse:
    | ((
        method: Method,
        args: Record<string, unknown>
      ) => Record<string, unknown>)
    | null = null;

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProjectList(): Promise<Project[]> {
    return this.projectList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findProject(id: string): Promise<Project | null> {
    return this.projectList.find((m) => m.id === id) ?? null;
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

  mockProjects(projects: Project[]): void {
    this.projectList = projects;
  }

  mockMethodCallResponse(
    response: (
      method: Method,
      args: Record<string, unknown>
    ) => Record<string, unknown>
  ): void {
    this.methodCallResponse = response;
  }
}
