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
                  minWidth: "40vw",
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
                  minWidth: "40vw",
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
              height: !isXs ? 270 : 180,
              maxWidth: !isXs ? 375 : 250,
              borderRadius: 5,
              cursor: "pointer",
            }}
            src={mediaLink}
          />
        )}
      </div>
    </>
  );
};
