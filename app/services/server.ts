import { AbstractService } from 'ember-swappable-service';
import Project from 'okapi/models/project';

export class ServerNotFoundError extends Error {}

export default abstract class ServerService extends AbstractService {
  abstract getProjectList(): Promise<Project[]>;
  abstract getProject(id: string): Promise<Project>;
}
