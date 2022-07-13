import Method from 'okapi/models/method';
import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default class DevelopmentServerService extends ServerService {
  /** Adjustable delay to mimic loading states. */
  delay = 50;

  // localhost   has many  `Project`
  // `Project`   has many  `API`       (installed)
  // `Project`   has many  `Provider`  (installed)
  // `Provider`  has many  `API`       (implemented)
  // `API`       has many  `Method`

  // TODO:
  // `Registry`  has many  `API`       (installable)
  // `Registry`  has many  `Provider`  (installable)
  // `API`       has many  `Service`   (possibly?)
  // `Provider`  has many  `Service`   (implemented) (possibly?)
  // `Service`   has many  `Method`

  private projectList = [
    Project.from({
      name: 'Direwolf',
      providers: [
        {
          id: 'notifier-slack',
          name: 'notifier-slack',
          apiIds: ['Notifier'],
        },
      ],
      apis: [
        {
          id: 'Notifier',
          name: 'Notifier',
          providerIds: ['notifier-slack'],
          methods: [
            {
              name: 'Notify',
              description: 'Notifies a target with a message.',
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
                  description: 'whether the notification was successfully sent',
                  type: 'boolean',
                },
                {
                  name: 'details',
                  description: 'failure message or success info. may be blank',
                  type: 'string',
                },
              ],
            },
            {
              name: 'Mortify',
              description: 'Mortifies a target with a message.',
              request: [
                {
                  name: 'target',
                  description: 'the target to mortify',
                  type: 'string',
                },
                {
                  name: 'shouldMortify',
                  description: 'whether the mortification should commence',
                  type: 'boolean',
                },
              ],
              response: [
                {
                  name: 'success',
                  description:
                    'whether the mortification was successfully mortifying',
                  type: 'boolean',
                },
                {
                  name: 'details',
                  description: 'failure message or success info. may be blank',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    }),
    Project.from({ name: 'Wiredolf', providers: [], apis: [] }),
    Project.from({ name: 'Firewold', providers: [], apis: [] }),
  ];

  async getProjectList(): Promise<Project[]> {
    await wait(this.delay);
    return this.projectList;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findProject(id: string): Promise<Project | null> {
    return this.projectList.find((m) => m.id === id) ?? null;
  }

  async call(
    method: Method,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    await wait(12 * this.delay);
    // NOTE: Hardcoded for the Notify response type
    return {
      success: true,
      details: `Called ${method.name} with args ${JSON.stringify(args)}`,
    };
  }
}
