import type { TemplateOnlyComponent } from '@ember/component/template-only';

<template>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">

    <!-- source: https://heroicons.com/ -->

    {{! OUTLINE: For primary navigation and marketing sections, with an outlined appearance, designed to be rendered at 24x24. }}

    <symbol
      id="outline__code-bracket"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      ></path>
    </symbol>

    <symbol
      id="outline__minus-circle"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </symbol>

    <symbol
      id="outline__play-circle"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
      ></path>
    </symbol>

    <symbol
      id="outline__plus-circle"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </symbol>

    {{! SOLID: For primary navigation and marketing sections, with a filled appearance, designed to be rendered at 24x24. }}

    <symbol id="solid__play-circle" viewBox="0 0 24 24" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
        clip-rule="evenodd"
      ></path>
    </symbol>

    {{! MINI: For buttons, form elements, and to support text, designed to be rendered at 20x20. }}

    <symbol id="mini__check" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clip-rule="evenodd"
      ></path>
    </symbol>

    <symbol id="mini__chevron-down" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clip-rule="evenodd"
      ></path>
    </symbol>

    <symbol id="mini__chevron-up" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
        clip-rule="evenodd"
      ></path>
    </symbol>

    <symbol
      id="mini__ellipsis-horizontal-circle"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8 1a1 1 0 100-2 1 1 0 000 2zm-3-1a1 1 0 11-2 0 1 1 0 012 0zm7 1a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
      ></path>
    </symbol>

    <symbol id="mini__play-circle" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
        clip-rule="evenodd"
      ></path>
    </symbol>

    <symbol id="mini__stop-circle" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm5-2.25A.75.75 0 017.75 7h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5z"
        clip-rule="evenodd"
      ></path>
    </symbol>
  </svg>
</template>

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Symbols: TemplateOnlyComponent;
  }
}
