import { User } from "./User";
import WebSocket from "ws";

export class UserManager {
  private static instance: UserManager;
  private users: Map<string, User>;

  private constructor() {
    this.users = new Map<string, User>();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  addUser(ws: WebSocket, id: string, userId: string) {
    const user = new User(id, userId, ws);
    ws.on("close", () => {
      user.destroy();
      this.users.delete(id);
    });
    this.users.set(id, user);
  }
}
