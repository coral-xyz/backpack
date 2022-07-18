import ExpoCheckBox from "expo-checkbox";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import tw from "twrnc";
import { addTestIdentifier } from "../lib/addTestIdentifier";

export const CheckBox: React.FC<{
  name: string;
  control: any;
  label: string;
}> = ({ name, control, label }) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { value, onChange } }) => (
      <View style={tw`flex flex-row mt-4`}>
        <ExpoCheckBox
          value={value}
          onValueChange={onChange}
          {...addTestIdentifier(label)}
        />
        {label && <Text style={tw`text-white flex-1 pl-2`}>{label}</Text>}
      </View>
    )}
    rules={{
      required: "You must agree to the Terms of Service",
    }}
  />
);
