import { createApp, h } from "vue";
import App from "./App.vue";
import router from "./router";
import { WalletConnectorVue } from "@whitelabel-solutions/wallet-connector-vue";
import "@/assets/css/app.css";

const app = createApp({
  render: () => h(App),
});

app.use(
  WalletConnectorVue({
    appName: "Magic Mondrian",
    infuraId: "",
    chainId: 80001,
  })
);
app.use(router);
app.mount("#app");
