import { useState } from "react";
import { useBreakpoints } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Modal } from "@mui/material";

export const MediaContent = ({
  mediaLink,
  mediaKind,
}: {
  mediaLink: string;
  mediaKind: string;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();

  return (
    <>
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          componentsProps={{
            root: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 10px",
                height: "100vh",
                gap: 4,
              },
            },
            backdrop: {
              style: {
                background: "rgba(24, 24, 27, 0.9)",
                backdropFilter: "blur(5px)",
              },
            },
          }}
        >
          <>
            <CloseIcon
              style={{
                color: theme.custom.colors.icon,
                cursor: "pointer",
                position: "absolute",
                top: 10,
                right: 10,
              }}
              onClick={() => setModalOpen(false)}
            />
            {mediaKind === "video" ? (
              <video
                style={{
                  borderRadius: 5,
                  objectFit: "contain",
                  maxHeight: "85vh",
                }}
                controls={true}
                src={mediaLink}
              />
            ) : (
              <img
                style={{
                  borderRadius: 5,
                  objectFit: "contain",
                  maxHeight: "85vh",
                  maxWidth: "85vw",
                }}
                src={mediaLink}
              />
            )}
            <a
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
              }}
              href={mediaLink}
              download="AwesomeImage.png"
            >
              <DownloadIcon
                style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
                onClick={() => setModalOpen(false)}
              />
            </a>
          </>
        </Modal>
      )}
      <div style={{ marginTop: 3, width: 1 }}>
        {mediaKind === "video" ? (
          <div style={{ display: "flex" }}>
            <div style={{ position: "relative" }}>
              <video
                style={{
                  height: !isXs ? 270 : 180,
                  maxWidth: !isXs ? 375 : 250,
                  borderRadius: 5,
                }}
                controls={true}
                src={mediaLink}
              />
              <div
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  right: "0%",
                  top: "0%",
                  bottom: "0%",
                  margin: "auto",
                }}
                onClick={(e) => {
                  setModalOpen(true);
                  e.preventDefault();
                }}
              >
                <OpenInFullIcon
                  style={{ color: theme.custom.colors.icon, margin: 3 }}
                />
              </div>
            </div>
          </div>
        ) : (
          <img
            onClick={() => setModalOpen(true)}
            style={{
              height: "full",
              maxWidth: !isXs ? 375 : "60vw",
              borderRadius: 5,
              marginTop: 5,
              objectFit: "contain",
              cursor: "pointer",
            }}
            src={mediaLink}
          />
        )}
      </div>
    </>
  );
};
