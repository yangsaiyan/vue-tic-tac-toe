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

  gun.on("hi", (peer: any) => {
    console.log("Connected to peer:", peer);
  });

  gun.get("test").put({ hello: "world" }, (ack: any) => {
    console.log("Test node creation response:", ack);
  });

  gun.get("test").once((data: any) => {
    console.log("Test node data:", data);
  });
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
              console.log("Session stored:", sessionAck);
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
        localStorage.removeItem("userEmail");
        localStorage.removeItem("username");
        resolve("Logged out successfully");
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

export const createRoom = (roomId: string) => {
  const roomData = {
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
      window.location.assign(`/game?gameId=${roomId}`);
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

export const updateRoom = (roomId: string, roomData: any) => {
  gun
    .get("test-rooms-ttt")
    .get(roomId)
    .put(JSON.stringify(roomData))
    .then(() => {
    });
};

export const getRoomUpdates = (roomId: string) => {
  return gun
    .get("test-rooms-ttt")
    .get(roomId)
    .on((room: any) => {
      if (!room) return;
    });
};

export { gun, user };
