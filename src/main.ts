import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { createPinia } from 'pinia';
import Aura from "@primevue/themes/aura";
const pinia = createPinia();



const app = createApp(App)
app.use(router).use(PrimeVue,{
    theme:{
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark',
        }

    }
}).use(pinia).use(ToastService).mount("#app");