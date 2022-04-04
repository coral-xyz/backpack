import { waitFor } from "@testing-library/react";
import { renderAndSetup } from "../../testHelpers";
import { authenticator } from "@otplib/preset-default";

import { TwoFactorAuth } from "./TwoFactorAuth";

describe("during registration, the user enters...", () => {
  test("the correct 2FA code", async () => {
    const { user, getByText, getByAltText, getByTestId } = renderAndSetup(
      <TwoFactorAuth secret="123" />
    );

    await waitFor(() => {
      // check QR code exists
      expect(getByAltText("qr code")).toHaveAttribute(
        "src",
        expect.stringMatching(
          /^data:image\/png;base64,[a-z0-9/+]{500,}={0,2}$/i
        )
      );

      // check code is written out manually
      expect(getByText((txt) => txt.includes("123"))).toBeInTheDocument();
    });

    await user.click(getByText("Continue"));

    await user.type(getByTestId("2fa-value"), authenticator.generate("123"));

    await user.click(getByText("Submit"));

    expect(
      getByText((txt) => txt.includes("was a valid code"))
    ).toBeInTheDocument();
  });

  test("an incorrect code", async () => {
    const { user, getByText, getByTestId } = renderAndSetup(
      <TwoFactorAuth secret="FOO" />
    );

    await user.click(getByText("Continue"));

    await user.type(getByTestId("2fa-value"), "123");

    await user.click(getByText("Submit"));

    expect(
      getByText((txt) => txt.includes("invalid code"))
    ).toBeInTheDocument();
  });
});
