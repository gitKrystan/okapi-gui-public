import { modifier } from 'ember-modifier';

let expandingTextarea = modifier(
  (textarea: HTMLTextAreaElement, tracked: unknown[]) => {
    textarea.setAttribute('rows', '1');
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';

    // HACK: In order for the argument to auto-track, we must consume it.
    for (const _tracked of tracked) {
      /* no-op */
    }

    function updateHeight(this: HTMLTextAreaElement): void {
      this.style.height = 'auto';
      this.style.height = `${this.scrollHeight}px`;
    }
    updateHeight.bind(textarea)();
    textarea.addEventListener('input', updateHeight);
    return (): void => {
      textarea.removeEventListener('input', updateHeight);
    };
  }
);

/**
 * Turns any textarea element into an "auto-growing" textarea that will
 * vertically resize as the user types.
 *
 * You can optionally pass in any number of positional arguments to be "tracked"
 * by this modifier so that it will recompute any time one of these arguments
 * changes.
 */
export default expandingTextarea;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'expanding-textarea': typeof expandingTextarea;
  }
}
