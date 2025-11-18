import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  CropFree as MaximizeIcon,
  Remove as MinimizeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Box } from "@mui/material";

interface BrowserUIProps {
  showTitleBar: boolean;
  showUrlBar: boolean;
  showBookmarkBar: boolean;
  isMacOSStyle?: boolean;
}

export default function BrowserUI({
  showTitleBar,
  showUrlBar,
  showBookmarkBar,
  isMacOSStyle = false,
}: BrowserUIProps) {
  const titleBarHeight = 30;
  const urlBarHeight = 40;
  const bookmarkBarHeight = 30;

  let currentY = 0;
  if (showTitleBar) currentY += titleBarHeight;
  if (showUrlBar) currentY += urlBarHeight;
  const bookmarkBarTop = currentY;
  if (showBookmarkBar) currentY += bookmarkBarHeight;

  return (
    <Box
      data-browser-ui
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: "auto",
        zIndex: 2000, // Highest z-index to ensure it's on top
      }}
    >
      {/* Title Bar */}
      {showTitleBar && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${titleBarHeight}px`,
            backgroundColor: "#f0f0f0",
            borderBottom: "1px solid #d0d0d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "8px",
            paddingRight: "8px",
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          {isMacOSStyle ? (
            <>
              {/* macOS style: Red, Yellow, Green circles on the left */}
              <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <Box
                  sx={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ff5f57",
                    border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Box
                  sx={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ffbd2e",
                    border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Box
                  sx={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#28ca42",
                    border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: 500,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Canvas
              </Box>
              <Box sx={{ width: "60px" }} /> {/* Spacer to center title */}
            </>
          ) : (
            <>
              <Box
                sx={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: 500,
                }}
              >
                Canvas
              </Box>
              <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {/* Windows style: Icons on the right */}
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MinimizeIcon sx={{ fontSize: "14px", color: "#666" }} />
                </Box>
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaximizeIcon sx={{ fontSize: "14px", color: "#666" }} />
                </Box>
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloseIcon sx={{ fontSize: "14px", color: "#666" }} />
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* URL Bar */}
      {showUrlBar && (
        <Box
          sx={{
            position: "absolute",
            top: showTitleBar ? titleBarHeight : 0,
            left: 0,
            width: "100%",
            height: `${urlBarHeight}px`,
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #d0d0d0",
            display: "flex",
            alignItems: "center",
            paddingLeft: "12px",
            paddingRight: "12px",
            gap: "8px",
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              <ArrowBackIcon sx={{ fontSize: "18px" }} />
            </Box>
            <Box
              sx={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: "18px" }} />
            </Box>
            <Box
              sx={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              <RefreshIcon sx={{ fontSize: "18px" }} />
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: "28px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              paddingLeft: "8px",
              fontSize: "13px",
              color: "#333",
            }}
          >
            https://canvas.example.com
          </Box>
        </Box>
      )}

      {/* Bookmark Bar */}
      {showBookmarkBar && (
        <Box
          sx={{
            position: "absolute",
            top: bookmarkBarTop,
            left: 0,
            width: "100%",
            height: `${bookmarkBarHeight}px`,
            backgroundColor: "#fafafa",
            borderBottom: "1px solid #d0d0d0",
            display: "flex",
            alignItems: "center",
            paddingLeft: "8px",
            paddingRight: "8px",
            gap: "8px",
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          {["Home", "Bookmarks", "History", "Downloads"].map((label) => (
            <Box
              key={label}
              sx={{
                padding: "4px 8px",
                fontSize: "12px",
                color: "#333",
                borderRadius: "2px",
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
