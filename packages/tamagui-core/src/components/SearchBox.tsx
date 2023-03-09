// import { TextInput } from "react-native";
import { Input } from "tamagui";

// import { styles, useCustomTheme } from "@coral-xyz/themes";
// import SearchIcon from "@mui/icons-material/Search";
// import InputAdornment from "@mui/material/InputAdornment";

// export const useStyles = styles((theme) => ({
//   searchField: {
//     marginTop: "10px",
//     marginBottom: "16px",
//     width: "inherit",
//     display: "flex",
//     "& .MuiOutlinedInput-root": {
//       "& input": {
//         paddingTop: 0,
//         paddingBottom: 0,
//       },
//       "& fieldset": {
//         border: `${theme.custom.colors.borderFull} !important`,
//       },
//     },
//   },
// }));

// export const SearchBox = ({
//   onChange,
//   placeholder,
//   searchFilter,
//   setSearchFilter,
// }: {
//   onChange: any;
//   placeholder?: string;
//   searchFilter: string;
//   setSearchFilter: any;
// }) => {
//   const classes = useStyles();
//   const theme = useCustomTheme();
//
//   return (
//     <TextInput
//       className={classes.searchField}
//       placeholder={placeholder ?? "Enter a username or address"}
//       value={searchFilter}
//       startAdornment={
//         <InputAdornment position="start">
//           <SearchIcon style={{ color: theme.custom.colors.icon }} />
//         </InputAdornment>
//       }
//       setValue={async (e) => {
//         const prefix = e.target.value;
//         setSearchFilter(prefix);
//         onChange(prefix);
//       }}
//       inputProps={{
//         style: {
//           height: "48px",
//         },
//       }}
//     />
//   );
// };

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
