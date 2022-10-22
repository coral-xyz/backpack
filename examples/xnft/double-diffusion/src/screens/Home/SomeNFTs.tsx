import React, { useEffect, useState } from "react";
import { View, Text, TextField, ListItem, Image, Svg, Path, Button, useNavigation } from "react-xnft";
import {THEME} from '../../utils/theme'
import { useDiffusionTokens } from "../../utils";


export function SomeNFTs() {

    const nav = useNavigation();
    const tokenAccounts = useDiffusionTokens()!;

    console.log(tokenAccounts)

  return (
    <View style={{height: "135%", alignItems: "center", paddingTop: "18px", paddingLeft: "20px", backgroundColor: "#181819"}}>
        
        {    
        tokenAccounts?.tokens.map((g) => {
                return (
                  <>
                <Button onClick={() => nav.push("preview", {image: g.tokenMetaUriData.image, description: g.tokenMetaUriData.description})} style={{borderRadius:"25px", background: "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)", height: "343px", width: "343px", paddingLeft: "18px", paddingBottom: "18px", paddingTop: "18px", paddingRight:"18px", marginBottom: "16px"}}>
                    <Image src={g.tokenMetaUriData.image} style={{height: "100%", width:"100%", borderRadius:"25px"}}/>
                </Button>
              </>
                );
              })
        }
        <View style={{position: "fixed", marginLeft:"-20px", paddingLeft:"16px", paddingTop: "16px", bottom: "0px", height:"80px", width:"100%", backdropFilter: "blur(5px)", background: "rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "row"}}>
        <Button onClick={() => nav.push("create")} style={{borderRadius: "8px", position: "fixed", bottom: "16px", backgroundColor: "#FC9870", color: "rgba(24, 24, 24, 0.85)", width: "90%", marginRight:"20px", alignItems: "center", height: "48px", fontWeight: "500", fontSize: "16px", lineHeight: "25px", zIndex: "1"}}>Create</Button>
        </View>
    </View>
  );
    
}