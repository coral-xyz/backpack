import { useEffect } from "react";

import { useNavStack } from "../../common/Layout/NavStack";

import { Requests } from "./Requests";
import { SearchUsers } from "./SearchUsers";

export const Contacts = () => {
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Contacts");
  }, [nav]);

  return (
    <div>
      <SearchUsers />
    </div>
  );
};
