import { TemplateOnlyComponent } from '@ember/component/template-only';

interface RouteErrorSig {
  Args: {
    message: string;
  };
}

const RouteError: TemplateOnlyComponent<RouteErrorSig> = <template>
  <h1 id="main-label">Oops! There was an error.</h1>
  <p data-test-route-error-message>{{@message}}</p>
</template>;

export default RouteError;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    RouteError: typeof RouteError;
  }
}
