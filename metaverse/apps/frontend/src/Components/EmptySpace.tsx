import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import ws,{wss} from '../Utils/WsClient';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Context/UseAuth';
import { axios } from '../Axios/axios';
import { config } from '../config';
import { useLoader } from '../Context/UseLoader';
import Loader from './Loader';

interface spaceProps{
  id: string,
  dimensions: string,
  name: string,
  spaceElements: {
    id: string;
    x: integer,
    y: integer,
    elemendId: string
  }[]
}

interface otherUserProps{
  id: string,
  userId: string,
  x: number,
  y: number
}

const EmptySpace: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const { spaceId } = useParams();
  const [isValidSpaceId, setIsValidSpaceId] = useState<string>('')
  const { accessToken } = useAuth();
  const [space, setSpace] = useState<spaceProps|null>(null);
  const { loading, showLoader, hideLoader }  = useLoader();
  const peer = useRef<RTCPeerConnection>(null);
  const [myStream, setMyStream] = useState<MediaStream|null>(null);
  const [othersStream, setOtherStreams] = useState<MediaStream[]|[]>([]);
 
  useEffect(() => {
    const getSpace = async() => {
      if (accessToken) {
        try {
          showLoader();
          const res = await axios.get(`${config.BackendUrl}/space/${spaceId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
  
          if (res.status === 200) {
            setIsValidSpaceId('true');
            setSpace(res.data);
          } else {
            setIsValidSpaceId('false');
            setSpace(null)
          }
          hideLoader();
        } catch (error) {
          setIsValidSpaceId('false');
          hideLoader();
          console.error(error);
        }
      }
    }
    getSpace();
  }, [accessToken])

  const createPeer = async() => {
    peer.current = new RTCPeerConnection({
      iceServers: [{
        urls: "stun:stun.l.google.com:19302",
      }]
    })

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    })
    setMyStream(stream);

    stream.getTracks().forEach(track => {
      peer.current?.addTrack(track, stream);
    })

    const handleTrackRemoval = (removedTrack: MediaStreamTrack, stream: MediaStream) => {
      console.log(`Track removed: ${removedTrack.kind}`);
    
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
        wss.send(JSON.stringify({
          type: 'ice-candidate',
          payload: {
            candidate: event.candidate
          }
        }))
      }
    }
  }
  
  useEffect(() => {
    const init = async() => {
      if (isValidSpaceId) {
        const spacex = Number(space?.dimensions?.split("x")[0]);
        const spacey = Number(space?.dimensions?.split("x")[1]);
  
        await createPeer();
  
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: spacex,
          height: spacey,
          parent: gameRef.current || undefined,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0, x: 0 },
              debug: false,
            },
          },
          backgroundColor: '#2c3a52',
          scene: {
            preload,
            create,
            update,
          },
        };
    
        const game = new Phaser.Game(config);
    
        let player: Phaser.Physics.Arcade.Sprite;
        let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
        const otherPlayers = new Map<string, Phaser.Physics.Arcade.Sprite>;
    
        function preload(this: Phaser.Scene) {
          this.load.image('avatar', '/pikachu2d.jpeg');
          this.load.image('table', '/2dtable.jpeg');
          this.load.image('chair', '/2dchair.jpeg');
        }
  
        function drawGrid(scene: Phaser.Scene) {
          const gridSize = 40;
          const graphics = scene.add.graphics();
          graphics.lineStyle(0.5, 0xaaaaaa, 0.1);
        
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
          drawGrid(this);
          if (space && space.spaceElements && space.spaceElements.length) {
            space.spaceElements.map(spaceElem => {
              this.add.image(spaceElem.x, spaceElem.y, 'table').setScale(0.2);
            })
          }
          if (this.input.keyboard) {
            cursors = this.input.keyboard.createCursorKeys();
          }
  
          ws.send(
            JSON.stringify({
              type: 'join',
              payload: {
                spaceId: spaceId,
                token: accessToken,
              },
            })
          );
  
          wss.onmessage = async(event) => {
            const data = JSON.parse(event.data);
            switch(data.type){
              case 'user-joined':
                await peer.current?.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
                break;
              case 'renegotiate': {
                await peer.current?.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
                const answer = await peer.current?.createAnswer();
                await peer.current?.setLocalDescription(answer);
                wss.send(JSON.stringify({
                  type: 'renegotiateAnswer',
                  payload: {
                    sdp: answer
                  }
                }))
                break;
              }
              case 'ice-candidate':
                if (data.payload.candidate) {
                  await peer.current?.addIceCandidate(data.payload.candidate);
                }
                break;
              case 'user-left':
                console.log('user-left', data.payload.userStreamId);
                if (data.payload.userStreamId) {
                  setOtherStreams(prev => prev.filter(stream => stream.id!==data.payload.userStreamId))
                }
                break;
              default:
                console.error('wrong message type', data.type);
                break;
            }
          }
  
          ws.onmessage = async(event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'space-joined': {
                console.log('space-joined');
                const offer = await peer.current?.createOffer();
                await peer.current?.setLocalDescription(offer);
                wss.send(JSON.stringify({
                  type: 'join',
                  payload: {
                    token: accessToken,
                    spaceId: spaceId,
                    x: data.payload.spawn.x,
                    y: data.payload.spawn.y,
                    sdp: offer,
                  }
                }))
                addMe(this, data.payload.spawn.x, data.payload.spawn.y, data.payload.users);
                break;
              }
              case 'user-joined':
                addOtherPlayer(data.payload.userId, data.payload.x, data.payload.y, this);
                break;
              case 'move':
                updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y);
                break;
              case 'user-left':
                removeOtherPlayer(data.payload.userId);
                break;
              case 'move-success':
                wss.send(
                  JSON.stringify({
                    type: 'move',
                    payload: {
                      x: data.payload.x,
                      y: data.payload.y,
                    }
                  })
                )
                break;
              default:
                console.error("wrong message type");
                break;
            }
          };
        }
  
        function addMe(scene: Phaser.Scene, x: number, y: number, users: otherUserProps[]){
          player = scene.physics.add.sprite(x, y, 'avatar').setScale(0.2);
          player.setCollideWorldBounds(true);
  
          scene.cameras.main.startFollow(player);
          
          if ( users && users.length ) {
            users.map(user => {
              addOtherPlayer(user.userId, user.x, user.y, scene);
            })
          }
        }
    
        function update(this: Phaser.Scene) {
          if (player) {
            player.setVelocity(0);
            let moved = false;
    
            if (cursors?.left?.isDown) {
              player.setVelocityX(-200);
              moved = true;
            } else if (cursors?.right?.isDown) {
              player.setVelocityX(200);
              moved = true;
            } else {
              player.setVelocityX(0);
            }
      
            if (cursors?.up?.isDown) {
              player.setVelocityY(-200);
              moved = true;
            } else if (cursors?.down?.isDown) {
              player.setVelocityY(200);
              moved = true;
            } else {
              player.setVelocityY(0);
            }
  
            if (moved) {
              ws.send(
                JSON.stringify({
                  type: 'move',
                  payload: {
                    x: player.x,
                    y: player.y,
                  },
                })
              );
            }
          }
        }
    
        function addOtherPlayer(id: string, x: number, y: number, scene: Phaser.Scene) {
          const otherPlayer = scene.physics.add.sprite(x, y, 'avatar').setScale(0.2);
          scene.physics.add.collider(player, otherPlayer);
          otherPlayer.setImmovable(true);
          otherPlayers.set(id, otherPlayer);
        }
    
        function updatePlayerPosition(id: string, x: number, y: number) {
          if (otherPlayers.has(id)) {
            otherPlayers.get(id)?.setPosition(x, y);
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
    }
    init();
  }, [isValidSpaceId]);

  if (loading) {
    return <Loader />
  }

  if (isValidSpaceId==='false') {
    return (
      <div className='h-screen w-screen flex justify-center items-center'>
        <h1 className='text-5xl font-bold'>Space doesn't Exist</h1>
      </div>
    )
  }

  if (isValidSpaceId==='true') {
    return (
      <div className='h-screen w-screen flex flex-col'>
        {/* header */}
        <header className='h-12 w-full border-b-2 border-black'>

        </header>

        {
          othersStream && othersStream.length>0 &&
          <div className='absolute top-12 w-screen h-full'>
            <div className='w-full px-10 flex items-center justify-center'>
              {
                othersStream && othersStream.length>0 &&
                othersStream.map((stream, index) => {
                  return(
                    <video
                      className='h-[200px] w-[300px]'
                      key={index}
                      ref={(video) => {
                        if (video) {
                          video.srcObject = stream;
                          video.play();
                        }
                      }}
                      autoPlay
                      playsInline
                    />
                  )
                })
              }
            </div>
          </div>
        }

        <div className='h-full w-full flex justify-center items-center'>
          <div ref={gameRef} className='w-[1000px] h-[600px] overflow-hidden flex justify-center items-center'/>
        </div>
        {/* footer */}
        <footer className='h-24 w-full border-t-2 border-black'>

        </footer>
      </div>
    )
  }
};

export default EmptySpace;
