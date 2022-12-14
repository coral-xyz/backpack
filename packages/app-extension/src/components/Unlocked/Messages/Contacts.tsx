import { useEffect } from "react";

import { useNavStack } from "../../common/Layout/NavStack";

import { SearchUsers } from "./SearchUsers";

export const Contacts = () => {
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Contacts");
  }, []);

  return (
    <div>
      <SearchUsers />
    </div>
  );
};
