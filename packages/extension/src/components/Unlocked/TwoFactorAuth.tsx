import { toDataURL } from "qrcode";
import { authenticator } from "@otplib/preset-default";
import { useEffect, useRef, useState } from "react";

type Page = "qr" | "input" | "confirmation";

interface Props {
  secret?: string;
  setPage?: (page: Page) => void;
}

const QRCode: React.FC<Pick<Required<Props>, "secret">> = ({ secret }) => {
  const [code, setCode] = useState("");
  const img = useRef(null);

  useEffect(() => {
    const otpauth = authenticator.keyuri(
      // TODO: determine what to use as account reference
      "",
      "Anchor Wallet",
      secret
    );

    toDataURL(otpauth, (err, imageUrl) => {
      if (!img.current) return;

      if (err) {
        console.error({ "qr code error": err });
      } else {
        setCode(imageUrl);
      }
    });
  }, []);

  return (
    <img
      ref={img}
      src={code}
      style={{ display: code ? "block" : "none", width: "100%" }}
      alt="qr code"
    />
  );
};

const Form: React.FC<Required<Props>> = ({ secret, setPage }) => {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Array<string>>();
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          setErrors(undefined);

          if (authenticator.check(code, secret)) {
            setPage("confirmation");
          } else {
            setErrors(["invalid code"]);
          }
        }}
      >
        {errors?.join("<br />")}

        <input
          type="number"
          maxLength={8}
          inputMode="decimal"
          data-testid="2fa-value"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
      <button onClick={() => setPage("qr")}>Back</button>
    </>
  );
};

export const TwoFactorAuth: React.FC<Pick<Props, "secret">> = ({
  secret = authenticator.generateSecret(),
}) => {
  const [page, setPage] = useState<Page>("qr");
  switch (page) {
    case "qr":
      return (
        <>
          <QRCode secret={secret} />
          <p>Scan this code, or manually enter {secret} and press continue</p>
          <button onClick={() => setPage("input")}>Continue</button>
        </>
      );
    case "input":
      return <Form secret={secret} setPage={setPage} />;
    case "confirmation":
      return <p>that was a valid code</p>;
  }
};
