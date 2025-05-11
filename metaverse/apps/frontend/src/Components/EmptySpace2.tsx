import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import ws, { wss } from "../Utils/WsClient";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Context/UseAuth";
import { axios } from "../Axios/axios";
import { config } from "../config";
import { useLoader } from "../Context/UseLoader";
import Loader from "./Loader";
import ScheduleMeetingButton from "./ScheduleMeetingButton";

interface SpaceProps {
  id: string;
  dimensions: string;
  name: string;
  elements: SpaceElemProps[];
}

interface SpaceElemProps {
  id: string;
  name: string;
  x: number;
  y: number;
  depth: number;
  height: number;
  width: number;
  isStatic: boolean;
  imageUrl: string;
}

interface otherUserProps {
  id: string;
  userId: string;
  x: number;
  y: number;
}

const EmptySpace2: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { spaceId } = useParams();
  const [isValidSpaceId, setIsValidSpaceId] = useState<string>("");
  const { accessToken } = useAuth();
  const [space, setSpace] = useState<SpaceProps | null>(null);
  const { loading, showLoader, hideLoader } = useLoader();
  const peer = useRef<RTCPeerConnection | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [othersStream, setOtherStreams] = useState<MediaStream[]>([]);
  const [isCanvasInit, setIsCanvasInit] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getSpace = async () => {
      if (accessToken) {
        try {
          showLoader();
          const res = await axios.get(`${config.BackendUrl}/space/${spaceId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const spaceRes: SpaceProps = res.data.spaceRes;

          if (res.status === 200) {
            setSpace(spaceRes);

            const joinedUserRes = await axios.post(
              `${config.BackendUrl}/space/spaceJoined/${res.data.spaceRes.id}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (joinedUserRes.status !== 200) {
              console.error("user joining space failed");
            }
            setIsValidSpaceId("true");
          } else {
            setIsValidSpaceId("false");
            setSpace(null);
          }
          hideLoader();
        } catch (error) {
          setIsValidSpaceId("false");
          hideLoader();
          console.error(error);
        }
      }
    };
    getSpace();
  }, [accessToken]);

  const createPeer = async () => {
    peer.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setMyStream(stream);

    stream.getTracks().forEach((track) => {
      peer.current?.addTrack(track, stream);
    });

    const handleTrackRemoval = (removedTrack: MediaStreamTrack, stream: MediaStream) => {
      if (stream.getTracks().length === 0) {
        setOtherStreams((prev) => prev.filter((s) => s.id !== stream.id));
      }
    };

    peer.current.ontrack = (event) => {
      const incomingStream = event.streams[0];

      if (incomingStream) {
        setOtherStreams((prev) => {
          const isStreamExists = prev.some((stream) => stream.id === incomingStream.id);

          if (!isStreamExists) {
            incomingStream.onremovetrack = (e) => {
              handleTrackRemoval(e.track, incomingStream);
            };
            return [...prev, incomingStream];
          }

          return prev;
        });
      }
    };

    peer.current.onicecandidate = (event) => {
      if (event.candidate) {
        wss.send(
          JSON.stringify({
            type: "ice-candidate",
            payload: {
              candidate: event.candidate,
            },
          })
        );
      }
    };
  };

  useEffect(() => {
    const init2 = async () => {
      await createPeer();
      class MainScene extends Phaser.Scene {
        spacex = Math.floor(Number(space?.dimensions.split("x")[0]) / 64) * 64;
        spacey = Math.floor(Number(space?.dimensions.split("x")[1]) / 64) * 64;
        camera!: Phaser.Cameras.Scene2D.Camera;
        player!: Phaser.Physics.Arcade.Sprite;
        collidableGroup!: Phaser.Physics.Arcade.StaticGroup;
        otherPlayers = new Map<string, Phaser.Physics.Arcade.Sprite>();

        constructor() {
          super("MainScene");
        }

        preload() {
          this.load.atlas(
            "avatar1-front",
            "/assets/avatar1-front.png",
            "/assets/avatar1-front.json"
          );
          this.load.atlas("avatar1-back", "/assets/avatar1-back.png", "/assets/avatar1-back.json");
          this.load.atlas(
            "avatar1-right",
            "/assets/avatar1-right.png",
            "/assets/avatar1-right.json"
          );
          this.load.atlas("avatar1-left", "/assets/avatar1-left.png", "/assets/avatar1-left.json");

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
          this.load.image("grass", "/assets/grass.png");
          this.load.image("wall-horizontal", "/assets/wall-horizontal.png");
          this.load.image("wall-vertical", "/assets/wall-vertical.png");
        }

        async create() {
          setIsCanvasInit(true);
          this.camera = this.cameras.main;
          await this.addElements();

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

          this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) {
              isDragging = true;
              dragStartX = pointer.x;
              dragStartY = pointer.y;
            }
          });

          this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonReleased()) {
              isDragging = false;
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
          });

          ws.send(
            JSON.stringify({
              type: "join",
              payload: {
                spaceId: spaceId,
                token: accessToken,
              },
            })
          );

          wss.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case "user-joined":
                await peer.current?.setRemoteDescription(
                  new RTCSessionDescription(data.payload.sdp)
                );
                wss.send(
                  JSON.stringify({
                    type: "check-nearby-user",
                  })
                );
                break;
              case "renegotiate": {
                await peer.current?.setRemoteDescription(
                  new RTCSessionDescription(data.payload.sdp)
                );
                const answer = await peer.current?.createAnswer();
                await peer.current?.setLocalDescription(answer);
                wss.send(
                  JSON.stringify({
                    type: "renegotiateAnswer",
                    payload: {
                      sdp: answer,
                    },
                  })
                );
                break;
              }
              case "ice-candidate":
                if (data.payload.candidate) {
                  await peer.current?.addIceCandidate(data.payload.candidate);
                }
                break;
              case "user-left":
                if (data.payload.userStreamId) {
                  setOtherStreams((prev) =>
                    prev.filter((stream) => stream.id !== data.payload.userStreamId)
                  );
                }
                break;
              default:
                console.error("wrong message type", data.type);
                break;
            }
          };

          ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case "space-joined": {
                const offer = await peer.current?.createOffer();
                await peer.current?.setLocalDescription(offer);
                const { x, y } = this.findNearestFreeGridSpot(
                  data.payload.spawn.x,
                  data.payload.spawn.y
                );
                // const x = data.payload.spawn.x;
                // const y = data.payload.spawn.y;
                this.addMe(x, y, data.payload.users);
                wss.send(
                  JSON.stringify({
                    type: "join",
                    payload: {
                      token: accessToken,
                      spaceId: spaceId,
                      x,
                      y,
                      sdp: offer,
                    },
                  })
                );
                break;
              }
              case "user-joined":
                this.addOtherPlayer(data.payload.userId, data.payload.x, data.payload.y);
                break;
              case "move":
                this.updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y);
                break;
              case "movement-rejected":
                this.updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y);
                break;
              case "user-left":
                this.removeOtherPlayer(data.payload.userId);
                break;
              case "move-success":
                wss.send(
                  JSON.stringify({
                    type: "move",
                    payload: {
                      x: data.payload.x,
                      y: data.payload.y,
                    },
                  })
                );
                break;
              default:
                console.error("wrong message type");
                break;
            }
          };

          this.updateMove();
        }

        addAnimation(
          key: string,
          name: string,
          prefix: string,
          suffix: string,
          start: number,
          end: number
        ) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNames(name, {
              prefix,
              start,
              end,
              suffix,
              zeroPad: 0,
            }),
            frameRate: 10,
            repeat: -1,
          });
        }

        async addElements() {
          if (space && space.elements && space.elements.length > 0) {
            this.collidableGroup = this.physics.add.staticGroup();
            space?.elements.map((elem) => {
              if (elem.isStatic) {
                this.collidableGroup.create(elem.x, elem.y, elem.name).setDepth(elem.depth);
              } else {
                this.add.image(elem.x, elem.y, elem.name).setDepth(elem.depth);
              }
            });
          } else {
            console.log("no space elements found");
          }
          return;
        }

        findNearestFreeGridSpot(startX: number, startY: number): { x: number; y: number } {
          const step = 64; // grid size
          const maxRadius = 10; // how far out to search (in grid units)

          for (let radius = 0; radius <= maxRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
              for (let dy = -radius; dy <= radius; dy++) {
                // Only check border cells of the square ring
                if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

                const testX = startX + dx * step;
                const testY = startY + dy * step;

                const tempRect = new Phaser.Geom.Rectangle(testX, testY, 31, 31);

                let colliding = false;
                this.collidableGroup.getChildren().forEach((child) => {
                  const body = (child as Phaser.Physics.Arcade.Sprite)
                    .body as Phaser.Physics.Arcade.StaticBody;
                  if (body) {
                    const objectRect = new Phaser.Geom.Rectangle(
                      body.x,
                      body.y,
                      body.width - 1,
                      body.height - 1
                    );
                    if (Phaser.Geom.Intersects.RectangleToRectangle(tempRect, objectRect)) {
                      colliding = true;
                    }
                  }
                });

                if (!colliding) {
                  return { x: testX, y: testY };
                }
              }
            }
          }

          // Fallback: original point
          return { x: startX, y: startY };
        }

        addMe(x: number, y: number, users: otherUserProps[]) {
          this.player = this.physics.add
            .sprite(x, y, "avatar1-front")
            .setSize(64, 64)
            .setOrigin(0.5)
            .setCollideWorldBounds(true);
          this.player.x = x;
          this.player.y = y;

          this.cameras.main.startFollow(this.player);

          if (this.collidableGroup) {
            this.physics.add.collider(this.player, this.collidableGroup);
          }

          const shadow = this.add.ellipse(x, y + 32, 40, 15, 0x000000, 0.3);
          this.tweens.add({
            targets: shadow,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
          });

          this.events.on("update", () => {
            shadow.setPosition(this.player.x, this.player.y + 32);
          });

          this.addAnimation(
            "front-walk",
            "avatar1-front",
            "Sprite-0005-enlarge #Tag ",
            ".aseprite",
            0,
            5
          );
          this.addAnimation(
            "back-walk",
            "avatar1-back",
            "Sprite-0008-back-side #Tag ",
            ".aseprite",
            0,
            5
          );
          this.addAnimation(
            "left-walk",
            "avatar1-left",
            "Sprite-0007-left-side #Tag ",
            ".aseprite",
            0,
            4
          );
          this.addAnimation(
            "right-walk",
            "avatar1-right",
            "Sprite-0006-right-side #Tag ",
            ".aseprite",
            0,
            4
          );

          if (users && users.length) {
            users.map((user) => {
              this.addOtherPlayer(user.userId, user.x, user.y);
            });
          }

          return true;
        }

        setMovementforPlayer(player: Phaser.Physics.Arcade.Sprite, direction: string) {
          if (player.anims.isPlaying) {
            return;
          }
          switch (direction) {
            case "left":
              player.play("left-walk", true);
              player.setFrame("Sprite-0007-left-side #Tag 1.aseprite");
              break;
            case "right":
              player.play("right-walk", true);
              player.setFrame("Sprite-0006-right-side #Tag 1.aseprite");
              break;
            case "up":
              player.play("back-walk", true);
              player.setFrame("Sprite-0008-back-side #Tag 1.aseprite");
              break;
            case "down":
              player.play("front-walk", true);
              player.setFrame("Sprite-0005-enlarge #Tag 1.aseprite");
              break;
            default:
              console.log("wrong direction");
              break;
          }
        }

        getDirection(key: string) {
          const stepSize = 64;
          switch (key) {
            case "ArrowLeft":
              return { x: -stepSize, y: 0, direction: "left" };
            case "ArrowRight":
              return { x: stepSize, y: 0, direction: "right" };
            case "ArrowUp":
              return { x: 0, y: -stepSize, direction: "up" };
            case "ArrowDown":
              return { x: 0, y: stepSize, direction: "down" };
            default:
              return null;
          }
        }

        movePlayer(
          direction: { x: number; y: number; direction: string },
          targetX: number,
          targetY: number
        ) {
          targetX += direction.x;
          targetY += direction.y;
          const tempRect = new Phaser.Geom.Rectangle(targetX, targetY, 31, 31);
          let canMove = true;

          this.collidableGroup.getChildren().forEach((child) => {
            const body = (child as Phaser.Physics.Arcade.Sprite)
              .body as Phaser.Physics.Arcade.StaticBody;
            if (body) {
              const objectRect = new Phaser.Geom.Rectangle(
                body.x,
                body.y,
                body.width - 1,
                body.height - 1
              );
              if (Phaser.Geom.Intersects.RectangleToRectangle(tempRect, objectRect)) {
                canMove = false;
              }
            }
          });

          if (!canMove) {
            console.log("Blocked by static object");
            return false;
          }

          this.setMovementforPlayer(this.player, direction.direction);

          targetX = Math.round(targetX / 64) * 64;
          targetY = Math.round(targetY / 64) * 64;
          this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 150,
            onComplete: () => {},
          });

          ws.send(
            JSON.stringify({
              type: "move",
              payload: {
                x: targetX,
                y: targetY,
              },
            })
          );
          return true;
        }

        updateMove() {
          let moving = false;
          let moveInterval: NodeJS.Timeout | null = null;
          let direction: { x: number; y: number; direction: string } | null = null;

          this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            if (moving) return;

            direction = this.getDirection(event.key);
            if (!direction) return;

            if (!this.movePlayer(direction, this.player.x, this.player.y)) return;

            moving = true;
            moveInterval = setInterval(() => {
              if (!this.movePlayer(direction!, this.player.x, this.player.y)) {
                clearInterval(moveInterval!);
                moveInterval = null;
                moving = false;
              }
            }, 150);
          });

          this.input.keyboard?.on("keyup", () => {
            moving = false;
            if (moveInterval) {
              clearInterval(moveInterval);
              moveInterval = null;
            }
            if (this.player) {
              this.player.stop();
              this.player.setFrame(0);
            }
          });
        }

        addOtherPlayer(id: string, x: number, y: number) {
          const otherPlayer = this.physics.add
            .sprite(x, y, "avatar1-front")
            .setSize(64, 64)
            .setOrigin(0.5)
            .setCollideWorldBounds(true)
            .setImmovable(true);

          // Add name tag above player
          const nameTag = this.add
            .text(x, y - 40, `User-${id.substring(0, 4)}`, {
              fontFamily: "Arial",
              fontSize: "14px",
              color: "#000000",
              backgroundColor: "#ffffff",
              padding: { x: 5, y: 2 },
            })
            .setOrigin(0.5);

          // Create shadow under other players too
          const shadow = this.add.ellipse(x, y + 32, 40, 15, 0x000000, 0.3);

          // Update nameTag and shadow positions when player moves
          this.events.on("update", () => {
            if (this.otherPlayers.has(id)) {
              const op = this.otherPlayers.get(id);
              if (op) {
                nameTag.setPosition(op.x, op.y - 40);
                shadow.setPosition(op.x, op.y + 32);
              }
            }
          });

          this.otherPlayers.set(id, otherPlayer);
          this.collidableGroup.add(otherPlayer);
        }

        findOtherPlayerDirection(prevx: number, prevy: number, x: number, y: number) {
          if (x > prevx) {
            return "right";
          } else if (x < prevx) {
            return "left";
          } else if (y > prevy) {
            return "down";
          } else if (y < prevy) {
            return "up";
          }
          return null;
        }

        updatePlayerPosition(id: string, x: number, y: number) {
          if (this.otherPlayers.has(id)) {
            const otherPlayer = this.otherPlayers.get(id) as Phaser.Physics.Arcade.Sprite;
            const direction = this.findOtherPlayerDirection(otherPlayer.x, otherPlayer.y, x, y);
            if (direction) {
              this.setMovementforPlayer(otherPlayer, direction!);
            }

            this.tweens.add({
              targets: otherPlayer,
              x: x,
              y: y,
              duration: 200,
              onComplete: () => {
                otherPlayer.stop();
              },
            });
          }
        }

        removeOtherPlayer(id: string) {
          if (this.otherPlayers.has(id)) {
            this.otherPlayers.get(id)?.destroy();
            this.otherPlayers.delete(id);
          }
        }
      }

      if (!gameRef.current) {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: Math.floor((Number(space?.dimensions.split("x")[0]) / 64) * 64),
          height: Math.floor((Number(space?.dimensions.split("x")[1]) / 64) * 64),
          parent: containerRef.current || undefined,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { y: 0, x: 0 },
              debug: false,
            },
          },
          backgroundColor: "#f5f5f5",
          scene: MainScene,
        };
        gameRef.current = new Phaser.Game(config);
      }

      return () => {
        gameRef.current?.destroy(true);
        gameRef.current = null;
      };
    };

    if (!isCanvasInit && accessToken && isValidSpaceId && space) {
      init2();
    }
  }, [accessToken, isValidSpaceId, showLoader, space, spaceId, isCanvasInit]);

  const handleEdit = async () => {
    navigate(`/app/space/${spaceId}/edit`);
  };

  if (loading) {
    return <Loader />;
  }

  if (isValidSpaceId === "false") {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <h1 className="text-5xl font-bold">Space doesn't Exist</h1>
      </div>
    );
  }

  if (isValidSpaceId === "true") {
    return (
      <div className="h-screen w-screen flex flex-col bg-gray-400">
        {/* header */}
        <header className="h-16 w-full border-b-2 border-black bg-blue-600 text-white flex items-center px-4 justify-between">
          <h2 className="text-xl font-bold">{space?.name || "Office Space"}</h2>
          <button
            onClick={handleEdit}
            className="bg-blue-500 rounded-2xl border-2 border-black w-28 font-bold"
          >
            Edit
          </button>
        </header>

        {/* Game container */}
        <div
          ref={containerRef}
          className="flex w-full relative overflow-hidden justify-center items-center"
        ></div>

        {/* Video streams container */}
        {othersStream && othersStream.length > 0 && (
          <div className="absolute top-12 w-full px-4 flex flex-wrap justify-center">
            {myStream && (
              <video
                className="w-80 h-56 rounded-md m-2 border-2 border-blue-400"
                ref={(video) => {
                  if (video && !video.srcObject && myStream) {
                    video.srcObject = myStream;
                    video.muted = true;
                    video.play().catch((err) => console.error("Error playing video:", err));
                  }
                }}
                autoPlay
                playsInline
              />
            )}

            {othersStream.map((stream) => (
              <video
                key={stream.id}
                className="w-80 h-56 rounded-md m-2 border-2 border-green-400"
                ref={(video) => {
                  if (video && !video.srcObject) {
                    video.srcObject = stream;
                    video.play().catch((err) => console.error("Error playing video:", err));
                  }
                }}
                autoPlay
                playsInline
              />
            ))}
          </div>
        )}

        {/* Controls panel */}
        <div className="h-24 w-full bg-gray-500 border-t-2 border-gray-600 flex items-center justify-center gap-4 px-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => {
              // Toggle microphone or camera
              if (myStream) {
                const videoTracks = myStream.getVideoTracks();
                if (videoTracks.length > 0) {
                  videoTracks[0].enabled = !videoTracks[0].enabled;
                }
              }
            }}
          >
            <span>Camera</span>
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => {
              // Leave meeting
              if (myStream) {
                myStream.getTracks().forEach((track) => track.stop());
              }
              window.location.href = "/spaces";
            }}
          >
            <span>Leave</span>
          </button>
          <ScheduleMeetingButton />
          <div className="ml-auto text-sm text-gray-600">
            <span>Use arrow keys to move</span>
          </div>
        </div>
      </div>
    );
  }

  return <Loader />;
};

export default EmptySpace2;
