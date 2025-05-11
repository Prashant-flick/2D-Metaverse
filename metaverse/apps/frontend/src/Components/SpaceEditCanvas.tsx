import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { elemProps } from "./SpaceEditingPage";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../Context/UseAuth";
import { useParams } from "react-router-dom";
import axios from "axios";
import { config } from "../config";
import { useLoader } from "../Context/UseLoader";
import Loader from "./Loader";

interface GameComponentProps {
  element: elemProps | null;
}

export interface SpaceElemProps {
  id: string;
  elementId: string;
  name: string;
  x: number;
  y: number;
  depth: number;
  height: number;
  width: number;
  isStatic: boolean;
  imageUrl: string;
}

interface spaceProps {
  id: string;
  dimensions: string;
  name: string;
}

export const SpaceEditCanvas: React.FC<GameComponentProps> = ({ element }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elements = useRef<SpaceElemProps[]>([]);
  const latestElemRef = useRef<elemProps | null>(null);
  const { accessToken } = useAuth();
  const { spaceId } = useParams();
  const [isElementLoaded, setIsElementLoaded] = useState<boolean>(false);
  const { loading, hideLoader, showLoader } = useLoader();
  const [space, setSpace] = useState<spaceProps | null>(null);

  useEffect(() => {
    if (accessToken && spaceId) {
      const localElements = JSON.parse(localStorage.getItem(`${spaceId}`)!);

      const main = async () => {
        showLoader();
        try {
          const spaceRes = await axios.get(`${config.BackendUrl}/space/${spaceId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          setSpace({
            name: spaceRes.data.spaceRes.name,
            id: spaceRes.data.spaceRes.id,
            dimensions: spaceRes.data.spaceRes.dimensions,
          });
          if (localElements) {
            elements.current = localElements;
            setIsElementLoaded(true);
          } else {
            elements.current = spaceRes.data.spaceRes.elements;
            setIsElementLoaded(true);
          }
        } catch (error) {
          console.error(error);
        }
        hideLoader();
      };
      main();
    } else {
      console.log("accessToken and spaceId is requrired");
    }
  }, [accessToken, spaceId, showLoader, hideLoader]);

  useEffect(() => {
    if (isElementLoaded) {
      elements.current = JSON.parse(localStorage.getItem(`${spaceId}`) || "{}");
      class DragDropScene extends Phaser.Scene {
        spacex = Math.floor(Number(space?.dimensions.split("x")[0]) / 64) * 64;
        spacey = Math.floor(Number(space?.dimensions.split("x")[1]) / 64) * 64;

        camera!: Phaser.Cameras.Scene2D.Camera;
        gridSize = 64;
        draggingOnOBject = false;
        draggingObjectInitX = -1;
        draggingObjectInitY = -1;

        constructor() {
          super("DragDropScene");
        }

        public deleteSelectedELem = false;

        addAllElements() {
          elements.current.map((elem) => {
            const image = this.add
              .image(elem.x, elem.y, elem.name!)
              .setInteractive({ draggable: true })
              .setDepth(elem.depth!)
              .on("pointerdown", () => {
                if (!this.deleteSelectedELem) return;
                const id = image.getData("id");
                image.destroy();
                elements.current = elements.current.filter((element) => element.id !== id);
                localStorage.setItem(`${spaceId}`, JSON.stringify(elements.current));
              });

            image.setData("id", elem.id);
          });
        }

        setElem(
          id: string,
          x: number,
          y: number,
          depth?: number,
          name?: string,
          width?: number,
          height?: number,
          isStatic?: boolean,
          elementId?: string
        ) {
          const isElemPresent = elements.current.find((elem) => elem.id === id);

          if (isElemPresent) {
            elements.current = elements.current.map((elem) => {
              if (elem.id === id) {
                elem.x = x;
                elem.y = y;
              }
              return elem;
            });
          } else {
            elements.current.push({
              id,
              x,
              y,
              depth: depth!,
              name: name!,
              width: width!,
              height: height!,
              isStatic: isStatic!,
              imageUrl: "",
              elementId: elementId!,
            });
          }
          localStorage.setItem(`${spaceId}`, JSON.stringify(elements.current));
        }

        preload() {
          this.load.image("floor-tile", "/assets/floor-tile.png");
          this.load.image("table", "/assets/table.png");
          this.load.image("desk", "/assets/desk.png");
          this.load.image("plant", "/assets/plant.png");
          this.load.image("bookshelf", "/assets/bookshelf.png");
          this.load.image("whiteboard", "/assets/whiteboard.png");
          this.load.image("coffeemachine", "/assets/coffeemachine.png");
          this.load.image("lamp", "/assets/lamp.png");
          this.load.image("carpet", "/assets/carpet.png");
          this.load.image("big-table", "/assets/big-table.png");
          this.load.image("chair-left", "/assets/chair-left.png");
          this.load.image("chair-front", "/assets/chair-front.png");
          this.load.image("chair-back", "/assets/chair-back.png");
          this.load.image("chair-right", "/assets/chair-right.png");
          this.load.image("pond", "/assets/pond.png");
          this.load.image("wall-horizontal", "/assets/wall-horizontal.png");
          this.load.image("grass", "/assets/grass.png");
          this.load.image("wall-vertical", "/assets/wall-vertical.png");
        }

        create() {
          this.camera = this.cameras.main;
          this.drawGrid();
          if (elements.current) {
            this.addAllElements();
          }

          window.addEventListener("clear-canvas", (event: Event) => {
            this.deleteSelectedELem = this.deleteSelectedELem === true ? false : true;
          });

          window.addEventListener("clear-all-canvas", (event: Event) => {
            elements.current = [];
            localStorage.removeItem(`${spaceId}`);
            localStorage.removeItem(`prev${spaceId}`);
            this.children.removeAll(true);
            this.drawGrid();
          });

          window.addEventListener("drop-on-canvas", ((event: Event) => {
            if (this.deleteSelectedELem) {
              alert("in deleting mode");
              return;
            }
            const e = event as CustomEvent<{
              name: string;
              x: number;
              y: number;
              depth: number;
              height: number;
              width: number;
              isStatic: boolean;
              elementId: string;
            }>;
            const { name, x, y, depth, height, width, isStatic, elementId } = e.detail;
            const worldPoint = this.cameras.main.getWorldPoint(x, y);
            const gridSize = 64;

            let snappedX = Math.floor(worldPoint.x / gridSize) * gridSize;
            let snappedY = Math.floor(worldPoint.y / gridSize) * gridSize;
            snappedX += width / 2;
            snappedY += height / 2;

            const alreadyPlaced = this.checkOverlap(
              snappedX,
              snappedY,
              Number(depth),
              Number(width),
              Number(height)
            );
            if (alreadyPlaced) {
              alert("already placed");
              return;
            }

            const image = this.add
              .image(snappedX, snappedY, name)
              .setInteractive({ draggable: true })
              .setDepth(Number(depth))
              .on("pointerdown", () => {
                if (!this.deleteSelectedELem) return;
                const id = image.getData("id");
                image.destroy();
                elements.current = elements.current.filter((element) => element.id !== id);
                localStorage.setItem(`${spaceId}`, JSON.stringify(elements.current));
              });

            const id = uuidv4();
            image.setData("id", id);
            this.setElem(id, snappedX, snappedY, depth, name, width, height, isStatic, elementId);
          }) as EventListener);

          this.input.on(
            "drag",
            (
              pointer: Phaser.Input.Pointer,
              gameObject: Phaser.GameObjects.Image,
              dragX: number,
              dragY: number
            ) => {
              if (this.deleteSelectedELem) {
                gameObject.destroy();
              } else {
                if (gameObject) {
                  this.draggingOnOBject = true;
                }

                const width = gameObject.displayWidth;
                const height = gameObject.displayHeight;
                let snappedX = Math.floor(dragX / this.gridSize) * this.gridSize;
                let snappedY = Math.floor(dragY / this.gridSize) * this.gridSize;
                snappedX += width / 2;
                snappedY += height / 2;
                if (this.draggingObjectInitX === -1 && this.draggingObjectInitY === -1) {
                  this.draggingObjectInitX = snappedX;
                  this.draggingObjectInitY = snappedY;
                }

                gameObject.setPosition(snappedX, snappedY);
                const id = gameObject.getData("id");
                this.setElem(id, snappedX, snappedY);
              }
            }
          );

          this.input.on(
            "dragend",
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
              const alreadyPlaced = this.checkOverlap(
                gameObject.x,
                gameObject.y,
                gameObject.depth,
                gameObject.width,
                gameObject.height,
                gameObject.getData("id")
              );
              if (alreadyPlaced) {
                gameObject.setPosition(this.draggingObjectInitX, this.draggingObjectInitY);
                const id = gameObject.getData("id");
                this.setElem(id, this.draggingObjectInitX, this.draggingObjectInitY);
                this.draggingObjectInitX = -1;
                this.draggingObjectInitY = -1;
                this.draggingOnOBject = false;
                console.log("already placed drag");
                return;
              }
              this.draggingOnOBject = false;
            }
          );

          this.input.on(
            "wheel",
            (
              pointer: Phaser.Input.Pointer,
              currentlyOver: Phaser.GameObjects.GameObject[],
              deltaX: number,
              deltaY: number
            ) => {
              const zoomChange = deltaY > 0 ? -0.1 : 0.1;
              const newZoom = Phaser.Math.Clamp(this.camera.zoom + zoomChange, 0.5, 3);
              this.camera.setZoom(newZoom);
            }
          );

          this.input.mouse?.disableContextMenu();
          let isDragging = false;
          let dragStartX = 0;
          let dragStartY = 0;
          let clickStartPos: { x: number; y: number } | null = null;
          let isDargSelecting = false;
          let isDragDeleting = false;

          this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.draggingOnOBject) return;
            if (pointer.leftButtonDown() && this.deleteSelectedELem) {
              isDragDeleting = true;
            } else if (pointer.rightButtonDown()) {
              isDragging = true;
              dragStartX = pointer.x;
              dragStartY = pointer.y;
            } else if (pointer.leftButtonDown() && latestElemRef.current) {
              const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
              clickStartPos = {
                x: worldPoint.x,
                y: worldPoint.y,
              };
              isDargSelecting = true;
            }
          });

          this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (this.draggingOnOBject) return;

            if (pointer.leftButtonReleased() && this.deleteSelectedELem) {
              isDragDeleting = false;
            } else if (pointer.rightButtonReleased()) {
              isDragging = false;
            } else if (pointer.leftButtonReleased() && clickStartPos && latestElemRef.current) {
              const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
              const distance = Phaser.Math.Distance.Between(
                worldPoint.x,
                worldPoint.y,
                clickStartPos.x,
                clickStartPos.y
              );

              if (distance < 5) {
                let snappedX = Math.floor(worldPoint.x / this.gridSize) * this.gridSize;
                let snappedY = Math.floor(worldPoint.y / this.gridSize) * this.gridSize;
                snappedX += latestElemRef.current.width / 2;
                snappedY += latestElemRef.current.height / 2;

                const alreadyPlaced = this.checkOverlap(
                  snappedX,
                  snappedY,
                  latestElemRef.current.depth,
                  latestElemRef.current.width,
                  latestElemRef.current.height
                );

                if (alreadyPlaced) {
                  alert("already placed");
                  isDargSelecting = false;
                  return;
                }

                const image = this.add
                  .image(snappedX, snappedY, latestElemRef.current.name)
                  .setInteractive({ draggable: true })
                  .setDepth(latestElemRef.current.depth)
                  .on("pointerdown", () => {
                    if (!this.deleteSelectedELem) return;
                    const id = image.getData("id");
                    image.destroy();
                    elements.current = elements.current.filter((element) => element.id !== id);
                    localStorage.setItem(`${spaceId}`, JSON.stringify(elements.current));
                  });

                const id = uuidv4();
                image.setData("id", id);
                this.setElem(
                  id,
                  snappedX,
                  snappedY,
                  latestElemRef.current.depth,
                  latestElemRef.current.name,
                  latestElemRef.current.width,
                  latestElemRef.current.height,
                  latestElemRef.current.isStatic,
                  latestElemRef.current.id
                );
                isDargSelecting = false;
              } else {
                isDargSelecting = false;
              }
            }
            setTimeout(() => {
              isDargSelecting = false;
              isDragging = false;
              isDragDeleting = false;
              this.draggingOnOBject = false;
            }, 0);
          });

          this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.draggingOnOBject) return;
            if (isDragging) {
              const dragX = (pointer.x - dragStartX) / this.cameras.main.zoom;
              const dragY = (pointer.y - dragStartY) / this.cameras.main.zoom;

              this.cameras.main.scrollX -= dragX;
              this.cameras.main.scrollY -= dragY;

              dragStartX = pointer.x;
              dragStartY = pointer.y;
            } else if (isDargSelecting && latestElemRef.current) {
              const gridSize = 64;
              const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

              let snappedX = Math.floor(worldPoint.x / gridSize) * gridSize;
              let snappedY = Math.floor(worldPoint.y / gridSize) * gridSize;

              snappedX += latestElemRef.current.width / 2;
              snappedY += latestElemRef.current.height / 2;

              const alreadyPlaced = this.checkOverlap(
                snappedX,
                snappedY,
                latestElemRef.current.depth,
                latestElemRef.current.width,
                latestElemRef.current.height
              );

              if (!alreadyPlaced) {
                const image = this.add
                  .image(snappedX, snappedY, latestElemRef.current.name)
                  .setInteractive({ draggable: true })
                  .setDepth(Number(latestElemRef.current.depth))
                  .on("pointerdown", () => {
                    if (!this.deleteSelectedELem) return;
                    const id = image.getData("id");
                    image.destroy();
                    elements.current = elements.current.filter((element) => element.id !== id);
                    localStorage.setItem(`${spaceId}`, JSON.stringify(elements.current));
                  });

                const id = uuidv4();
                image.setData("id", id);
                this.setElem(
                  id,
                  snappedX,
                  snappedY,
                  latestElemRef.current.depth,
                  latestElemRef.current.name,
                  latestElemRef.current.width,
                  latestElemRef.current.height,
                  latestElemRef.current.isStatic,
                  latestElemRef.current.id
                );
              }
            } else if (isDragDeleting) {
              // how to find out form which element i am moving the pointer and i want to delete it
              const pointerWorldX = pointer.worldX;
              const pointerWorldY = pointer.worldY;

              const objects = this.children.list;
              for (const obj of objects) {
                if (obj instanceof Phaser.GameObjects.Image) {
                  const bounds = obj.getBounds();
                  if (Phaser.Geom.Rectangle.Contains(bounds, pointerWorldX, pointerWorldY)) {
                    const id = obj.getData("id");
                    obj.destroy();
                    elements.current = elements.current.filter((element) => element.id !== id);
                    localStorage.setItem(`${spaceId}`, JSON.stringify(elements.current));
                    break;
                  }
                }
              }
            }
          });
        }

        checkOverlap(
          x: number,
          y: number,
          depth: number,
          width: number,
          height: number,
          id?: string
        ): boolean {
          const currelemXR = x + width / 2;
          const currelemXL = x - width / 2;
          const currelemYT = y + height / 2;
          const currelemYB = y - height / 2;
          if (currelemXL < 0) return true;
          if (currelemXR > this.spacex) return true;
          if (currelemYB < 0) return true;
          if (currelemYT > this.spacey) return true;
          for (const elem of elements.current) {
            if (elem.id === id) continue;
            const elemXR = elem.x + elem.width / 2;
            const elemXL = elem.x - elem.width / 2;
            const elemYT = elem.y + elem.height / 2;
            const elemYB = elem.y - elem.height / 2;
            if (elem.depth === depth) {
              if (
                (currelemXR > elemXL && currelemXR <= elemXR) ||
                (currelemXL >= elemXL && currelemXL < elemXR)
              ) {
                if (
                  (currelemYT > elemYB && currelemYT <= elemYT) ||
                  (currelemYB >= elemYB && currelemYB < elemYT)
                ) {
                  return true;
                }
              }
            }
          }
          return false;
        }

        drawGrid(): void {
          const gridSize = 64;
          const graphics = this.add.graphics();
          graphics.lineStyle(1, 0xaaaaaa, 0.5);

          for (let x = 0; x <= this.spacex; x += gridSize) {
            graphics.beginPath();
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.spacey);
            graphics.strokePath();
          }

          for (let y = 0; y <= this.spacey; y += gridSize) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(this.spacex, y);
            graphics.strokePath();
          }
        }
      }

      if (!gameRef.current) {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: Math.floor(Number(space?.dimensions.split("x")[0]) / 64) * 64,
          height: Math.floor(Number(space?.dimensions.split("x")[1]) / 64) * 64,
          backgroundColor: "#f0f0f0",
          parent: containerRef.current!,
          scene: DragDropScene,
        };
        gameRef.current = new Phaser.Game(config);
      }

      return () => {
        gameRef.current?.destroy(true);
        gameRef.current = null;
      };
    }
  }, [isElementLoaded]);

  useEffect(() => {
    latestElemRef.current = element;
  }, [element]);

  if (loading) {
    return <Loader />;
  }

  return <div ref={containerRef} className="w-[1200px]" />;
};
