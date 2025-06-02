<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../../utils/gunjs";

const router = useRouter();
const isLogin = ref(true);
const formData = reactive({
  email: "",
  password: "",
});

const checkAuthStatus = async () => {
  const hasSession = await auth.checkSession() as boolean;
  console.log("hasSession", hasSession);
  if (hasSession) {
    router.push('/');
  }
};

onMounted(async () => {
  await checkAuthStatus();
});

const handleSubmit = async () => {
  if (formData.email === "" || formData.password === "") {
    alert("Please fill in all fields");
    return;
  }

  try {
    let authResult;
    if (isLogin.value) {
      authResult = await auth.login(formData.email, formData.password);
    } else {
      authResult = await auth.register(formData.email, formData.password);
    }

    if (authResult) {
      alert(authResult);
      formData.email = "";
      formData.password = "";
      await checkAuthStatus();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    alert(error);
  }
};
</script>

<template>
  <div class="authentication-container">
    <div class="authentication-header">
      <h1>{{ isLogin ? "Login" : "Register" }}</h1>
    </div>
    <form class="authentication-form" @submit.prevent="handleSubmit">
      <input
        class="authentication-form-input"
        v-model="formData.email"
        type="text"
        placeholder="Email"
      />
      <input
        class="authentication-form-input"
        v-model="formData.password"
        type="password"
        placeholder="Password"
      />
      <button class="authentication-form-button" type="submit">
        {{ isLogin ? "Login" : "Register" }}
      </button>
    </form>
    <div class="authentication-form-footer">
      <p>
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
      </p>
      <p class="authentication-form-clickable-text" @click="isLogin = !isLogin">
        {{ isLogin ? "Register" : "Login" }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.authentication-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  max-width: 728px;
  max-height: 420px;

  border: 2px solid white;
  border-radius: 8px;
  background-color: #1818188e;
}

.authentication-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.authentication-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  box-sizing: border-box;

  gap: 16px;
  padding: 16px 48px;
}

.authentication-form-input {
  width: 100%;
  height: 56px;

  font-size: 24px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.authentication-form-button {
  width: 50%;

  padding: 8px 12px;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.authentication-form-button:hover {
  background-color: #3d3d3d;
  scale: 1.05;
}

.authentication-form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  text-wrap: nowrap;
  gap: 8px;
}

.authentication-form-clickable-text {
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
  color: #0d00ff;
}
</style>
