import {Metadata, Role} from "@coral-xyz/woof-common";
import { Room } from "./Room";

export class RoomManager {
    private static instance: RoomManager;
    private rooms: Map<string, Room>

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    private constructor() {
        this.rooms = new Map<string, Room>();
    }

    async addUser(ws: any, roomId: string, metadata: Metadata) {
        console.log("roomd is " + roomId);
        if (!this.rooms.get(roomId)) {
            const room = new Room(roomId);
            await room.start()
            console.log("room created")
            this.rooms.set(roomId, room);
        }
        this.rooms.get(roomId)?.addUser(ws, ws.id, Role.publisher, metadata)
        ws.on("close", () => {
            this.rooms.get(roomId)?.removeUser(ws.id)
        });
    }

}