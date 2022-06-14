import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

export default class TestingServerService extends ServerService {
  private projectList: Project[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProjectList(): Promise<Project[]> {
    return this.projectList;
  }

  mockProjects(projects: Project[]): void {
    this.projectList = projects;
  }
}
