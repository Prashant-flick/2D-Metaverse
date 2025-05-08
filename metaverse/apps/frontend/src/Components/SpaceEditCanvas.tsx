import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { elemProps } from "./SpaceEditingPage";
import { v4 as uuidv4 } from "uuid";

interface GameComponentProps {
  element: elemProps | null;
}

interface canvasELementProps {
  type: string | undefined;
  x: number;
  y: number;
  depth: number | undefined;
  id: string;
}

export const SpaceEditCanvas: React.FC<GameComponentProps> = ({ element }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elements = useRef<canvasELementProps[]>([]);
  const latestElemRef = useRef<elemProps | null>(null);

  useEffect(() => {
    elements.current = JSON.parse(localStorage.getItem("elements") || "[]");
    class DragDropScene extends Phaser.Scene {
      spacex = Math.floor(1600 / 64) * 64;
      spacey = Math.floor(1200 / 64) * 64;
      camera!: Phaser.Cameras.Scene2D.Camera;

      constructor() {
        super("DragDropScene");
      }

      public deleteSelectedELem = false;

      addAllElements() {
        elements.current.map((elem) => {
          const image = this.add
            .image(elem.x, elem.y, elem.type!)
            .setInteractive({ draggable: true })
            .setDepth(elem.depth!)
            .on("pointerdown", () => {
              if (!this.deleteSelectedELem) return;
              const id = image.getData("id");
              image.destroy();
              elements.current = elements.current.filter((element) => element.id !== id);
              localStorage.setItem("elements", JSON.stringify(elements.current));
            });

          image.setData("id", elem.id);
        });
      }

      setElem(id: string, x: number, y: number, depth?: number, type?: string) {
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
            depth,
            type,
          });
        }
        localStorage.setItem("elements", JSON.stringify(elements.current));
      }

      preload() {
        this.load.atlas("avatar1-left", "/assets/avatar1-left.png", "/assets/avatar1-left.json");
        this.load.image("floor-tile", "/assets/floor-tile.png");
        this.load.image("table", "/assets/table.png");
        this.load.image("chair", "/assets/chair.png");
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
        this.load.image("wall", "/assets/wall.png");
        this.load.image("grass", "/assets/grass.png");
        this.load.image("wall-left", "/assets/wall-left.png");
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
          localStorage.removeItem("elements");
          this.children.removeAll(true);
        });

        window.addEventListener("drop-on-canvas", ((event: Event) => {
          if (this.deleteSelectedELem) {
            alert("in deleting mode");
            return;
          }
          const e = event as CustomEvent<{
            type: string;
            x: number;
            y: number;
            depth: string;
          }>;
          const { type, x, y, depth } = e.detail;
          const worldPoint = this.cameras.main.getWorldPoint(x, y);
          const gridSize = 64;
          const tempImgae = this.add.image(0, 0, type).setVisible(false);
          const width = tempImgae.width;
          const height = tempImgae.height;
          tempImgae.destroy();

          let snappedX = Math.floor(worldPoint.x / gridSize) * gridSize;
          let snappedY = Math.floor(worldPoint.y / gridSize) * gridSize;

          if ((width / gridSize) % 2 === 1) snappedX += gridSize / 2;
          if ((height / gridSize) % 2 === 1) snappedY += gridSize / 2;

          const image = this.add
            .image(snappedX, snappedY, type)
            .setInteractive({ draggable: true })
            .setDepth(Number(depth))
            .on("pointerdown", () => {
              if (!this.deleteSelectedELem) return;
              const id = image.getData("id");
              image.destroy();
              elements.current = elements.current.filter((element) => element.id !== id);
              localStorage.setItem("elements", JSON.stringify(elements.current));
            });

          const id = uuidv4();
          image.setData("id", id);
          this.setElem(id, snappedX, snappedY, Number(depth), type);
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
              const width = gameObject.displayWidth;
              const height = gameObject.displayHeight;
              let snappedX;
              let snappedY;
              const gridSize = 64;

              if ((width / 64) % 2 === 1) {
                snappedX = Math.floor(dragX / gridSize) * gridSize + gridSize / 2;
              } else {
                snappedX = Math.floor(dragX / gridSize) * gridSize + gridSize / 2;
                snappedX += 32;
              }
              if ((height / 64) % 2 === 1) {
                snappedY = Math.floor(dragY / gridSize) * gridSize + gridSize / 2;
              } else {
                snappedY = Math.floor(dragY / gridSize) * gridSize + gridSize / 2;
                snappedY += 32;
              }

              gameObject.setPosition(snappedX, snappedY);
              const id = gameObject.getData("id");

              this.setElem(id, snappedX, snappedY);
            }
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
              const gridSize = 64;

              let snappedX = Math.floor(worldPoint.x / gridSize) * gridSize;
              let snappedY = Math.floor(worldPoint.y / gridSize) * gridSize;

              const tempImage = this.add.image(0, 0, latestElemRef.current.type).setVisible(false);
              const width = tempImage.width;
              const height = tempImage.height;
              tempImage.destroy();

              if ((width / gridSize) % 2 === 1) snappedX += gridSize / 2;
              if ((height / gridSize) % 2 === 1) snappedY += gridSize / 2;

              const image = this.add
                .image(snappedX, snappedY, latestElemRef.current.type)
                .setInteractive({ draggable: true })
                .setDepth(latestElemRef.current.depth)
                .on("pointerdown", () => {
                  if (!this.deleteSelectedELem) return;
                  const id = image.getData("id");
                  image.destroy();
                  elements.current = elements.current.filter((element) => element.id !== id);
                  localStorage.setItem("elements", JSON.stringify(elements.current));
                });

              const id = uuidv4();
              image.setData("id", id);
              this.setElem(
                id,
                snappedX,
                snappedY,
                latestElemRef.current.depth,
                latestElemRef.current.type
              );
              isDargSelecting = false;
            } else {
              isDargSelecting = false;
            }
          }
        });

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
          if (isDragging) {
            const dragX = (pointer.x - dragStartX) / this.cameras.main.zoom;
            const dragY = (pointer.y - dragStartY) / this.cameras.main.zoom;

            this.cameras.main.scrollX -= dragX;
            this.cameras.main.scrollY -= dragY;

            dragStartX = pointer.x;
            dragStartY = pointer.y;
          }

          if (isDargSelecting && latestElemRef.current) {
            // all the grid that pointer passess through will set the element
            const gridSize = 64;
            const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

            let snappedX = Math.floor(worldPoint.x / gridSize) * gridSize;
            let snappedY = Math.floor(worldPoint.y / gridSize) * gridSize;

            const tempImg = this.add.image(0, 0, latestElemRef.current.type).setVisible(false);
            const width = tempImg.width;
            const height = tempImg.height;
            tempImg.destroy();

            if ((width / gridSize) % 2 === 1) snappedX += gridSize / 2;
            if ((height / gridSize) % 2 === 1) snappedY += gridSize / 2;

            const alreadyPlaced = elements.current.some(
              (elem) =>
                elem.x === snappedX &&
                elem.y === snappedY &&
                elem.type === latestElemRef.current?.type
            );

            if (!alreadyPlaced) {
              const image = this.add
                .image(snappedX, snappedY, latestElemRef.current.type)
                .setInteractive({ draggable: true })
                .setDepth(Number(latestElemRef.current.depth))
                .on("pointerdown", () => {
                  if (!this.deleteSelectedELem) return;
                  const id = image.getData("id");
                  image.destroy();
                  elements.current = elements.current.filter((element) => element.id !== id);
                  localStorage.setItem("elements", JSON.stringify(elements.current));
                });

              const id = uuidv4();
              image.setData("id", id);
              this.setElem(
                id,
                snappedX,
                snappedY,
                latestElemRef.current.depth,
                latestElemRef.current.type
              );
            }
          }

          if (isDragDeleting) {
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
                  localStorage.setItem("elements", JSON.stringify(elements.current));
                  break;
                }
              }
            }
          }
        });
      }

      drawGrid(): void {
        const gridSize = 64;
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xaaaaaa, 0.3);

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
        width: Math.floor(1600 / 64) * 64,
        height: Math.floor(1200 / 64) * 64,
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
  }, []);

  useEffect(() => {
    latestElemRef.current = element;
  }, [element]);

  return <div ref={containerRef} className="w-[1200px]" />;
};
