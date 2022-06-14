import { AbstractService } from 'ember-swappable-service';
import Project from 'okapi/models/project';

export class ServerNotFoundError extends Error {
  /**
   * @param message This message will be displayed on the error template!
   */
  constructor(message: string) {
    super(message);
  }
}

export default abstract class ServerService extends AbstractService {
  abstract getProjectList(): Promise<Project[]>;
  abstract getProject(id: string): Promise<Project>;

  protected ensureProject(
    maybeProject: Project | undefined,
    name: string
  ): Project {
    if (maybeProject) {
      return maybeProject;
    } else {
      throw new ServerNotFoundError(`Could not find project "${name}."`);
    }
  }
}
