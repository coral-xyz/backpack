import React, { useState } from "react";
import { useBreakpoints } from "@coral-xyz/app-extension/src/components/common/Layout/hooks";
import { useCustomTheme } from "@coral-xyz/themes";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, Modal, Typography } from "@mui/material";

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
  console.log("background - ", theme.custom.colors.background);
  return (
    <>
      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: theme.custom.colors.background,
              boxShadow: 24,
              p: isXs ? 1 : 3,
              outline: "none",
            }}
          >
            {mediaKind === "video" ? (
              <video
                style={{
                  borderRadius: 5,
                  minWidth: "30vw",
                  maxWidth: "80vw",
                  maxHeight: "80vh",
                }}
                controls={true}
                src={mediaLink}
              />
            ) : (
              <img
                style={{
                  borderRadius: 5,
                  minWidth: "30vw",
                  maxWidth: "80vw",
                  maxHeight: "80vh",
                }}
                src={mediaLink}
              />
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                marginTop: 5,
              }}
            >
              <a href={mediaLink} download="AwesomeImage.png">
                <DownloadIcon
                  style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
                />
              </a>
            </div>
          </Box>
        </Modal>
      )}
      <div style={{ marginTop: 3 }}>
        {mediaKind === "video" ? (
          <div style={{ display: "flex" }}>
            <div
              style={{
                position: "relative",
                maxHeight: !isXs ? 260 : 180,
                width: 1,
              }}
            >
              <video
                style={{
                  maxHeight: !isXs ? 260 : 180,
                  maxWidth: !isXs ? "30vw" : "70vw",
                  objectFit: "contain",
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
          <div
            style={{
              maxHeight: !isXs ? 320 : 220,
              width: 1,
              marginTop: 5,
            }}
          >
            <img
              onClick={() => setModalOpen(true)}
              style={{
                cursor: "pointer",
                borderRadius: 5,
                maxHeight: !isXs ? 320 : 220,
                maxWidth: !isXs ? "30vw" : "70vw",
                objectFit: "contain",
              }}
              src={mediaLink}
            />
          </div>
        )}
      </div>
    </>
  );
};
