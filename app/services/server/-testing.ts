import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

export default class TestingServerService extends ServerService {
  private projectList: Project[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProjectList(): Promise<Project[]> {
    return this.projectList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findProject(id: string): Promise<Project | null> {
    return this.projectList.find((m) => m.id === id) ?? null;
  }

  mockProjects(projects: Project[]): void {
    this.projectList = projects;
  }
}
