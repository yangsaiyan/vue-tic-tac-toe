import Gun from "gun/gun";
import "gun/sea";

let gun: any;
let user: any;

try {
  gun = Gun({
    peers: [import.meta.env.VITE_GUN_PEER],
    radisk: false,
    localStorage: false,
  });

  user = gun.user();
} catch (error) {
  console.error("GunJS initialization error:", error);
  gun = {
    get: () => ({ put: () => {} }),
    on: () => {},
    user: () => ({
      auth: () => Promise.reject("GunJS not initialized"),
      create: () => Promise.reject("GunJS not initialized"),
      leave: () => Promise.resolve(),
      recall: () => Promise.resolve(null),
    }),
  };
  user = gun.user();
}

export const auth = {
  login: (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      try {
        user.auth(email, password, (ack: any) => {
          if (ack?.err) {
            reject(ack.err);
            return;
          }
          user.recall({ sessionStorage: true }, () => {
            localStorage.setItem("userEmail", email);
            localStorage.setItem("username", email.split("@")[0]);
            resolve("Login successful");
          });
        });
      } catch (error) {
        reject("Login failed");
      }
    });
  },

  register: (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      try {
        user.create(email, password, (ack: any) => {
          if (ack?.err) {
            reject(ack.err);
            return;
          }

          user.auth(email, password, (authAck: any) => {
            if (authAck?.err) {
              reject(authAck.err);
              return;
            }
            user.recall({ sessionStorage: true }, (sessionAck: any) => {
              localStorage.setItem("userEmail", email);
              localStorage.setItem("username", email.split("@")[0]);
              resolve("Registration successful and logged in");
            });
          });
        });
      } catch (error) {
        reject("Registration failed");
      }
    });
  },

  logout: () => {
    return new Promise((resolve) => {
      try {
        user.leave();
        user._.sea = null;
        user._.tag = null;
        user._.auth = null;

        setTimeout(() => {
          localStorage.removeItem("userEmail");
          localStorage.removeItem("username");
          resolve("Logged out successfully");
        }, 100);
      } catch (error) {
        resolve("Logout failed");
      }
    });
  },

  checkSession: () => {
    return new Promise((resolve) => {
      try {
        user.recall({ sessionStorage: true }, (ack: any) => {
          user.get("alias", (alias: any) => {
            if (alias) {
              resolve(true);
              return;
            }

            if (ack?.put?.alias) {
              resolve(true);
              return;
            }

            if (ack?.sea?.pub) {
              resolve(true);
              return;
            }

            resolve(false);
          });
        });
      } catch (error) {
        console.error("Session check error:", error);
        resolve(false);
      }
    });
  },
};

interface RoomData {
  roomId: string;
  player1: string;
  player2: string;
  round: number;
  cells: string[];
  status: string;
}

export const createRoom = (roomId: string): Promise<RoomData> => {
  return new Promise((resolve, reject) => {
    const roomData: RoomData = {
      roomId: `${roomId}'s room`,
      player1: roomId,
      player2: "",
      round: 1,
      cells: ["", "", "", "", "", "", "", "", ""],
      status: "Waiting for second player",
    };
    gun
      .get("test-rooms-ttt")
      .get(roomId)
      .put(JSON.stringify(roomData))
      .then(() => {
        resolve(roomData);
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};

export const getRooms = () => {
  return gun.get("test-rooms-ttt").once((roomsGraph: any) => {
    return roomsGraph;
  });
};

export const getRoom = (roomId: string) => {
  return new Promise((resolve) => {
    gun
      .get("test-rooms-ttt")
      .get(roomId)
      .once((room: any) => {
        resolve(room);
      });
  });
};

export const joinRoom = async (roomId: string, playerId: string) => {
  const selectedRoom = await getRoom(roomId);

  if (!selectedRoom) {
    return;
  }

  gun
    .get("test-rooms-ttt")
    .get(roomId)
    .put(
      JSON.stringify({
        ...JSON.parse(selectedRoom as string),
        player2: playerId,
        status: "Game in progress",
      })
    );
};

export const leaveRoom = (roomId: string, playerId: string) => {
  gun.get("users").get(playerId).put({ status: "lobby" });
  gun.get("rooms").get(roomId).put(null);
  window.location.href = "/";
};

export const updateRoom = async (roomId: string, roomData: any) => {
  try {
    const updatedRoom = {
      roomId: roomData.roomId || roomId,
      player1: roomData.player1 || "",
      player2: roomData.player2 || "",
      round: typeof roomData.round === 'number' ? roomData.round : 1,
      cells: Array.isArray(roomData.cells) ? roomData.cells : ["", "", "", "", "", "", "", "", ""],
      status: typeof roomData.status === 'string' ? roomData.status : "Game in progress"
    };

    await gun
      .get("test-rooms-ttt")
      .get(roomId)
      .put(JSON.stringify(updatedRoom));
    
    return updatedRoom;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const getRoomUpdates = (roomId: string) => {
  return gun
    .get("test-rooms-ttt")
    .get(roomId)
    .on((room: any) => {
      if (!room) return;
    });
};

export const updateHistory = (username: string, history: any) => {
  return gun.get("users").get(`${username}-tic-tac-toe-test`).put(history);
};

export const getHistory = async (username: string) => {
  return new Promise((resolve) => {
    gun.get("users").get(`${username}-tic-tac-toe-test`).once((data: unknown) => {
      if (!data) {
        resolve([]);
        return;
      }
      try {
        const history = typeof data === 'string' ? JSON.parse(data) : data;
        resolve(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('Error parsing history:', error);
        resolve([]);
      }
    });
  });
};

export { gun, user };
