import { useLocation, useNavigate } from "react-router-dom";
import { CreatePassword } from "../../common/Account/CreatePassword";

export const SetPassword = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <CreatePassword
      onNext={(password) => navigate(`${pathname}/${password}/finish`)}
    />
  );
};
