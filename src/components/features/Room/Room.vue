<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  user,
  gun,
  createRoom,
  getRooms,
  joinRoom,
} from "../../../utils/gunjs";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const username = ref(localStorage.getItem("username") || "");

interface Game {
  roomId: string;
  player1: string;
  player2: string;
  round: number;
  cells: string[];
  status: string;
}

const waitingGames = ref<Game[]>([]);

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
    (room: any) => room.status.trim() === "Waiting for second player"
  );
});

const createGame = async () => {
  const newGame = createRoom(username.value);
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
      <h1>Room List</h1>
    </div>
    <div class="room-list">
      <div class="room-item" v-for="game in waitingGames" :key="game.roomId">
        <span>Room ID: {{ game.roomId }}</span>
        <button @click="joinGame(game.roomId)">Join Game</button>
      </div>
    </div>
    <button @click="createGame">Create Game</button>
  </div>
</template>

<style scoped>
.room-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.room-header {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}

.user-info {
  font-size: 1.1em;
  color: #ffffff;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: clamp(300px, 90%, 600px);
  height: clamp(300px, 90%, 600px);
  background-color: #ffffff;
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
</style>
