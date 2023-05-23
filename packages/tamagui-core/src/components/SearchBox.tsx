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
  // const theme = useCustomTheme()
  return (
    <Input
      size="$input"
      placeholder={placeholder ?? "Enter a username or address"}
      value={searchFilter}
      onChangeText={(text: string) => {
        setSearchFilter(text);
        onChange(text);
      }}
    />
  );
};
