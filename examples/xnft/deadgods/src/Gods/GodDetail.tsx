import {
  usePublicKey,
  useConnection,
  useNavigation,
  View,
  Image,
  Text,
  Button,
  Tab,
  List,
  ListItem,
} from "react-xnft";
import { PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { THEME } from "../utils/theme";
import {
  useFarmer,
  gemFarmClient,
  gemBankClient,
  DEAD_FARM,
  DEAD_BANK,
  PID_GEM_BANK,
  METADATA_PID,
} from "../utils";

export function GodDetailScreen({ god }) {
  const nav = useNavigation();
  const publicKey = usePublicKey();
  const connection = useConnection();
  const [farmer, isLoading] = useFarmer();

  //
  // WARNING: these stake/unstake methods only work for one NFT at at a time right now.
  //
  const stake = async () => {
    if (isLoading) {
      console.error("cannot stake while the farmer is loading");
      return;
    }

    // If the farmer account doesn't exist, we need to initialize it for the user.
    if (!farmer) {
      // TODO.
      console.error(
        "This xNFT doesn't currently support farm account initialization. Please submit a PR!"
      );
      return;
    }
    // If the user is already staked, use the simplified flash deposit.
    else if (farmer.state.staked) {
      await withAccounts("stake-flash");
    }
    // If the user is not already staked, then need to start staking.
    else {
      await withAccounts("stake");
    }

    nav.pop();
  };
  const unstake = async () => {
    if (isLoading) {
      console.error("cannot unstake while the farmer is loading");
      return;
    }

    // If unstaking the last NFT, then we are completely unstaked. Don't bother restaking.
    if (farmer.gemsStaked.toNumber() === 1) {
      await withAccounts("unstake-no-restake");
    }
    // If there are more NFTS still staked, then you need to restake.
    else {
      await withAccounts("unstake");
    }

    nav.pop();
  };

  const withAccounts = async (method: string) => {
    const farmClient = gemFarmClient();
    const bankClient = gemBankClient();

    const identity = publicKey;
    const farm = DEAD_FARM;
    const bank = DEAD_BANK;
    const gemMint = new PublicKey(god.metadata.mint.toString());
    const gemSource = new PublicKey(god.publicKey.toString());

    const [farmer, bumpFarmer] = await PublicKey.findProgramAddress(
      [Buffer.from("farmer"), farm.toBuffer(), publicKey.toBuffer()],
      farmClient.programId
    );
    const [farmAuthority, bumpAuth] = await PublicKey.findProgramAddress(
      [farm.toBuffer()],
      farmClient.programId
    );
    const [vault, _vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), bank.toBuffer(), publicKey.toBuffer()],
      PID_GEM_BANK
    );
    const [vaultAuthority, vaultAuthorityBump] =
      await PublicKey.findProgramAddress([vault.toBuffer()], PID_GEM_BANK);
    const [gemBox, gemBoxBump] = await PublicKey.findProgramAddress(
      [Buffer.from("gem_box"), vault.toBuffer(), gemMint.toBuffer()],
      PID_GEM_BANK
    );
    const [gemDepositReceipt, gemDepositReceiptBump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from("gem_deposit_receipt"),
          vault.toBuffer(),
          gemMint.toBuffer(),
        ],
        PID_GEM_BANK
      );
    const [gemMetadata] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        gemMint.toBuffer(),
      ],
      METADATA_PID
    );
    const [mintWhitelistProof] = await PublicKey.findProgramAddress(
      [Buffer.from("whitelist"), bank.toBuffer(), gemMint.toBuffer()],
      PID_GEM_BANK
    );
    const [farmTreasury, bumpTreasury] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury"), farm.toBuffer()],
      farmClient.programId
    );

    const tx = await (async () => {
      if (method === "stake") {
        const amount = new BN(1);

        return await bankClient.methods
          .depositGem(bumpAuth, gemBoxBump, gemDepositReceiptBump, amount)
          .accounts({
            bank,
            vault,
            owner: publicKey,
            authority: vaultAuthority,
            gemBox,
            gemDepositReceipt,
            gemSource,
            gemMint,
          })
          .remainingAccounts([
            // Mint whitelist proof.
            {
              pubkey: mintWhitelistProof,
              isSigner: false,
              isWritable: false,
            },
            // Gem metadata.
            {
              pubkey: gemMetadata,
              isSigner: false,
              isWritable: false,
            },
            // Creator whitelist proof.
            {
              pubkey: new PublicKey(
                "3nnpV6qxLYSogWbePgxGFLPDgF8ao9zzCWoQgLoUwjnW"
              ),
              isSigner: false,
              isWritable: false,
            },
          ])
          .postInstructions([
            await farmClient.methods
              .stake(bumpAuth, bumpFarmer)
              .accounts({
                farm,
                farmAuthority,
                farmer,
                identity,
                bank,
                vault,
                gemBank: PID_GEM_BANK,
              })
              .instruction(),
          ])
          .transaction();
      } else if (method === "stake-flash") {
        const amount = new BN(1);

        return await farmClient.methods
          .flashDeposit(
            bumpFarmer,
            vaultAuthorityBump,
            gemBoxBump,
            gemDepositReceiptBump,
            amount
          )
          .accounts({
            farm,
            farmAuthority,
            farmer,
            identity,
            bank,
            vault,
            vaultAuthority,
            gemBox,
            gemDepositReceipt,
            gemSource,
            gemMint,
            //						tokenProgram
            //						systemProgram,
            //						tokenProgram,
            //						rent,
            gemBank: PID_GEM_BANK,
          })
          .remainingAccounts([
            // Mint whitelist proof.
            {
              pubkey: mintWhitelistProof,
              isSigner: false,
              isWritable: false,
            },
            // Gem metadata.
            {
              pubkey: gemMetadata,
              isSigner: false,
              isWritable: false,
            },
            // Creator whitelist proof.
            {
              pubkey: new PublicKey(
                "3nnpV6qxLYSogWbePgxGFLPDgF8ao9zzCWoQgLoUwjnW"
              ),
              isSigner: false,
              isWritable: false,
            },
          ])
          .transaction();
      } else if (method === "unstake") {
        const amount = new BN(1);
        const receiver = publicKey;
        const gemDestination = await anchor.utils.token.associatedAddress({
          mint: gemMint,
          owner: receiver,
        });
        const tx = new Transaction();
        tx.add(
          await farmClient.methods
            .unstake(bumpAuth, bumpTreasury, bumpFarmer)
            .accounts({
              farm,
              farmAuthority,
              farmTreasury,
              farmer,
              identity,
              bank,
              vault,
              gemBank: PID_GEM_BANK,
            })
            .instruction()
        );
        // Yes this needs to be invoked twice.
        tx.add(
          await farmClient.methods
            .unstake(bumpAuth, bumpTreasury, bumpFarmer)
            .accounts({
              farm,
              farmAuthority,
              farmTreasury,
              farmer,
              identity,
              bank,
              vault,
              gemBank: PID_GEM_BANK,
            })
            .instruction()
        );
        tx.add(
          await bankClient.methods
            .withdrawGem(bumpAuth, gemBoxBump, gemDepositReceiptBump, amount)
            .accounts({
              bank,
              vault,
              owner: publicKey,
              authority: vaultAuthority,
              gemBox,
              gemDepositReceipt,
              gemDestination, // Receiver ATA for the gem mint.
              gemMint,
              receiver,
            })
            .instruction()
        );
        tx.add(
          await farmClient.methods
            .stake(bumpAuth, bumpFarmer)
            .accounts({
              farm,
              farmAuthority,
              farmer,
              identity,
              bank,
              vault,
              gemBank: PID_GEM_BANK,
            })
            .instruction()
        );
        return tx;
      } else if (method === "unstake-no-restake") {
        const amount = new BN(1);
        const receiver = publicKey;
        const gemDestination = await anchor.utils.token.associatedAddress({
          mint: gemMint,
          owner: receiver,
        });
        const tx = new Transaction();
        tx.add(
          await farmClient.methods
            .unstake(bumpAuth, bumpTreasury, bumpFarmer)
            .accounts({
              farm,
              farmAuthority,
              farmTreasury,
              farmer,
              identity,
              bank,
              vault,
              gemBank: PID_GEM_BANK,
            })
            .instruction()
        );
        // Yes this needs to be invoked twice.
        tx.add(
          await farmClient.methods
            .unstake(bumpAuth, bumpTreasury, bumpFarmer)
            .accounts({
              farm,
              farmAuthority,
              farmTreasury,
              farmer,
              identity,
              bank,
              vault,
              gemBank: PID_GEM_BANK,
            })
            .instruction()
        );
        tx.add(
          await bankClient.methods
            .withdrawGem(bumpAuth, gemBoxBump, gemDepositReceiptBump, amount)
            .accounts({
              bank,
              vault,
              owner: publicKey,
              authority: vaultAuthority,
              gemBox,
              gemDepositReceipt,
              gemDestination, // Receiver ATA for the gem mint.
              gemMint,
              receiver,
            })
            .instruction()
        );
        return tx;
      } else {
        throw new Error("invalid method");
      }
    })();

    const { blockhash } = await connection!.getLatestBlockhash("recent");
    tx.recentBlockhash = blockhash;

    const signature = await window.xnft.send(tx);
    console.log("tx signature", signature);
  };

  return (
    <View
      style={{
        marginRight: "20px",
        marginLeft: "20px",
      }}
    >
      <Image
        style={{
          marginBottom: "24px",
          display: "block",
          borderRadius: "6px",
          width: "335px",
          height: "335px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        src={god.tokenMetaUriData.image}
      />
      <Text
        style={{
          color: THEME.colors.textSecondary,
        }}
      >
        Description
      </Text>
      <Text
        style={{
          color: THEME.colors.text,
          marginBottom: "10px",
        }}
      >
        {god.tokenMetaUriData.description}
      </Text>
      {god.isStaked ? (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "24px",
            marginBottom: "24px",
            backgroundColor: THEME.colors.unstake,
            color: THEME.colors.text,
          }}
          onClick={() => unstake()}
        >
          Unstake
        </Button>
      ) : (
        <Button
          style={{
            height: "48px",
            width: "335px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "24px",
            marginBottom: "24px",
            backgroundColor: THEME.colors.stake,
            color: THEME.colors.text,
          }}
          onClick={() => stake()}
        >
          Stake
        </Button>
      )}
      <View>
        <Tab.Navigator
          options={({ route }) => {
            return {
              tabBarIcon: ({ focused }) => {
                switch (route.name) {
                  case "attributes":
                    return (
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 500,
                          textAlign: "left",
                          color: THEME.colors.textSecondary,
                        }}
                      >
                        Attributes
                      </Text>
                    );
                  case "details":
                    return (
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 500,
                          textAlign: "left",
                          color: THEME.colors.textSecondary,
                        }}
                      >
                        Details
                      </Text>
                    );
                  default:
                    throw new Error("unknown route");
                }
              },
              tabBarActiveTintColor: THEME.colors.text,
              tabBarInactiveTintColor: THEME.colors.attributeBackground,
            };
          }}
          style={{
            height: "34px",
            background: "transparent",
            borderTop: "none",
          }}
          disableScroll
          top
        >
          <Tab.Screen
            name="attributes"
            disableLabel={true}
            component={() => <AttributesTabScreen god={god} />}
          />
          <Tab.Screen
            name="details"
            disableLabel={true}
            component={() => <DetailsScreen god={god} />}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}

function AttributesTabScreen({ god }) {
  return (
    <View
      style={{
        minHeight: "281px",
      }}
    >
      <View
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "12px",
          marginLeft: "-4px",
          marginRight: "-4px",
        }}
      >
        {god.tokenMetaUriData.attributes.map((attr) => {
          return (
            <View
              style={{
                padding: "4px",
              }}
            >
              <View
                style={{
                  borderRadius: "8px",
                  backgroundColor: THEME.colors.attributeBackground,
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                }}
              >
                <Text
                  style={{
                    color: THEME.colors.attributeTitle,
                    fontSize: "14px",
                  }}
                >
                  {attr.trait_type}
                </Text>
                <Text
                  style={{
                    color: THEME.colors.text,
                    fontSize: "16px",
                  }}
                >
                  {attr.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DetailsScreen({ god }) {
  return (
    <View
      style={{
        marginTop: "12px",
        minHeight: "281px",
      }}
    >
      <List
        style={{
          backgroundColor: THEME.colors.attributeBackground,
        }}
      >
        <DetailListItem
          title={"Website"}
          value={god.tokenMetaUriData.external_url}
        />
        <DetailListItem
          title={"Artist royalties"}
          value={`${(
            god.metadata.data.sellerFeeBasisPoints / 100
          ).toString()}%`}
        />
        <DetailListItem
          title={"Mint address"}
          value={god.metadata.mint.toString()}
        />
        <DetailListItem
          title={"Token address"}
          value={god.publicKey.toString()}
        />
        <DetailListItem
          title={"Metadata address"}
          value={god.metadataAddress.toString()}
        />
        <DetailListItem
          title={"Update authority"}
          value={god.metadata.updateAuthority.toString()}
        />
      </List>
    </View>
  );
}

function DetailListItem({ title, value }) {
  return (
    <ListItem
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        padding: "12px",
      }}
    >
      <Text
        style={{
          color: THEME.colors.text,
          fontSize: "14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: THEME.colors.textSecondary,
          fontSize: "14px",
          flexDirection: "column",
          justifyContent: "center",
          textOverflow: "ellipsis",
          width: "138px",
          overflow: "hidden",
          display: "block",
        }}
      >
        {value}
      </Text>
    </ListItem>
  );
}
