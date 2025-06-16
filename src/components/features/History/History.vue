<script setup lang="ts">
import { getHistory } from "../../../utils/gunjs";
import { ref } from "vue";
import { onMounted } from "vue";

const history = ref<any[]>([]);
const username = (localStorage.getItem("username") as string) || "";
const expandedHistory = ref<any[]>([]);

onMounted(() => {
  getHistory(username).then((h: any) => {
    history.value = h.reverse();
  });
});

const toggleHistory = (id: number) => {
  if (expandedHistory.value.includes(id)) {
    expandedHistory.value = expandedHistory.value.filter((i) => i !== id);
  } else {
    expandedHistory.value.push(id);
  }
};
</script>

<template>
  <div class="history-container">
    <div class="history-header">
      <h1>History</h1>
    </div>
    <div v-for="item in history" :key="item.id" class="history-item">
      <div
        class="history-item-expanded"
        v-if="expandedHistory.includes(item.id)"
      >
        <img
          src="../../../assets/arrow.svg"
          alt="history-item-collapsed"
          class="history-arrow-expanded"
          @click="toggleHistory(item.id)"
        />
        <div class="history-board-container">
          <div class="history-board" v-for="cell in item.cells" :key="cell">
            <p
              :class="
                cell === 'X'
                  ? 'history-item-text-won'
                  : 'history-item-text-lost'
              "
            >
              {{ cell }}
            </p>
          </div>
        </div>
      </div>
      <div class="history-item-collapsed" v-else>
        <div class="history-item-collapsed-header">
          <p class="history-item-text">{{ item.date.split("T")[0] }}</p>
          <p
            :class="
              item.winner === ''
                ? 'history-item-text-draw'
                : item.winner.includes(username)
                  ? 'history-item-text-won'
                  : 'history-item-text-lost'
            "
          >
            {{
              item.status.includes('Draw')
                ? 'Draw'
                : item.winner.includes(username)
                  ? 'Won'
                  : 'Lost'
            }}
          </p>
        </div>
        <img
          src="../../../assets/arrow.svg"
          alt="history-item-collapsed"
          class="history-arrow-collapsed"
          @click="toggleHistory(item.id)"
        />
        <div class="history-item-collapsed-text">
          <p class="history-item-text">{{ `ID: ${item.id}` }}</p>
          <p>
            {{ item.player1 === username ? "You" : item.player1 }} VS
            {{ item.player2 === username ? "You" : item.player2 }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-container {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.history-header {
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: clamp(1rem, 5vw, 2rem);
}

.history-item {
  width: 80%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffffff;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.history-board {
  border: 1px solid #ffffff;
  width: clamp(50px, 5vw, 100px);
  height: clamp(50px, 5vw, 100px);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-item-expanded {
  width: 100%;
  height: 100%;
  position: relative;
}

.history-board-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: fit-content;
  height: fit-content;
  align-self: center;
  justify-self: center;
}

.history-item-collapsed {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  position: relative;
}

.history-item-text {
  font-size: clamp(0.8rem, 2vw, 1.2rem);
  font-weight: bold;
  text-align: center;
}

.history-item-collapsed-text {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.history-arrow-collapsed {
  position: absolute;
  right: 0;
  top: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transform: rotate(180deg);
  margin-top: 10px;
  margin-right: 10px;
  transition: transform 0.3s ease-in-out;
}

.history-item-collapsed-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 2vw, 1rem);
}

.history-item-text-won {
  color: #00ff00;
}

.history-item-text-lost {
  color: #ff0000;
}

.history-item-text-draw {
  color: #ffffff;
}

.history-arrow-expanded {
  position: absolute;
  right: 0;
  top: 0;
  width: 20px;
  height: 20px;
  margin-top: 10px;
  margin-right: 10px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}
</style>
