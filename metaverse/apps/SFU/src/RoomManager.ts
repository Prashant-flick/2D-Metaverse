import { outGoingMessage, User } from "./User";

export class RoomManager{
    rooms: Map<string, User[]> = new Map();
    dist: Map<string, number> = new Map();
    static instance: RoomManager;

    private constructor() {
      this.rooms = new Map();
      this.dist = new Map();
    }

    static getInstance(){
      if (!this.instance) {
        this.instance = new RoomManager();
      }
      return this.instance;
    }
    
    addUser(spaceId: string, user: User){
      if (!this.rooms.has(spaceId)) {
        this.rooms.set(spaceId, [user]);
        return;
      }

      this.rooms.set(spaceId, [...(this.rooms.get(spaceId))!, user]);
    }

    removeUser(spaceId: string, user: User){
      if (this.rooms.has(spaceId)) {
        this.rooms.set(spaceId, this.rooms.get(spaceId)?.filter(u => u.id!==user.id)!);
        this.rooms.get(spaceId)?.map(u => {
          if (u.id!==user.id) {
            if (this.dist.has(JSON.stringify([u.id, user.id]))){
              this.dist.delete(JSON.stringify([u.id, user.id]));
            }
            if (this.dist.has(JSON.stringify([user.id, u.id]))){
              this.dist.delete(JSON.stringify([user.id, u.id]));
            }
          }
        })
      }
    }

    async sendStream(u: User, user: User){
      const userSenders = user.peer?.getSenders();
      let f = false;
      u.myStream?.getTracks().forEach((track) => {
        const trackExists = userSenders?.some(sender => sender.track===track);
        if (!trackExists) {
          user.peer?.addTrack(track, u.myStream!);
          f=true;
        } else {
          console.log("user track already exists");
        }
      })
      if (f) {
        await user.ReNegotiation();
      }

      const uSenders = u.peer?.getSenders();
      f=false;
      user.myStream?.getTracks().forEach((track) => {
        const trackExists = uSenders?.some(sender => sender.track===track);
        if (!trackExists) {
          u.peer?.addTrack(track, user.myStream!);
          f=true;
        } else {
          console.log("user track already exists");
        }
      })

      if (f) {
        await u.ReNegotiation();
      }
    }

    async removeStream(u: User, user: User){
      const userTrack = user.myStream?.getTracks()[0];
      const uSender = u.peer?.getSenders().find(sender => sender.track===userTrack);
      console.log('removing stream processing');
      if (uSender) {
        console.log('removing stream');
        u.peer?.removeTrack(uSender);
        u.ReNegotiation();
      }

      const uTrack = u.myStream?.getTracks()[0];
      const userSender = user.peer?.getSenders().find(sender => sender.track===uTrack);
      console.log('removing stream processing 2');
      if (userSender) {
        console.log('removing stream 2');
        user.peer?.removeTrack(userSender);
        user.ReNegotiation();
      }
    }

    async checkUserCloseBy(user: User, spaceId: string){
      const reqDistance = 150;
      if (this.rooms.has(spaceId)) {
        this.rooms.get(spaceId)?.map(async(u)=> {
          if (u.id !== user.id) {
            const distance = Number(Math.sqrt(Math.pow(u.x - user.x, 2) + Math.pow(u.y - user.y, 2)));
            if (this.dist.has(JSON.stringify([u.id, user.id])) ) {
              if (Number(this.dist.get(JSON.stringify([u.id, user.id]))) > reqDistance && distance<=reqDistance) {
                this.sendStream(u, user);
              }
              if (distance>reqDistance && Number(this.dist.get(JSON.stringify([u.id, user.id])))<=reqDistance) {
                this.removeStream(u, user);
              }
              this.dist.set(JSON.stringify([u.id, user.id]), Number(distance));
            } else if (this.dist.has(JSON.stringify([user.id, u.id]))) {
              if (Number(this.dist.get(JSON.stringify([user.id, u.id]))) > reqDistance && distance<=reqDistance) {
                this.sendStream(u, user);
              }
              if (distance>reqDistance && Number(this.dist.get(JSON.stringify([user.id, u.id])))<=reqDistance) {
                this.removeStream(u, user);
              }
              this.dist.set(JSON.stringify([user.id, u.id]), Number(distance));
            } else {
              if (distance<=reqDistance) {
                this.sendStream(u, user);
              }
              this.dist.set(JSON.stringify([u.id, user.id]), Number(distance));
            }
          }
        })
      }
    }

    broadcast(payload: outGoingMessage, spaceId: string, user: User){
      if (this.rooms.has(spaceId)) {
        this.rooms.get(spaceId)?.forEach(u => {
          if (u.id!==user.id) {
            u.send(payload);
          }
        })
      }
    }
}