<template>
  <div
    class="max-w-2xl w-full relative flex overflow-hidden bg-cyan-500 md:rounded-xl"
  >
    <div class="absolute inset-0 bg-black bg-opacity-75"></div>
    <div class="relative flex flex-col w-full">
      <div class="flex items-center flex-none px-4 h-11">
        <div class="flex space-x-1.5">
          <div class="w-3 h-3 border-2 border-red-500 rounded-full"></div>
          <div class="w-3 h-3 border-2 rounded-full border-amber-400"></div>
          <div class="w-3 h-3 border-2 border-green-400 rounded-full"></div>
        </div>
        <span
          class="mx-auto text-sm text-white transform -translate-x-5 text-opacity-30"
          >Test</span
        >
      </div>
      <div
        class="relative flex flex-col flex-auto min-h-0 border-t border-white border-opacity-10"
      >
        <div
          class="absolute inset-y-0 left-0 hidden bg-black bg-opacity-25 md:block"
          style="width: 50px"
        ></div>
        <div class="flex flex-auto w-full min-h-0 overflow-auto">
          <div class="relative flex-auto w-full">
            <CodeBlock :code="code" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeBlock from "@/components/CodeBlock.vue";

defineProps({
  code: {
    type: String,
    required: true,
  },
});
</script>
