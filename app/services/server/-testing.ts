import Project from 'okapi/models/project';
import ServerService, { ServerNotFoundError } from 'okapi/services/server';

export default class TestingServerService extends ServerService {
  private projectList: Project[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProjectList(): Promise<Project[]> {
    return this.projectList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProject(id: string): Promise<Project> {
    let project = this.projectList.find((m) => m.id === id);
    if (project) {
      return project;
    } else {
      throw new ServerNotFoundError();
    }
  }

  mockProjects(projects: Project[]): void {
    this.projectList = projects;
  }
}
