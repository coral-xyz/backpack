import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path, Button, useNavigation } from "react-xnft";
import {THEME} from '../../utils/theme'


export function EmptyScreen() {

    const nav = useNavigation();

  return (
    <View style={{ height: "100%", paddingLeft:"20px", paddingTop:"32px", background: "#181819"}}>
        <Text style={{fontSize: "26px", fontWeight: "300", fontStyle:"normal", lineHeight: "41px", color: "rgba(255, 255, 255, 0.85)"}}>
            You only need to enter the key text, Double Diffusion will help you generate a magical picture. 
        </Text>
        <Text style={{fontSize: "14px", fontWeight: "300", fontStyle:"normal", lineHeight: "22px", color: "rgba(255, 255, 255, 0.85)", marginTop: "16px" }}>
            Based on Stable Diffusion model.
        </Text>
        {/* <Text style={{fontSize: "16px", fontWeight: "400", fontStyle:"normal", lineHeight: "25px", color: THEME.colors.button, marginTop: "36px", textDecoration: "underline" }}>
            Prompt Guide {'>'}
        </Text> */}
        <Button onClick={() => nav.push("create")} style={{position: "fixed", bottom: "24px", background: THEME.colors.button, color: "rgba(24, 24, 24, 0.85)", width: "90%", marginRight:"20px", alignItems: "center", height: "48px", fontWeight: "500", fontSize: "16px", lineHeight: "25px"}}>Create</Button>
    </View>
  );
}