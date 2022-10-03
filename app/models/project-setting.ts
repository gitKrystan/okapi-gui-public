import type { Param, RawParam } from 'okapi/models/param/index';
import { makeParam } from 'okapi/models/param/index';

export type RawProjectSetting = RawParam & {
  id: string;
};

export default class ProjectSetting {
  readonly id: string;
  readonly param: Param;
  readonly info: RawParam;

  constructor({ id, ...info }: RawProjectSetting) {
    this.id = id;
    this.info = info;
    this.param = makeParam(info);
  }

  get name(): string {
    return this.info.name;
  }

  get description(): string {
    return this.info.description;
  }

  copy(): ProjectSetting {
    return new ProjectSetting({ id: this.id, ...this.info });
  }
}
