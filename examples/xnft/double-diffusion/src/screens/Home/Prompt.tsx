import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path, Button, useNavigation } from "react-xnft";
import {THEME} from '../../utils/theme'
import { useDiffusionTokens } from "../../utils";


export function PromptScreen() {

    const nav = useNavigation();
    const tokenAccounts = useDiffusionTokens()!;


  return (
    <View style={{height: "100%", alignItems: "center", paddingTop: "18px", paddingLeft: "20px", backgroundColor: "#181819"}}>
        {/* Add Image of the gudie for MVP*/}
    </View>
  );
}