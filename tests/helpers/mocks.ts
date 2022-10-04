import type { ProjectParams } from 'okapi/models/project';
import Project, { ProjectStatus } from 'okapi/models/project';

/** Mocks ProjectParams object */
export function mockProjectParams({
  name = 'Direwolf',
  status = ProjectStatus.Started,
  apis = [],
  providers = [],
  settings = [],
}: Partial<ProjectParams> = {}): ProjectParams {
  return {
    name,
    status,
    apis,
    providers,
    settings,
  };
}

/** Mocks Project model */
export function mockProject(params: Partial<ProjectParams> = {}): Project {
  return Project.from(mockProjectParams(params));
}
