import { toDataURL } from "qrcode";
import { authenticator } from "@otplib/preset-default";
import { useEffect, useRef, useState } from "react";

interface Props {
  secret?: string;
  setPage?: (page: string) => void;
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
            setPage("final");
          } else {
            setErrors(["invalid code"]);
          }
        }}
      >
        {errors?.join("<br />")}

        <input
          type="text"
          data-testid="2fa-value"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
      <button onClick={() => setPage("init")}>Back</button>
    </>
  );
};

export const TwoFactorAuth: React.FC<Pick<Props, "secret">> = ({
  secret = authenticator.generateSecret(),
}) => {
  const [page, setPage] = useState("init");
  switch (page) {
    case "init":
      return (
        <>
          <QRCode secret={secret} />
          <p>Scan this code, or manually enter {secret} and press continue</p>
          <button onClick={() => setPage("form")}>Continue</button>
        </>
      );
    case "form":
      return <Form secret={secret} setPage={setPage} />;
    case "final":
      return <p>that was a valid code</p>;
    default:
      return null;
  }
};
