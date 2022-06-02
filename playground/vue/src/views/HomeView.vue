<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <div class="flex items-center gap-8">
      <button @click.prevent="show = true">Show Modal</button>
      <button @click.prevent="disconnect">Disconnect</button>
    </div>
    <TerminalWindow :code="code" />
  </div>
  <ConnectModal :show="show" @close="show = false" />
</template>

<script setup lang="ts">
import ConnectModal from "@/components/ConnectModal.vue";
import {
  useWallet,
  useBlock,
} from "@whitelabel-solutions/wallet-connector-vue";
import TerminalWindow from "@/components/TerminalWindow.vue";
import { ref, watchEffect } from "vue";

const show = ref(false);
const code = ref("");

const { address, loading, activeChainId, error, isConnected, disconnect } =
  useWallet();

const { block } = useBlock({ useSubscriptions: true });

watchEffect(() => {
  code.value = JSON.stringify(
    {
      address: address.value || "",
      loading: loading.value || false,
      chainId: activeChainId.value || null,
      error: error.value || null,
      connected: isConnected.value || false,
      block: block.value || null,
    },
    null,
    2
  );
});
</script>
