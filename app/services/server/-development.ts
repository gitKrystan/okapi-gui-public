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
      providers: [
        {
          name: 'notifier-slack',
          apis: [
            {
              name: 'Notifier',
              methods: [
                {
                  name: 'Notify',
                  request: [
                    {
                      name: 'target',
                      description: 'the target to notify',
                      type: 'string',
                    },
                    {
                      name: 'message',
                      description: 'the body of the notification',
                      type: 'string',
                    },
                  ],
                  response: [
                    {
                      name: 'success',
                      description:
                        'whether the notification was successfully sent',
                      type: 'boolean',
                    },
                    {
                      name: 'details',
                      description:
                        'failure message or success info. may be blank',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
