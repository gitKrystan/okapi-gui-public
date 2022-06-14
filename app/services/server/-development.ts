import Project from 'okapi/models/project';
import ServerService, { ServerNotFoundError } from 'okapi/services/server';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default class DevelopmentServerService extends ServerService {
  /** Adjustable delay to mimic loading states. */
  delay = 50;

  readonly mocks = [
    new Project('Direwolf'),
    new Project('Wiredolf'),
    new Project('Firewold'),
    new Project("Krystan's App"),
  ];

  async getProjectList(): Promise<Project[]> {
    await wait(this.delay);
    return this.mocks;
  }

  async getProject(id: string): Promise<Project> {
    await wait(this.delay);

    let project = this.mocks.find((m) => m.id === id);
    if (project) {
      return project;
    } else {
      throw new ServerNotFoundError();
    }
  }
}
