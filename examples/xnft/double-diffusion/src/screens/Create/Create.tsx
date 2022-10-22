import React, { useEffect, useState } from "react";
import { View, Text, TextField, useConnection, Loading, usePublicKey, Svg, Path, Button, useNavigation } from "react-xnft";
import {THEME} from '../../utils/theme'
import axios from 'axios'
import * as anchor from '@project-serum/anchor';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {client, MINT, DIFFUSION} from '../../utils/'

export function CreateScreen() {

    const nav = useNavigation();
    const [text, onChangeText] = useState("");
    const connection = useConnection();
    const identity = usePublicKey();
    const [loading, setLoading] = useState(false);

    const onClickTx = async () => {
        if (text.length > 262) {
          console.error("more than 262 characters are not allowed");
          return;
        }
    
        setLoading(true);
    
        console.log(text, identity.toString());
          const tx = await axios.post(
            `<API_URL>/fetch/${text}/${identity.toString()}`
          );
        console.log("trasnaction", tx);
        const provider = window.xnft.solana;
        console.log(provider);
    
        const SOLANA_RPC_METHOD_SIGN_AND_SEND_TX = "solana-sign-and-send-tx";
        const sig = await window.xnft.solana._requestManager.request({
          method: SOLANA_RPC_METHOD_SIGN_AND_SEND_TX,
          params: [tx.data?.tx, identity.toString(), {}],
        });
        const confirmation = await provider.connection.confirmTransaction(
          sig,
          "confirmed"
        );
        setLoading(false);
        nav.push("minted", {image: tx.data?.image_url, description: text})
      };
    
      const onQuery = async () => {
        if (text.length > 262) {
          console.error("more than 262 characters are not allowed");
          return;
        }
    
        setLoading(true);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: identity,
            toPubkey: new PublicKey("<WALLET_ADDRESS>"),
            lamports: 2500000,
          })
        );
        
        let tx = await window.xnft.send(transaction);
    
        console.log("transaction", tx);
        if (await connection.confirmTransaction(tx, "confirmed")) {
          const image = await axios.post(`<API_URL>/fetch/${text}`);
          setLoading(false);
          nav.push("preview", {image: image.data?.image, description: text})
        }
      };
    
    if (loading == true) {
        return (
            <LoadingIndicator/>
        )
    }

  return (
    <View style={{ height: "100%", paddingLeft:"20px", background: "#181819"}}>
        <TextField
            style={{ marginTop: "16px", width: "335px"}}
            multiline={true}
            numberOfLines={5}
            onChange={(e) => onChangeText(e.data.value)}
            value={text}
            placeholder="E.g. Raw prompt+Style+Artist+Finishing touches Panda, Oil painting, by Vincent Van Gogh, triadic color scheme"
            />
        <Text style={{fontSize: "12px", fontWeight: "400", fontStyle:"normal", lineHeight: "19px", color: "rgba(255, 255, 255, 0.85)", marginTop: "16px" }}>You only need to enter the key text, Double Diffusion will help you generate a magical picture.</Text>
        {/* <Text style={{fontSize: "12px", fontWeight: "400", fontStyle:"normal", lineHeight: "19px", color: THEME.colors.button, marginTop: "5px" }}>Prompt Guide {'>'}</Text> */}

        <Text style={{fontSize: "12px", fontWeight: "400", fontStyle:"normal", lineHeight: "19px", color: "rgba(255, 255, 255, 0.85)", marginTop:"70%"}}>Cost:</Text>
        <Text style={{fontSize: "12px", fontWeight: "400", fontStyle:"normal", lineHeight: "19px", color: "rgba(255, 255, 255, 0.85)"}}>- 0.05 SOL / per mint (2x Every Mint)</Text>
        <Text style={{fontSize: "12px", fontWeight: "400", fontStyle:"normal", lineHeight: "19px", color: "rgba(255, 255, 255, 0.85)" }}>- 0.0025 SOL / per query</Text>

        <View style={{position: "fixed", marginLeft:"-20px", paddingLeft:"16px", paddingTop: "16px", bottom: "0px", height:"80px", width:"100%", backdropFilter: "blur(5px)", background: "rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "row"}}>
            {
                text.length > 0 ? 
                <>
                    <Button onClick={() => onClickTx()} style={{ zIndex: "1", width:"162px", height:"48px", background: THEME.colors.button, display: "flex", borderRadius: "8px", flexDirection: "column"}}>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontWeight: "700", fontSize: "14px", lineHeight: "22px", color: "rgba(255, 255, 255, 0.85)"}}>Mint</Text>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontSize: "12px", fontWeight: "400", lineHeight: "19px", color: "rgba(255, 255, 255, 0.85)"}}>0.05 SOL</Text>
                    </Button>
                    <Button onClick={() => onQuery()} style={{zIndex: "1", width:"162px", height:"48px", border: `1px solid ${THEME.colors.button}`, borderRadius: "8px", display: "flex", flexDirection: "column", marginLeft:"11px"}}>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontWeight: "700", fontSize: "14px", lineHeight: "22px", color: THEME.colors.button}}>Query</Text>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontSize: "12px", fontWeight: "400", lineHeight: "19px", color: THEME.colors.button}}>0.0025 SOL</Text>
                    </Button>
                </>
                :
                <>
                    <Button onClick={() => onClickTx()} style={{zIndex: "1", width:"162px", height:"48px", background: THEME.colors.button, display: "flex", borderRadius: "8px", flexDirection: "column", opacity: "0.5"}}>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontWeight: "700", fontSize: "14px", lineHeight: "22px", color: "rgba(255, 255, 255, 0.85)"}}>Mint</Text>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontSize: "12px", fontWeight: "400", lineHeight: "19px", color: "rgba(255, 255, 255, 0.85)"}}>0.05 SOL</Text>
                    </Button>
                    <Button onClick={() => onQuery()} style={{zIndex: "1", width:"162px", height:"48px", border: `1px solid ${THEME.colors.button}`, borderRadius: "8px", display: "flex", flexDirection: "column", opacity: "0.5", marginLeft:"11px"}}>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontWeight: "700", fontSize: "14px", lineHeight: "22px", color: THEME.colors.button}}>Query</Text>
                        <Text style={{marginLeft:"auto", marginRight:"auto", fontSize: "12px", fontWeight: "400", lineHeight: "19px", color: THEME.colors.button}}>0.0025 SOL</Text>
                    </Button>
                </>
            }
        </View>
    </View>
  );
}



function LoadingIndicator() {
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            background: "#181819"
          }}
        >
          <View style={{borderRadius:"25px", background: "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)", height: "343px", width: "343px", paddingLeft: "18px", paddingBottom: "18px", paddingTop: "18px", paddingRight:"18px", marginBottom: "16px", marginLeft: "16px"}}>
          <Loading
            style={{ display: "block", marginLeft: "auto", marginRight: "auto", marginTop:"75px", color: "white", height: "150px", width:"150px" }}
          />                
          </View>
          
          <Text
            style={{ marginLeft: "auto", marginRight: "auto", marginTop: "10px" }}
          >
            Fetching the result...
          </Text>
          <Text
            style={{ marginLeft: "auto", marginRight: "auto", marginTop: "10px" }}
          >
            ETA. 10s
          </Text>
        </View>
      );
    }
    