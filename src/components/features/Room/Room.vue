<script setup lang="ts">
import { onMounted, ref } from "vue";
import { createRoom, getRooms, joinRoom } from "../../../utils/gunjs";
import { useRouter } from "vue-router";

interface RoomData {
  roomId: string;
  player1: string;
  player2: string;
  round: number;
  cells: string[];
  status: string;
}

const router = useRouter();
const username = ref(localStorage.getItem("username") || "");

const waitingGames = ref<RoomData[]>([]);

onMounted(async () => {
  const rooms = await getRooms();
  if (!rooms) {
    console.error("Rooms not found");
    return;
  }
  let temp = Object.values(rooms);
  temp.shift();
  let tempFiltered = temp.map((room: any) => JSON.parse(room));
  waitingGames.value = tempFiltered.filter(
    (room: RoomData) => room.status.trim() === "Waiting for second player"
  );
});

const createGame = async () => {
  try {
    const roomData = await createRoom(username.value);
    router.push(`/game?gameId=${roomData.roomId.replace("'s room", "")}`);
  } catch (error) {
    console.error("Failed to create room:", error);
    alert("Failed to create room. Please try again.");
  }
};

const joinGame = (roomId: string) => {
  joinRoom(roomId.replace("'s room", ""), username.value);
  router.push(`/game?gameId=${roomId}`);
};
</script>

<template>
  <div class="room-container">
    <div class="room-header">
      <div class="user-info">
        <span>Welcome, {{ username }}</span>
      </div>
    </div>
    <div class="room-list">
      <div class="room-item" v-for="game in waitingGames" :key="game.roomId">
        <span class="room-id">{{ game.roomId }}</span>
        <button @click="joinGame(game.roomId)">Join Game</button>
      </div>
    </div>
    <button class="create-game-button" @click="createGame">Create Game</button>
  </div>
</template>

<style scoped>
.room-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: clamp(10px, 20px, 30px);
  box-sizing: border-box;
}

.room-header {
  width: 100%;
  max-width: 600px;
  height: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}

.user-info {
  font-size: clamp(16px, 20px, 24px);
  color: #ffffff;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: clamp(300px, 90%, 600px);
  height: clamp(300px, 90%, 600px);
  background-color: #ffffff;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: none;
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #000000;
}

.room-item button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.room-item button:hover {
  background-color: #45a049;
}

.create-game-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  width: 100%;
  max-width: clamp(300px, 90%, 600px);
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-game-button:hover {
  background-color: #337737;
}

.room-id {
  font-size: clamp(24px, 20px, 28px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
