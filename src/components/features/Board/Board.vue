<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  leaveRoom,
  updateRoom,
  getRoomUpdates,
  getRoom,
} from "../../../utils/gunjs";
import { useRoute } from "vue-router";

interface Room {
  roomId: string;
  player1: string;
  player2: string;
  round: number;
  cells: string[];
  status: string;
}

const route = useRoute();
const username = localStorage.getItem("username") as string;
const isEnded = ref(false);
let board: Room = reactive({
  roomId: "",
  player1: "",
  player2: "",
  round: 1,
  cells: ["", "", "", "", "", "", "", "", ""],
  status: "Waiting for second player",
});

onMounted(async () => {
  const roomId = route.query.gameId as string;
  const processedRoomId = roomId.replace("'s room", "");
  let tempBoard = await getRoom(processedRoomId);

  console.log("Temp board:", tempBoard);

  if (!tempBoard) {
    console.error("Room not found:", processedRoomId);
    return;
  }

  const parsedBoard = JSON.parse(tempBoard as string) as Room;
  board.roomId = parsedBoard.roomId;
  board.player1 = parsedBoard.player1;
  board.player2 = parsedBoard.player2;
  board.round = parsedBoard.round;
  board.cells = [...parsedBoard.cells];
  board.status = parsedBoard.status;

  getRoomUpdates(processedRoomId).on((updatedData: any) => {
    if (!updatedData) return;
    const parsedData = JSON.parse(updatedData) as Room;
    board.roomId = parsedData.roomId;
    board.player1 = parsedData.player1;
    board.player2 = parsedData.player2;
    board.round = parsedData.round;
    board.cells = [...parsedData.cells];
    board.status = parsedData.status;
  });
});

watch(board, () => {
  if (isEnded.value) {
    return;
  }

  if (checkWin(board.cells)) {
    const winner = board.round % 2 === 0 ? "X" : "O";
    board.status = `${winner} wins!`;
    alert(`Player ${winner} wins!`);
    updateRoom(board.roomId.replace("'s room", ""), board);
    isEnded.value = true;
  } else if (board.cells.every((cell) => cell !== "")) {
    board.status = "Game over - Draw!";
    alert("Game over - Draw!");
    updateRoom(board.roomId.replace("'s room", ""), board);
    isEnded.value = true;
  }
});

const checkWin = (cells: string[]): boolean => {
  if (
    cells[0] !== "" &&
    cells[0] === cells[1] &&
    cells[1] === cells[2] &&
    cells[0] != ""
  )
    return true;
  if (
    cells[3] !== "" &&
    cells[3] === cells[4] &&
    cells[4] === cells[5] &&
    cells[3] != ""
  )
    return true;
  if (
    cells[6] !== "" &&
    cells[6] === cells[7] &&
    cells[7] === cells[8] &&
    cells[6] != ""
  )
    return true;

  if (
    cells[0] !== "" &&
    cells[0] === cells[3] &&
    cells[3] === cells[6] &&
    cells[0] != ""
  )
    return true;
  if (
    cells[1] !== "" &&
    cells[1] === cells[4] &&
    cells[4] === cells[7] &&
    cells[1] != ""
  )
    return true;
  if (
    cells[2] !== "" &&
    cells[2] === cells[5] &&
    cells[5] === cells[8] &&
    cells[2] != ""
  )
    return true;

  if (
    cells[0] !== "" &&
    cells[0] === cells[4] &&
    cells[4] === cells[8] &&
    cells[0] != ""
  )
    return true;
  if (
    cells[2] !== "" &&
    cells[2] === cells[4] &&
    cells[4] === cells[6] &&
    cells[2] != ""
  )
    return true;

  return false;
};

const handleClick = (index: number) => {
  if (
    board.round > 9 ||
    board.status.includes("wins") ||
    board.status.includes("Draw") ||
    board.player1 === "" ||
    board.player2 === ""
  ) {
    return;
  }

  if (board.cells[index] !== "") {
    alert("Field already occupied");
    return;
  }

  const round = board.round;

  if (round % 2 == 1 && board.player1 == username) {
    board.cells[index] = "X";
    board.round++;
  } else if (round % 2 == 0 && board.player2 == username) {
    board.cells[index] = "O";
    board.round++;
  } else {
    alert("Not your turn");
  }
  updateRoom(board.roomId.replace("'s room", ""), board);
};
</script>

<template>
  <div class="game-container">
    <div class="game-info">
      <button
        class="leave-room-button"
        @click="leaveRoom(board.roomId, username)"
      >
        Leave Room
      </button>
      <div class="game-info-players">
        <div class="game-info-item">
          <p>Player 1</p>
          <p class="game-info-item-text">{{ board.player1 }}</p>
        </div>
        <div class="game-info-item">
          <p>Player 2</p>
          <p class="game-info-item-text">{{ board.player2 }}</p>
        </div>
      </div>
      <div class="game-info-round">
        <p>Round</p>
        <p>{{ board.round }}</p>
      </div>
    </div>
    <div class="board-container">
      <div class="clickable-field" @click="handleClick(0)">
        {{ board.cells[0] }}
      </div>
      <div class="clickable-field" @click="handleClick(1)">
        {{ board.cells[1] }}
      </div>
      <div class="clickable-field" @click="handleClick(2)">
        {{ board.cells[2] }}
      </div>
      <div class="clickable-field" @click="handleClick(3)">
        {{ board.cells[3] }}
      </div>
      <div class="clickable-field" @click="handleClick(4)">
        {{ board.cells[4] }}
      </div>
      <div class="clickable-field" @click="handleClick(5)">
        {{ board.cells[5] }}
      </div>
      <div class="clickable-field" @click="handleClick(6)">
        {{ board.cells[6] }}
      </div>
      <div class="clickable-field" @click="handleClick(7)">
        {{ board.cells[7] }}
      </div>
      <div class="clickable-field" @click="handleClick(8)">
        {{ board.cells[8] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;

  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.game-info {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 20px;
}

.game-info-players {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  width: 80%;
  padding: 10px;
  box-sizing: border-box;
}

.game-info-round {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 10px;
}

.game-info-item-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: clamp(50px, 200px, 250px);
}

.board-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  justify-items: center;
  align-items: center;
  width: min(100%, 600px);
  aspect-ratio: 1;
  box-sizing: border-box;
  background-color: #ffffffd6;
}

.clickable-field {
  border: 1px solid rgb(0, 0, 0);
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  font-size: clamp(20px, 5vw, 45px);
  user-select: none;
}

.clickable-field:hover {
  background-color: #ffffff;
}

.leave-room-button {
  background-color: #ff0000;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.leave-room-button:hover {
  background-color: #ff0000;
}
</style>
