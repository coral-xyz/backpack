import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path, Button, useNavigation } from "react-xnft";
import {THEME} from '../../utils/theme'


export function PreviewScreen(props) {

    const nav = useNavigation();
    
  return (
    <View style={{ height: "100%", background: "#181819", paddingTop:"16px"}}>
         <View style={{marginLeft:"20px", borderRadius:"25px", background: "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)", height: "343px", width: "343px", paddingLeft: "18px", paddingBottom: "18px", paddingTop: "18px", paddingRight:"18px", marginBottom: "16px"}}>
            <Image src={props.image} style={{height: "100%", width:"100%", borderRadius:"25px"}}/>
        </View>
        <Text style={{fontSize: "16px",marginLeft:"20px", fontWeight: "300", fontStyle:"normal", lineHeight: "25px", color: "rgba(255, 255, 255, 0.85)", marginTop: "16px", opacity: "0.5" }}>
            Content:
        </Text>
        <Text style={{fontSize: "16px", marginLeft:"20px",fontWeight: "300", fontStyle:"normal", lineHeight: "25px", color: "rgba(255, 255, 255, 0.85)", marginTop: "6px" }}>
          {props.description}
        </Text>

    </View>
  );
}