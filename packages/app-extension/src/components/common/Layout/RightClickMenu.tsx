import { useState } from "react";
import type { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Menu } from "@mui/material";

export function RightClickMenu({
  renderItems,
  children,
  className,
  style,
}: {
  children: ReactJSXElement;
  className?: string;
  style?: React.StyleHTMLAttributes<"div">;
  renderItems: (close: () => void) => ReactJSXElement | ReactJSXElement[];
}) {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <div className={className} style={style} onContextMenu={handleContextMenu}>
      {children}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {renderItems(handleClose)}
      </Menu>
    </div>
  );
}
