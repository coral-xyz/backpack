import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const renderAndSetup = (jsx: React.ReactElement) => ({
  user: userEvent.setup(),
  ...render(jsx),
});
