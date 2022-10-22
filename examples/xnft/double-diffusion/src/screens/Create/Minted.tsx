import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path, Button, useNavigation } from "react-xnft";
import {THEME} from '../../utils/theme'


export function MintScreen(props) {
  const nav = useNavigation();
  return (
    <View style={{ height: "100%", paddingLeft:"20px", background: "#181819"}}>

        <Text style={{fontSize: "28px", marginLeft: "25px", fontWeight: "275", fontStyle:"normal", lineHeight: "42px", color: "rgba(255, 255, 255, 0.85)", marginTop: "16px" }}>
           🎉 Congratulations!!!
        </Text>
        <Text style={{fontSize: "16px", marginLeft: "16px", fontWeight: "300", fontStyle:"normal", lineHeight: "25px", color: "rgba(255, 255, 255, 0.85)", marginTop: "6px" }}>
          You've successfully minted your NFT
        </Text>
         <View style={{marginTop:"10px", borderRadius:"25px", background: "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)", height: "343px", width: "343px", paddingLeft: "18px", paddingBottom: "18px", paddingTop: "18px", paddingRight:"18px", marginBottom: "16px"}}>
            <Image src={props.image} style={{height: "100%", width:"100%", borderRadius:"25px"}}/>
        </View>
        <View style={{position: "fixed", marginLeft:"-20px", paddingLeft:"16px", paddingTop: "16px", bottom: "0px", height:"80px", width:"100%", backdropFilter: "blur(5px)", background: "rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "row"}}>
        <Button onClick={() => nav.push("some")} style={{borderRadius: "8px", border: `1px solid ${THEME.colors.button}`, position: "fixed", bottom: "16px", color: "#FC9870", width: "90%", marginRight:"20px", alignItems: "center", height: "48px", fontWeight: "500", fontSize: "16px", lineHeight: "25px", zIndex: "1"}}>Back Home</Button>
        </View>
    </View>
  );
}