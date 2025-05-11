import React, { useEffect, useState } from "react";
import { SpaceEditCanvas, SpaceElemProps } from "./SpaceEditCanvas";
import { useAuth } from "../Context/UseAuth";
import axios from "axios";
import { config } from "../config";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export interface elemProps {
  name: string;
  depth: number;
  height: number;
  width: number;
  id: string;
  imageUrl: string;
  isStatic: boolean;
}

export const SpaceEditingPage: React.FC = () => {
  const [currElem, setCurrElem] = useState<elemProps | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [elements, setElements] = useState<elemProps[]>([]);
  const { accessToken } = useAuth();
  const { spaceId } = useParams();
  const [savingLoader, setSavingLoader] = useState(false);

  useEffect(() => {
    if (accessToken) {
      const main = async () => {
        const elementsRes = await axios.get(`${config.BackendUrl}/elements`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const elements = elementsRes.data.elements;
        setElements(elements);
      };
      main();
    }
  }, [accessToken]);

  const handleDragStart = (e: React.DragEvent, elem: elemProps) => {
    e.dataTransfer.setData("name", elem.name);
    e.dataTransfer.setData("depth", elem.depth.toString());
    e.dataTransfer.setData("width", elem.width.toString());
    e.dataTransfer.setData("height", elem.height.toString());
    e.dataTransfer.setData("isStatic", elem.isStatic.toString());
    e.dataTransfer.setData("elementId", elem.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const name = e.dataTransfer.getData("name");
    const depth = e.dataTransfer.getData("depth");
    const width = e.dataTransfer.getData("width");
    const height = e.dataTransfer.getData("height");
    const isStatic = e.dataTransfer.getData("isStatic");
    const elementId = e.dataTransfer.getData("elementId");
    const boundingRect = (e.target as HTMLElement).getBoundingClientRect();
    const detail = {
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
      depth: Number(depth),
      width: Number(width),
      height: Number(height),
      isStatic: isStatic === "true" ? true : false,
      name,
      elementId,
    };
    window.dispatchEvent(new CustomEvent("drop-on-canvas", { detail }));
  };

  const handleClickSave = async () => {
    if (accessToken && spaceId) {
      setSavingLoader(true);
      try {
        const prevElements = JSON.parse(localStorage.getItem(`prev${spaceId}`) || "[]");
        const elements = JSON.parse(localStorage.getItem(`${spaceId}`) || "[]");

        const removedElements = prevElements.filter(
          (prevElem: SpaceElemProps) =>
            !elements.some((elem: SpaceElemProps) => elem.id === prevElem.id)
        );
        const addedElements = elements.filter(
          (elem: SpaceElemProps) =>
            !prevElements.some((prevElem: SpaceElemProps) => elem.id === prevElem.id)
        );

        if (elements && elements.length) {
          for (const elem of addedElements) {
            try {
              await axios.post(
                `${config.BackendUrl}/space/element`,
                {
                  x: elem.x,
                  y: elem.y,
                  depth: elem.depth,
                  elementId: elem.elementId,
                  spaceId,
                },
                {
                  headers: {
                    Authorization: `Beaere ${accessToken}`,
                  },
                }
              );
            } catch {
              console.error(`${elem.id} sending failed`);
            }
          }

          for (const elem of removedElements) {
            try {
              await axios.delete(`${config.BackendUrl}/space/element/${elem.elementId}`, {
                data: {
                  spaceId,
                  elementId: elem.elementId,
                  x: elem.x,
                  y: elem.y,
                  depth: elem.depth,
                },
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
            } catch {
              console.error(`${elem.id} deleting failed`);
            }
          }
        }
        localStorage.setItem(`prev${spaceId}`, JSON.stringify(elements));
      } catch {
        console.log("Error saving elements");
      } finally {
        setSavingLoader(false);
      }
    }
  };

  const handleClear = () => {
    setIsDeleting((prev) => !prev);
    window.dispatchEvent(new CustomEvent("clear-canvas"));
  };

  const handleClearAll = () => {
    window.dispatchEvent(new CustomEvent("clear-all-canvas"));
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
              disabled={savingLoader}
              className={`relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-lg text-white font-medium shadow-md ${
                savingLoader ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {savingLoader && <Loader2 className="h-5 w-5 animate-spin" />}
              {savingLoader ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-700 mb-2"></div>

          {/* Elements Grid */}
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2">
            {elements.map((el) => (
              <div
                key={el.name}
                draggable
                onDragStart={(e) => {
                  setCurrElem(el);
                  handleDragStart(e, el);
                }}
                onClick={() => {
                  setCurrElem(el);
                }}
                className={`py-2 px-3 border rounded-lg flex flex-col items-center justify-center cursor-grab transition-all hover:scale-105 ${
                  currElem?.name === el.name
                    ? "bg-indigo-700 border-indigo-400"
                    : "bg-gray-700 border-gray-600 hover:border-indigo-400"
                }`}
              >
                <div className="w-full h-16 flex items-center justify-center mb-1">
                  <img
                    src={`/assets/${el.name}.png`}
                    alt={el.name.toUpperCase()}
                    className="object-contain max-h-full"
                  />
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {el.name.toUpperCase()}
                </span>
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
