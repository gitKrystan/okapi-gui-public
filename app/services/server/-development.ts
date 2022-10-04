import type Method from 'okapi/models/method';
import type Project from 'okapi/models/project';
import { ProjectStatus } from 'okapi/models/project';
import ProjectSetting from 'okapi/models/project-setting';
import ServerService from 'okapi/services/server';
import { mockProject } from 'okapi/tests/helpers/mocks';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Adjustable delay to mimic loading states. */
const DELAY = 50;

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

export default class DevelopmentServerService extends ServerService {
  async getProjectList(): Promise<readonly Project[]> {
    await wait(DELAY);
    return this.projectList;
  }

  async getSettingsList(): Promise<readonly ProjectSetting[]> {
    await wait(DELAY);
    return this.settingsList;
  }

  async call(
    method: Method,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    await wait(12 * DELAY);
    // NOTE: Hardcoded for the Notify response type
    return {
      success: true,
      details: `Called ${method.name} with args ${JSON.stringify(args)}`,
      emoji: {
        name: ':grimace:',
        description: 'Perfect for awkward messages.',
      },
    };
  }

  async updateProjectSetting(
    _project: Project,
    setting: ProjectSetting
  ): Promise<void> {
    await wait(DELAY);
    setting.info.value = setting.param.value;
  }

  async restartProject(project: Project): Promise<void> {
    await wait(10 * DELAY);
    project.status = ProjectStatus.Stopping;
    await wait(10 * DELAY);
    project.status = ProjectStatus.Stopped;
    await wait(10 * DELAY);
    project.status = ProjectStatus.Starting;
    await wait(10 * DELAY);
    project.status = ProjectStatus.Started;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async findProject(id: string): Promise<Project | null> {
    await wait(DELAY);
    return this.projectList.find((m) => m.id === id) ?? null;
  }

  private projectList = Object.freeze([
    mockProject({
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
                {
                  name: 'emoji',
                  description: 'emoji to display after the notification',
                  type: 'enum',
                  options: [
                    {
                      name: ':grimace:',
                      description: 'Perfect for awkward messages.',
                    },
                    {
                      name: ':joy:',
                      description: 'Perfect for hilarious messages.',
                    },
                  ],
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
                {
                  name: 'emoji',
                  description: 'emoji displayed after the notification',
                  type: 'enum',
                  options: [
                    {
                      name: ':grimace:',
                      description: 'Perfect for awkward messages.',
                    },
                    {
                      name: ':joy:',
                      description: 'Perfect for hilarious messages.',
                    },
                  ],
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
                {
                  name: 'count',
                  description: 'how many times the mortification should happen',
                  type: 'f32',
                },
                {
                  name: 'count2',
                  description: 'how many times the mortification should happen',
                  type: 'i8',
                },
                {
                  name: 'count3',
                  description: 'how many times the mortification should happen',
                  type: 'u8',
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
      settings: [
        {
          name: 'Preset',
          id: 'presets.pre.set',
          description: 'Already saved on the backend.',
          type: 'boolean',
          value: true,
        },
      ],
    }),
    mockProject({ name: 'Wiredolf' }),
    mockProject({ name: 'Firewold' }),
  ]);

  private settingsList = Object.freeze([
    new ProjectSetting({
      name: 'Vault Schema Migration',
      id: 'experimental.vault.schema_version',
      description: 'Desired vault schema version.',
      type: 'enum',
      options: [
        { name: '1.0', description: 'The first version.' },
        { name: '2.0', description: 'The second version.' },
      ],
    }),
    new ProjectSetting({
      name: 'Autoscale',
      id: 'servers.scaling.autoscale',
      description: 'Scale things automagically.',
      type: 'boolean',
    }),
    new ProjectSetting({
      name: 'Russian Invasion',
      id: 'invasions.foreign.russian',
      description: 'How wide to open a door for large-scale Russian invasion.',
      type: 'u32',
    }),
    new ProjectSetting({
      name: 'Favorite Setting',
      id: 'misc.settings.favorite',
      description: 'Name your favorite setting.',
      type: 'string',
    }),
  ]);
}
