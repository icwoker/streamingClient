import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import { createPinia } from 'pinia';
const pinia = createPinia();

createApp(App).use(router).use(PrimeVue).use(pinia).mount("#app");
