import { TemplateOnlyComponent } from '@ember/component/template-only';

export default <template>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">

    <!-- source: https://heroicons.com/ -->

    {{!-- SOLID: For buttons, form elements, and to support text, designed to be rendered at 20x20. --}}

    {{!-- n/a --}}

    {{!-- OUTLINE: For primary navigation and marketing sections, designed to be rendered at 24x24. --}}

    <!-- source: https://heroicons.com/ -->
    <symbol id="outline__minus-circle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </symbol>

    <!-- source: https://heroicons.com/ -->
    <svg id="outline__plus-circle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>

  </svg>
</template>

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Symbols: TemplateOnlyComponent;
  }
}
