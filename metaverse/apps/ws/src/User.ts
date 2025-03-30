import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";

const getRandomString = (length: number) => {
    const characters = "QWREYTOYJLDJSBCMSMZshdfirutowenxvcvnbnzmc1234567890";

    let result = "";
    for (let i=0; i<length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

export class User {
    public id: string;
    public userId?: string;
    private spaceId?: string;
    private x: number;
    private y: number;
    constructor(private ws: WebSocket){
        this.id = getRandomString(10);
        this.x=0;
        this.y=0;
        this.initHandlers();
    }

    initHandlers(){
        this.ws.on("message", async(data) => {
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const spaceRes = await client.space.findUnique({
                        where: {
                            id: spaceId
                        }
                    })

                    if (!spaceRes) {
                        this.ws.close();
                        return;
                    }

                    const token = parsedData.payload.token;
                    const userId = (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "HELLO") as JwtPayload).userId;
                    if (!userId) {
                        this.ws.close();
                        return;
                    }
                    this.userId = userId;
                    this.spaceId = spaceId;
                    const spacex = Math.floor(Number((Number(spaceRes?.dimensions?.split("x")[0]))/64))*64;
                    const spacey = Math.floor(Number((Number(spaceRes?.dimensions?.split("x")[1]))/64))*64;
                    this.x = (Math.floor((Math.floor(Math.random() * spacex))/64))*64;
                    this.x += this.x===0 ? 32 : -32;
                    this.y = (Math.floor((Math.floor(Math.random() * spacey))/64))*64;
                    this.y += this.y===0 ? 32 : -32;
                    RoomManager.getInstance().addUser(spaceId, this);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y,
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter((u) => u.id !== this.id)
                            .map((u) => ({
                                id: u.id,
                                userId: u.userId,
                                x: u.x,
                                y: u.y
                            })) ?? []
                        }
                    });

                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        }
                    }, this, this.spaceId!)
                     
                    break;
                case "move":
                    const moveX = Number(parsedData.payload.x);
                    const moveY = Number(parsedData.payload.y);
                    
                    if ((Math.abs(this.x-moveX) + Math.abs(this.y-moveY))==64) {
                        this.x = moveX;
                        this.y = moveY;
                        
                        RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                userId: this.userId,
                                x: this.x,
                                y: this.y
                            }
                        }, this, this.spaceId!);

                        this.send({
                            type: 'move-success',
                            payload: {
                                userId: this.userId,
                                x: this.x,
                                y: this.y
                            }
                        })
                    } else {
                        this.send({
                            type: "movement-rejected",
                            payload: {
                                userId: this.userId,
                                x: this.x,
                                y: this.y
                            }
                        });
                    }
            }
        })
    }

    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId,
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUser(this, this.spaceId!);
    }

    send(payload: OutgoingMessage){
        this.ws.send(JSON.stringify(payload));
    }
}