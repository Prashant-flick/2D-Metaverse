import { User } from "./User";

export class RoomManager{
    rooms: Map<string, User[]> = new Map();
    static instance: RoomManager;

    private constructor() {
      this.rooms = new Map();
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
      this.checkUserCloseBy(user, spaceId);
    }

    removeUser(spaceId: string, user: User){
      if (this.rooms.has(spaceId)) {
        this.rooms.set(spaceId, this.rooms.get(spaceId)?.filter(u => u.id!==user.id)!);
      }
    }

    async checkUserCloseBy(user: User, spaceId: string){
      if (this.rooms.has(spaceId)) {
        this.rooms.get(spaceId)?.map(async(u)=> {
          if (u.id !== user.id) {
            const dist = Number(Math.sqrt(Math.pow(u.x - user.x, 2) + Math.pow(u.y - user.y, 2)));
            if (dist <= 80) {
              u.myStream?.getTracks().forEach(track => user.peer?.addTrack(track, u.myStream!));
              await user.ReNegotiation();
              user.myStream?.getTracks().forEach(track => u.peer?.addTrack(track, user.myStream!));
              await u.ReNegotiation();
            }
          }
        })
      }
    }
}