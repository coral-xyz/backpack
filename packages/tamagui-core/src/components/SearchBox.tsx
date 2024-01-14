import { Input } from "tamagui";

export const SearchBox = ({
  onChange,
  placeholder,
  searchFilter,
  setSearchFilter,
}: {
  onChange: any;
  placeholder?: string;
  searchFilter: string;
  setSearchFilter: any;
}) => {
  return (
    <Input
      size="$input"
      placeholder={placeholder ?? "Enter an address"}
      value={searchFilter}
      onChangeText={(text: string) => {
        setSearchFilter(text);
        onChange(text);
      }}
    />
  );
};
