import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import ws, { wss } from "../Utils/WsClient";
import { useParams } from "react-router-dom";
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
  spaceElements: {
    id: string;
    x: number;
    y: number;
    elementId: string;
  }[];
}

interface otherUserProps {
  id: string;
  userId: string;
  x: number;
  y: number;
}

const EmptySpace: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const { spaceId } = useParams();
  const [isValidSpaceId, setIsValidSpaceId] = useState<string>("");
  const { accessToken } = useAuth();
  const [space, setSpace] = useState<SpaceProps | null>(null);
  const { loading, showLoader, hideLoader } = useLoader();
  const peer = useRef<RTCPeerConnection | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [othersStream, setOtherStreams] = useState<MediaStream[]>([]);

  console.log("spaceId", spaceId);

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

          console.log(res);

          if (res.status === 200) {
            setIsValidSpaceId("true");
            setSpace(res.data.spaceRes);
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
  }, [accessToken, spaceId, showLoader, hideLoader]);

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
    const init = async () => {
      if (isValidSpaceId) {
        const spacex: number =
          Math.floor(Number(Number(space?.dimensions?.split("x")[0]) / 64)) * 64;
        const spacey: number =
          Math.floor(Number(Number(space?.dimensions?.split("x")[1]) / 64)) * 64;

        await createPeer();

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: spacex,
          height: spacey,
          parent: gameRef.current || undefined,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { y: 0, x: 0 },
              debug: false,
            },
          },
          backgroundColor: "#f5f5f5",
          scene: {
            preload,
            create,
          },
        };

        const game = new Phaser.Game(config);

        let player: Phaser.Physics.Arcade.Sprite;
        const otherPlayers = new Map<string, Phaser.Physics.Arcade.Sprite>();
        let furniture: Phaser.Physics.Arcade.StaticGroup;

        // Asset frame indices in the spritesheet
        const ASSET_FRAMES = {
          FLOOR_TILE: 0,
          TABLE: 1,
          CHAIR: 2,
          DESK: 3,
          PLANT: 4,
          BOOKSHELF: 5,
          WHITEBOARD: 6,
          COFFEEMACHINE: 7,
          LAMP: 8,
          CARPET: 9,
        };

        function preload(this: Phaser.Scene) {
          // Player avatars
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

        function createFloor(scene: Phaser.Scene) {
          scene.add
            .tileSprite(0, 0, spacex, spacey, "floor-tile", ASSET_FRAMES.FLOOR_TILE)
            .setOrigin(0, 0)
            .setDepth(-1);

          scene.add
            .image(spacex / 2, spacey / 2, "carpet")
            .setScale(1.2)
            .setDepth(-0.5)
            .setAlpha(0.8);
        }

        function createFurniture(scene: Phaser.Scene) {
          furniture = scene.physics.add.staticGroup();

          const centerTable = furniture
            .create(spacex / 2, spacey / 2, "table")
            .setScale(0.8)
            .refreshBody();

          const chairPositions = [
            { x: centerTable.x - 80, y: centerTable.y, name: "chair-right" },
            { x: centerTable.x + 80, y: centerTable.y, name: "chair-left" },
            { x: centerTable.x, y: centerTable.y - 80, name: "chair-front" },
            { x: centerTable.x, y: centerTable.y + 80, name: "chair-back" },
          ];

          chairPositions.forEach((pos) => {
            furniture.create(pos.x, pos.y, pos.name).setScale(0.9).refreshBody();
          });

          const deskPositions = [
            { x: 128, y: 128 },
            { x: spacex - 128, y: 128 },
            { x: 128, y: spacey - 128 },
            { x: spacex - 128, y: spacey - 128 },
          ];

          deskPositions.forEach((pos) => {
            furniture.create(pos.x, pos.y, "desk").setScale(0.8).refreshBody();
          });

          const plantPositions = [
            { x: 64, y: 64 },
            { x: spacex - 64, y: 64 },
            { x: 64, y: spacey - 64 },
            { x: spacex - 64, y: spacey - 64 },
          ];

          plantPositions.forEach((pos) => {
            furniture.create(pos.x, pos.y, "plant").setScale(0.7).refreshBody();
          });

          furniture
            .create(spacex / 4, 64, "bookshelf")
            .setScale(0.8)
            .refreshBody();
          furniture
            .create((3 * spacex) / 4, 64, "bookshelf")
            .setScale(0.8)
            .refreshBody();

          furniture
            .create(spacex / 2, 64, "whiteboard")
            .setScale(0.8)
            .refreshBody();

          furniture
            .create(spacex - 100, spacey / 2, "coffeemachine")
            .setScale(0.7)
            .refreshBody();

          const lampPositions = [
            { x: spacex / 4, y: spacey / 4 },
            { x: (3 * spacex) / 4, y: spacey / 4 },
            { x: spacex / 4, y: (3 * spacey) / 4 },
            { x: (3 * spacex) / 4, y: (3 * spacey) / 4 },
          ];

          lampPositions.forEach((pos) => {
            scene.add.image(pos.x, pos.y, "lamp").setScale(0.6);

            const lightCircle = scene.add.circle(pos.x, pos.y, 100, 0xffffcc, 0.2);
            scene.tweens.add({
              targets: lightCircle,
              alpha: 0.1,
              duration: 1500,
              yoyo: true,
              repeat: -1,
            });
          });

          if (space && space.spaceElements && space.spaceElements.length) {
            space.spaceElements.forEach((spaceElem) => {
              furniture.create(spaceElem.x, spaceElem.y, "table").setScale(0.8).refreshBody();
            });
          }
        }

        function drawGrid(scene: Phaser.Scene) {
          const gridSize = 64;
          const graphics = scene.add.graphics();
          graphics.lineStyle(0.5, 0xaaaaaa, 0.05);

          for (let x = 0; x <= spacex; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, spacey);
          }

          for (let y = 0; y <= spacey; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(spacex, y);
          }

          graphics.strokePath();
        }

        async function create(this: Phaser.Scene) {
          createFloor(this);
          drawGrid(this);
          createFurniture(this);

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
                wss.send(
                  JSON.stringify({
                    type: "join",
                    payload: {
                      token: accessToken,
                      spaceId: spaceId,
                      x: data.payload.spawn.x,
                      y: data.payload.spawn.y,
                      sdp: offer,
                    },
                  })
                );
                addMe(this, data.payload.spawn.x, data.payload.spawn.y, data.payload.users);
                break;
              }
              case "user-joined":
                addOtherPlayer(data.payload.userId, data.payload.x, data.payload.y, this);
                break;
              case "move":
                updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y, this);
                break;
              case "movement-rejected":
                updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y, this);
                break;
              case "user-left":
                removeOtherPlayer(data.payload.userId);
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

          updateMove(this);
        }

        function addAnimation(
          scene: Phaser.Scene,
          key: string,
          name: string,
          prefix: string,
          suffix: string,
          start: number,
          end: number
        ) {
          scene.anims.create({
            key,
            frames: scene.anims.generateFrameNames(name, {
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

        function addMe(scene: Phaser.Scene, x: number, y: number, users: otherUserProps[]) {
          player = scene.physics.add
            .sprite(x, y, "avatar1-front")
            .setSize(64, 64)
            .setOrigin(0.5)
            .setCollideWorldBounds(true);
          player.x = x;
          player.y = y;

          // Add shadow beneath player
          const shadow = scene.add.ellipse(x, y + 32, 40, 15, 0x000000, 0.3);
          scene.tweens.add({
            targets: shadow,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
          });

          // Ensure shadow follows player
          scene.events.on("update", () => {
            shadow.setPosition(player.x, player.y + 32);
          });

          addAnimation(
            scene,
            "front-walk",
            "avatar1-front",
            "Sprite-0005-enlarge #Tag ",
            ".aseprite",
            0,
            5
          );
          addAnimation(
            scene,
            "back-walk",
            "avatar1-back",
            "Sprite-0008-back-side #Tag ",
            ".aseprite",
            0,
            5
          );
          addAnimation(
            scene,
            "left-walk",
            "avatar1-left",
            "Sprite-0007-left-side #Tag ",
            ".aseprite",
            0,
            4
          );
          addAnimation(
            scene,
            "right-walk",
            "avatar1-right",
            "Sprite-0006-right-side #Tag ",
            ".aseprite",
            0,
            4
          );

          scene.cameras.main.startFollow(player);

          // Add collision with furniture
          scene.physics.add.collider(player, furniture);

          if (users && users.length) {
            users.map((user) => {
              addOtherPlayer(user.userId, user.x, user.y, scene);
            });
          }
        }

        function setMovementforPlayer(player: Phaser.Physics.Arcade.Sprite, direction: string) {
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

        function updateMove(scene: Phaser.Scene) {
          const stepSize = 64;
          let moving = false;
          let moveInterval: NodeJS.Timeout | null = null;
          let targetX = 0;
          let targetY = 0;

          scene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            if (moving) return;

            targetX = player.x;
            targetY = player.y;

            const direction = getDirection(event.key);

            if (direction) {
              if (!movePlayer(direction)) return;
              moving = true;
              moveInterval = setInterval(() => {
                if (!movePlayer(direction)) {
                  clearInterval(moveInterval!);
                  moveInterval = null;
                }
              }, 100);
            }
          });

          scene.input.keyboard?.on("keyup", () => {
            moving = false;
            if (moveInterval) {
              clearInterval(moveInterval);
              moveInterval = null;
            }
            if (player) {
              player.stop();
              player.setFrame(0);
            }
          });

          function getDirection(key: string) {
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

          function movePlayer(direction: { x: number; y: number; direction: string }) {
            targetX += direction.x;
            targetY += direction.y;

            let isCollision: boolean = false;
            otherPlayers.forEach((otherPlayer) => {
              if (otherPlayer.x === targetX && otherPlayer.y === targetY) {
                isCollision = true;
              }
            });

            let furnitureCollision = false;
            furniture.children.iterate((child: any) => {
              if (
                child.body &&
                Math.abs(child.x - targetX) < 32 &&
                Math.abs(child.y - targetY) < 32
              ) {
                furnitureCollision = true;
                return false;
              }
              return true;
            });

            if (isCollision || furnitureCollision) return false;

            setMovementforPlayer(player, direction.direction);

            ws.send(
              JSON.stringify({
                type: "move",
                payload: {
                  x: targetX,
                  y: targetY,
                },
              })
            );

            scene.tweens.add({
              targets: player,
              x: targetX,
              y: targetY,
              duration: 100,
              onComplete: () => {},
            });

            return true;
          }
        }

        function addOtherPlayer(id: string, x: number, y: number, scene: Phaser.Scene) {
          const otherPlayer = scene.physics.add
            .sprite(x, y, "avatar1-front")
            .setSize(64, 64)
            .setOrigin(0.5)
            .setCollideWorldBounds(true)
            .setImmovable(true);

          // Add name tag above player
          const nameTag = scene.add
            .text(x, y - 40, `User-${id.substring(0, 4)}`, {
              fontFamily: "Arial",
              fontSize: "14px",
              color: "#000000",
              backgroundColor: "#ffffff",
              padding: { x: 5, y: 2 },
            })
            .setOrigin(0.5);

          // Create shadow under other players too
          const shadow = scene.add.ellipse(x, y + 32, 40, 15, 0x000000, 0.3);

          // Update nameTag and shadow positions when player moves
          scene.events.on("update", () => {
            if (otherPlayers.has(id)) {
              const op = otherPlayers.get(id);
              if (op) {
                nameTag.setPosition(op.x, op.y - 40);
                shadow.setPosition(op.x, op.y + 32);
              }
            }
          });

          otherPlayers.set(id, otherPlayer);

          // Add collision with furniture
          scene.physics.add.collider(otherPlayer, furniture);
        }

        function findOtherPlayerDirection(prevx: number, prevy: number, x: number, y: number) {
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

        function updatePlayerPosition(id: string, x: number, y: number, scene: Phaser.Scene) {
          if (otherPlayers.has(id)) {
            const otherPlayer = otherPlayers.get(id) as Phaser.Physics.Arcade.Sprite;
            const direction = findOtherPlayerDirection(otherPlayer.x, otherPlayer.y, x, y);
            if (direction) {
              setMovementforPlayer(otherPlayer, direction!);
            }

            scene.tweens.add({
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

        function removeOtherPlayer(id: string) {
          if (otherPlayers.has(id)) {
            otherPlayers.get(id)?.destroy();
            otherPlayers.delete(id);
          }
        }

        return () => {
          game.destroy(true);
        };
      }
    };
    init();
  }, [isValidSpaceId]);

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
        <header className="h-16 w-full border-b-2 border-black bg-blue-600 text-white flex items-center px-4">
          <h2 className="text-xl font-bold">{space?.name || "Office Space"}</h2>
        </header>

        {/* Game container */}
        <div
          ref={gameRef}
          className="flex w-full relative overflow-hidden justify-center items-center"
        ></div>

        {/* Video streams container */}
        {othersStream && othersStream.length > 0 && (
          <div className="absolute top-12 w-full px-4 flex flex-wrap justify-center">
            {myStream && (
              <video
                className="w-32 h-24 rounded-md m-2 border-2 border-blue-400"
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
                className="w-32 h-24 rounded-md m-2 border-2 border-green-400"
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

export default EmptySpace;
