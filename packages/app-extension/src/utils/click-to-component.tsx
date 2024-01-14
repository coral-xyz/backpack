import { ClickToComponent } from "click-to-react-component";

/**
 * Only included in development builds
 * Enables you to opt+click/rightclick to jump to source code of a component
 */
export function OptClickToComponent() {
  return process.env.NODE_ENV === "development" ? <ClickToComponent /> : null;
}
