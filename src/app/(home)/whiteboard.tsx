import useTldDrawSyncStore from "@/hooks/useTldDrawSyncStore";
import { CircleX, Palette } from "lucide-react";
import { FC } from "react";
import { Tldraw, TLUiComponents, TLUiOverrides } from "tldraw";

import "tldraw/tldraw.css";

type WhiteboardProps = {
  roomId: string | null;
  toggleDrawingMode?: (data: boolean) => void;
};

const Whiteboard: FC<WhiteboardProps> = ({
  roomId,
  toggleDrawingMode = () => {},
}) => {
  const store = useTldDrawSyncStore({ roomId });

  const components: TLUiComponents = {
    HelpMenu: null,
    ZoomMenu: null,
    MainMenu: null,
    PageMenu: null,
    NavigationPanel: null,
    KeyboardShortcutsDialog: null,
    HelperButtons: null,
    DebugPanel: null,
    DebugMenu: null,
    SharePanel: null,
    TopPanel: null,
  };

  return (
    <>
      <Tldraw
        cameraOptions={{ isLocked: true }}
        components={components}
        autoFocus
        inferDarkMode
        store={store}
      ></Tldraw>
      <CircleX
        className="text-newAccent mx-auto my-2 cursor-pointer z-[9999]"
        onClick={() => toggleDrawingMode(false)}
      />
    </>
  );
};

export default Whiteboard;
