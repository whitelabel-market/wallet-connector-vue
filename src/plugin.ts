import {
  ConnectModal,
  ConnectContent,
  ConnectTitle,
  ConnectButton,
} from "./components/modal";
import { WALLET_CONTEXT, createWallet } from "./hooks";
//import type { ConnectorOptions } from "@whitelabel-solutions/wallet-connector/dist";
import type { App, Plugin } from "vue-demi";

export function WalletConnectorVue(options: any): Plugin {
  return {
    install(app: App) {
      app.component("ConnectModal", ConnectModal);
      app.component("ConnectContent", ConnectContent);
      app.component("ConnectTitle", ConnectTitle);
      app.component("ConnectButton", ConnectButton);
      app.provide(WALLET_CONTEXT, createWallet(options));
    },
  };
}
