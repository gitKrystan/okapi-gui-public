import { AbstractService } from 'ember-swappable-service';
import Project from 'okapi/models/project';

export default abstract class ServerService extends AbstractService {
  abstract getProjectList(): Promise<Project[]>;
}
