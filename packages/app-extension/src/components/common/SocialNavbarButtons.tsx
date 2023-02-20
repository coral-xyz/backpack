import { DiscordIcon, TwitterIcon } from "@coral-xyz/react-common";

const SocialNavbarButtons = () => {
  const handleTwitterClick = () => {
    window.open("https://twitter.com/xNFT_Backpack", "_blank", "noreferrer");
    window.open("https://twitter.com/wao_gg", "_blank", "noreferrer");
  };

  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      <a rel="noreferrer" target="_blank" href="https://discord.gg/RdjmJyvyBs">
        <DiscordIcon
          style={{ marginRight: "5px", height: "16px" }}
          fill="#5865F2"
        />
      </a>
      <span style={{ cursor: "pointer" }} onClick={handleTwitterClick}>
        <TwitterIcon
          style={{ marginLeft: "5px", height: "20px" }}
          fill="#1D9BF0"
        />
      </span>
    </span>
  );
};

export default SocialNavbarButtons;
