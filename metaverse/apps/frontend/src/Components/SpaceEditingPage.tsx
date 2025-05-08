import React, { useEffect, useState } from "react";
import { SpaceEditCanvas } from "./SpaceEditCanvas";
import { useAuth } from "../Context/UseAuth";
export interface elemProps {
  type: string;
  label: string;
  depth: number;
}
const elements = [
  { type: "floor-tile", label: "Floor-Tile", depth: -10 },
  { type: "table", label: "Table", depth: 0 },
  { type: "chair-left", label: "Chair-Left", depth: 0 },
  { type: "chair-right", label: "Chair-Right", depth: 0 },
  { type: "chair-front", label: "Chair-Front", depth: 0 },
  { type: "chair-back", label: "Chair-Back", depth: 0 },
  { type: "big-table", label: "Big-Chair", depth: 0 },
  { type: "desk", label: "Desk", depth: 0 },
  { type: "plant", label: "Plant", depth: 0 },
  { type: "bookshelf", label: "BookShelf", depth: 0 },
  { type: "whiteboard", label: "WhiteBoard", depth: 0 },
  { type: "lamp", label: "Lamp", depth: 0 },
  { type: "carpet", label: "Carpet", depth: 0 },
  { type: "pond", label: "Pond", depth: 0 },
  { type: "wall", label: "Wall-Horizontal", depth: 0 },
  { type: "wall-left", label: "Wall-Vertical", depth: 0 },
  { type: "grass", label: "Grass", depth: -9 },
];

const App: React.FC = () => {
  const [currElem, setCurrElem] = useState<elemProps | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      const main = () => {
        const elementsRes = await;
      };
    }
  });

  const handleDragStart = (e: React.DragEvent, type: string, depth: number) => {
    e.dataTransfer.setData("type", type);
    e.dataTransfer.setData("depth", depth.toString());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const depth = e.dataTransfer.getData("depth");
    const boundingRect = (e.target as HTMLElement).getBoundingClientRect();
    const detail = {
      type,
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
      depth,
    };
    window.dispatchEvent(new CustomEvent("drop-on-canvas", { detail }));
  };

  const handleClickSave = async () => {
    const elements = JSON.parse(localStorage.getItem("elements") || "[]");
    if (elements && elements.length) {
      console.log("elements send success");
    }
  };

  const handleClear = () => {
    setIsDeleting((prev) => !prev);
    window.dispatchEvent(new CustomEvent("clear-canvas"));
  };

  const handleClearAll = () => {
    window.dispatchEvent(new CustomEvent("clear-all-canvas"));
    localStorage.removeItem("elements");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 p-6">
      {/* Main Canvas Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-500 flex justify-center w-3/4 h-full overflow-hidden rounded-lg bg-gray-800 shadow-lg"
      >
        <SpaceEditCanvas element={currElem} />
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col w-1/4 ml-6 bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col gap-4 overflow-y-auto h-full">
          {/* Header & Save Button */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-indigo-300">Elements</h3>
            <button
              onClick={handleClickSave}
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-lg text-white font-medium shadow-md"
            >
              Save
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-700 mb-2"></div>

          {/* Elements Grid */}
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2">
            {elements.map((el) => (
              <div
                key={el.type}
                draggable
                onDragStart={(e) => {
                  setCurrElem(el);
                  handleDragStart(e, el.type, el.depth);
                }}
                onClick={() => {
                  setCurrElem(el);
                }}
                className={`py-2 px-3 border rounded-lg flex flex-col items-center justify-center cursor-grab transition-all hover:scale-105 ${
                  currElem?.type === el.type
                    ? "bg-indigo-700 border-indigo-400"
                    : "bg-gray-700 border-gray-600 hover:border-indigo-400"
                }`}
              >
                <div className="w-full h-16 flex items-center justify-center mb-1">
                  <img
                    src={`/assets/${el.type}.png`}
                    alt={el.label}
                    className="object-contain max-h-full"
                  />
                </div>
                <span className="text-xs font-medium truncate w-full text-center">{el.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
          <button
            onClick={handleClear}
            className={`${
              isDeleting ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
            } *:transition-colors py-2 rounded-lg text-gray-200 font-medium`}
          >
            Clear
          </button>
          <button
            onClick={handleClearAll}
            className="bg-red-900 hover:bg-red-800 transition-colors py-2 rounded-lg text-gray-200 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
