import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default class DevelopmentServerService extends ServerService {
  /** Adjustable delay to mimic loading states. */
  delay = 50;

  async getProjectList(): Promise<Project[]> {
    await wait(this.delay);
    return [
      new Project('Direwolf'),
      new Project('Wiredolf'),
      new Project('Firewold'),
    ];
  }
}
