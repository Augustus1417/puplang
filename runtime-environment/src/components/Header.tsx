import { useEffect, useRef, useState } from "react";
import CloseButtons from "./CloseButtons";
import InstructionsModal from "./InstructionsModal";

interface HeaderProps {
  code: string;
  onChangeCode: (value: string) => void;
  setConsoleLog: (value: string) => void;
  currentFilePath?: string | null;
  setCurrentFilePath: (path: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({
  code,
  onChangeCode,
  setConsoleLog,
  currentFilePath,
  setCurrentFilePath,
}) => {
  const header = useRef<HTMLElement>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (!window.electron) return;
    const unsubscribe = window.electron.onToggleTitlebar((show: boolean) => {
      if (show) {
        header.current?.classList.remove("hidden");
      } else {
        header.current?.classList.add("hidden");
      }
    });
    return unsubscribe;
  }, []);

  const handleOpen = async () => {
    try {
      const res = await (window.api as any).openFile?.();
      if (res && !res.canceled && typeof res.content === "string") {
        onChangeCode(res.content);
        setCurrentFilePath(res.filePath || null);
        setConsoleLog(res.filePath ? `Opened ${res.filePath}` : "File opened");
      } else {
        setConsoleLog("Open cancelled");
      }
    } catch (e) {
      setConsoleLog("Failed to open file");
    }
  };

  const handleSave = async () => {
    try {
      let res;
      if (currentFilePath) {
        res = await (window.api as any).saveFile?.({
          content: code,
          defaultPath: currentFilePath,
        });
      } else {
        res = await (window.api as any).saveFile?.({ content: code });
      }

      if (res && !res.canceled && res.filePath) {
        setCurrentFilePath(res.filePath);
        setConsoleLog(`Saved ${res.filePath}`);
      } else {
        setConsoleLog("Save cancelled");
      }
    } catch (e) {
      setConsoleLog("Failed to save file");
    }
  };

  const handleSaveAs = async () => {
    try {
      const res = await (window.api as any).saveFile?.({ content: code });
      if (res && !res.canceled && res.filePath) {
        setCurrentFilePath(res.filePath);
        setConsoleLog(`Saved ${res.filePath}`);
      } else {
        setConsoleLog("Save As cancelled");
      }
    } catch (e) {
      setConsoleLog("Failed to Save As file");
    }
  };
  return (
    <>
      <nav
        ref={header}
        className="h-10 dark:bg-main-dark bg-[#2c2c2c] z-10 drag px-3 border-b border-black/20 dark:border-white/10"
      >
        <div className="flex items-center justify-between h-full">

          {/* LEFT BUTTONS */}
          <div className="flex items-center gap-2 no-drag">
            <button
              onClick={handleOpen}
              className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-white/10 text-sm"
            >
              Open
            </button>

            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-white/10 text-sm"
            >
              Save
            </button>

            <button
              onClick={handleSaveAs}
              className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-white/10 text-sm"
            >
              Save As
            </button>

            <div className="h-6 w-px bg-gray-600"></div>

            <button
              onClick={() => setShowInstructions(true)}
              className="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-600 text-white border border-white/10 text-sm"
              title="View Laurel language manual and syntax"
            >
              Help
            </button>
          </div>

          {/* RIGHT WINDOW BUTTONS */}
          <div className="no-drag flex items-center pr-2 [>&_*]:mx-1">
            {window.electron && <CloseButtons />}
          </div>

        </div>
      </nav>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </>
  );
};

export default Header;
