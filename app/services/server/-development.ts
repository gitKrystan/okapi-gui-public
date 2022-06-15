import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default class DevelopmentServerService extends ServerService {
  /** Adjustable delay to mimic loading states. */
  delay = 50;

  private projectList = [
    Project.from({ name: 'Direwolf', providers: [] }),
    Project.from({ name: 'Wiredolf', providers: [] }),
    Project.from({ name: 'Firewold', providers: [] }),
    Project.from({
      name: "Krystan's App",
      providers: [{ name: 'notifier-slack', apis: [] }],
    }),
  ];

  async getProjectList(): Promise<Project[]> {
    await wait(this.delay);
    return this.projectList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findProject(id: string): Promise<Project | null> {
    return this.projectList.find((m) => m.id === id) ?? null;
  }
}
