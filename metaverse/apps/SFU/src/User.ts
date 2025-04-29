import WebSocket from "ws";
// import client from "@repo/db/client";
import jwt,{JwtPayload} from 'jsonwebtoken'
import { RoomManager } from "./RoomManager";
import { RTCPeerConnection, RTCSessionDescription } from "@roamhq/wrtc";

const getRandomString = (length: number) => {
  const characters = "QWREYTOYJLDJSBCMSMZshdfirutowenxvcvnbnzmc1234567890";

  let result = "";
  for (let i=0; i<length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export type outGoingMessage = any;

export class User{
  private ws: WebSocket;
  public id: string;
  public userId?: string;
  public spaceId?: string;
  public x: number;
  public y: number;
  public myStream?: MediaStream;
  public peer?: RTCPeerConnection;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.id = getRandomString(5);
    this.x=0;
    this.y=0;
    
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.peer.ontrack = (event) => {
      if (event.streams && event.streams.length) {
        event.streams[0].getTracks().forEach(track => {
        })
        
        this.myStream = event.streams[0];
      }
    }

    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.send({
          type: 'ice-candidate',
          payload: {
            candidate: event.candidate
          }
        })
      }
    }

    this.init();
  }

  init(){
    this.ws.on('message', async(data) => {
      const parsedData = JSON.parse(data.toString());
      switch(parsedData.type) {
        case 'join':
          const spaceId = parsedData.payload.spaceId;
          // const res = await client.space.findUnique({
          //     where: {
          //         id: spaceId
          //     }
          // })

          // if (!res) {
          //   this.ws.close();
          //   return;
          // }
          
          const userId = (jwt.verify(parsedData.payload.token, process.env.ACCESS_TOKEN_SECRET || "HELLO") as JwtPayload).userId
          if (!userId) {
            this.ws.close();
            return;
          }
          this.spaceId = spaceId;
          this.userId = userId;
          this.x = parsedData.payload.x;
          this.y = parsedData.payload.y; 
          RoomManager.getInstance().addUser(spaceId, this);

          const answer = await this.addDescription(parsedData.payload.sdp);
          
          this.send({
            type: 'user-joined',
            payload: {
              sdp: answer
            } 
          })
          break;
        case 'move':
          const moveX = Number(parsedData.payload.x);
          const moveY = Number(parsedData.payload.y);

          this.x = moveX;
          this.y = moveY;
          RoomManager.getInstance().checkUserCloseBy(this, this.spaceId!);
          break;
        case 'renegotiateAnswer':
          this.peer?.setRemoteDescription(new RTCSessionDescription(parsedData.payload.sdp));
          break;
        case 'ice-candidate':
          if (parsedData.payload.candidate) {
            this.peer?.addIceCandidate(parsedData.payload.candidate);
          }
          break;
        case 'check-nearby-user':
          RoomManager.getInstance().checkUserCloseBy(this, this.spaceId!);
          break;
        default:
          console.log("wrong message type after parsing data", parsedData.type);
          break;
      }
    })
  }

  async ReNegotiation(){
    const offer = await this.peer?.createOffer();
    await this.peer?.setLocalDescription(offer);
    this.send({
      type: 'renegotiate',
      payload: {
        sdp: offer
      }
    })
  }

  async addDescription(sdp: RTCSessionDescription){
    await this.peer?.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.peer?.createAnswer();
    await this.peer?.setLocalDescription(answer);
    return answer;
  }

  destroy(){
    RoomManager.getInstance().removeUser(this.spaceId!, this);
    RoomManager.getInstance().broadcast({
      type: 'user-left',
      payload: {
        userStreamId: this.myStream?.id
      }
    }, this.spaceId!, this)
  }

  send(payload: outGoingMessage){
    this.ws.send(JSON.stringify(payload));
  }
}