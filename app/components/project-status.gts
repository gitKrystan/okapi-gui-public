import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';

import Button from 'okapi/components/button';
import Icon from 'okapi/components/icon';
import { ProjectStatus } from 'okapi/models/project';
import type Project from 'okapi/models/project';
import type ServerService from 'okapi/services/server';

export interface ProjectStatusSig {
  Args: {
    project: Project;
  };
}

export default class ProjectStatusComponent extends Component<ProjectStatusSig> {
  <template>
    <Button
      data-test-project-status={{@project.id}}
      class="Button--theme-action"
      {{on "click" (perform this.restartProject)}}
    >
      <Icon @type={{this.iconType}} @id={{this.iconId}} />
      {{@project.status}}{{if this.restartProject.isRunning "..."}}
    </Button>
  </template>

  @service private declare server: ServerService;

  private get iconType(): 'mini' {
    return 'mini';
  }

  private get iconId(): string {
    switch (this.args.project.status) {
      case ProjectStatus.Starting:
      case ProjectStatus.Stopping: {
        return 'ellipsis-horizontal-circle';
      }
      case ProjectStatus.Started: {
        return 'play-circle';
      }
      case ProjectStatus.Stopped: {
        return 'stop-circle';
      }
      default: {
        throw new Error(
          `could not find Project Status for ${this.args.project.status}`
        );
      }
    }
  }

  private restartProject = task({ drop: true }, async (): Promise<void> => {
    await this.server.restartProject(this.args.project);
  });
}
