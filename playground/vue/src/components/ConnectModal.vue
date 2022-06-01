<template>
  <ConnectModal :show="show" class="fixed inset-0">
    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div class="fixed inset-0 bg-black/50"></div>
        <ConnectContent
          class="w-full flex flex-col gap-8 max-w-md transform rounded-2xl bg-white p-6 text-left shadow-xl"
        >
          <ConnectTitle class="text-xl font-bold text-center"
            >Select Wallet</ConnectTitle
          >
          <ul class="flex flex-col gap-4">
            <li v-for="(provider, i) of providers" :key="i">
              <ConnectButton
                @click="connect(provider)"
                class="flex items-center justify-between w-full"
              >
                <span>{{ provider.name }}</span>
                <g v-html="provider.logo" id="logo"></g>
              </ConnectButton>
            </li>
          </ul>
        </ConnectContent>
      </div>
    </div>
  </ConnectModal>
</template>

<script setup lang="ts">
import {
  ConnectModal,
  ConnectTitle,
  ConnectContent,
  ConnectButton,
  Providers,
  useWallet,
} from "@whitelabel-solutions/wallet-connector-vue";

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const { connect } = useWallet();
const { MetaMaskProvider, WalletLinkProvider, WalletConnectProvider } =
  Providers;
const providers = [MetaMaskProvider, WalletLinkProvider, WalletConnectProvider];
</script>

<style>
#logo svg {
  @apply w-6 h-6;
}

.outer,
.inner {
  background: #eee;
  padding: 30px;
  min-height: 100px;
}

.inner {
  background: #ccc;
}

.nested-enter-active,
.nested-leave-active {
  transition: all 0.3s ease-in-out;
}
/* delay leave of parent element */
.nested-leave-active {
  transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

/* we can also transition nested elements using nested selectors */
.nested-enter-active .inner,
.nested-leave-active .inner {
  transition: all 0.3s ease-in-out;
}
/* delay enter of nested element */
.nested-enter-active .inner {
  transition-delay: 0.25s;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
  transform: translateX(30px);
  /*
  	Hack around a Chrome 96 bug in handling nested opacity transitions.
    This is not needed in other browsers or Chrome 99+ where the bug
    has been fixed.
  */
  opacity: 0.001;
}
</style>
