<template>
  <div>
    <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
  </div>
</template>

<script setup lang="ts">
import type CanvasEffect from "@/effects/canvas_effect";
import {onBeforeUnmount, onMounted, ref} from "vue";

const {effect, videoElement, size} = defineProps<{
  effect: CanvasEffect,
  videoElement: HTMLVideoElement,
  size: { width: number, height: number }
}>();

const canvasRef = ref<HTMLCanvasElement>();

onMounted(() => {
  effect.onInit(canvasRef.value!.getContext("2d")!);

  function animate() {
    requestAnimationFrame(animate);

    effect.onRender();
  }

  animate();
});

onBeforeUnmount(() => {
  effect.onDestroy();
});
</script>
