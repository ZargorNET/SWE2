<template>
  <div class="w-full h-auto min-h-full bg-[#1d1d1f] flex flex-col text-white items-center">
    <video class="hidden" ref="videoElementRef"></video>
    <ThreeJsRenderer :key="counter" v-if="currentEffectType === 'three'" :effect="currentEffect"
                     :video-element="videoElementRef"
                     :size="size"/>
    <CanvasRenderer :key="counter" v-if="currentEffectType === 'canvas'" :effect="currentEffect"
                    :video-element="videoElementRef"
                    :size="size"/>
    <div class="flex flex-col my-2">
      <h1 class="text-5xl bold">Wähle deinen Effekt aus: </h1>
      <select class="mt-2 cursor-pointer text-xl text-center bg-slate-600"
              @change="e => onEffectSelect(e.target.value)">
        <option disabled selected>Keiner</option>
        <option disabled>ThreeJS Effekte</option>
        <option v-for="effect in threeEffects">{{ effect.name }}</option>
        <option disabled>Canvas Effekte</option>
        <option v-for="effect in canvasEffects">{{ effect.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from "vue";
import type {Effect} from "@/effects/effect";
import DebugEffect from "@/effects/three/debug";
import ModelEffect from "@/effects/three/model";
import {CubeEffect} from "@/effects/three/cube";
import {DanielEffect} from "@/effects/three/daniel";
import type ThreeEffect from "@/effects/three_effect";
import ThreeJsRenderer from "@/components/ThreeJsRenderer.vue";
import {Holistic} from "@mediapipe/holistic";
import {Camera} from "@mediapipe/camera_utils";
import DebugMeshEffect from "@/effects/canvas/debug_mesh";
import type CanvasEffect from "@/effects/canvas_effect";
import CanvasRenderer from "@/components/CanvasRenderer.vue";

const size = {width: 900, height: 600};

const threeEffects = ref<ThreeEffect[]>([new DebugEffect(), new ModelEffect(), new CubeEffect(), new DanielEffect()]);
const canvasEffects = ref<CanvasEffect[]>([new DebugMeshEffect()]);

const currentEffect = ref<Effect | null>(null);
const currentEffectType = ref<"three" | "canvas" | undefined>();
const counter = ref<number>(0); // force destroy effect renderer components

const videoElementRef = ref<HTMLVideoElement>();

function onEffectSelect(selected: String) {
  let effect: Effect | undefined = threeEffects.value.find(e => e.name === selected);
  let effectType: "three" | "canvas" = "three";

  if (effect == undefined) {
    effect = canvasEffects.value.find(e => e.name === selected);
    effectType = "canvas";
  }

  if (effect == undefined)
    return;

  if (currentEffect.value) {
    currentEffect.value.onDestroy();
  }

  currentEffect.value = effect;
  currentEffectType.value = effectType;
  counter.value = counter.value + 1;
}

onMounted(() => {
  const videoElement = videoElementRef.value!;

  navigator.mediaDevices
      .getUserMedia({video: {width: 1280, height: 720, facingMode: 'user'}})
      .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
      });

  const holistic = new Holistic({
    locateFile: (file) => {
      console.log(file);
      return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }
  });
  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  holistic.onResults(results => {
    // noinspection JSIncompatibleTypesComparison
    if (results == null || results.faceLandmarks == null)
      return;

    const effect = toRaw(currentEffect.value) as any;
    if (effect == null)
      return;

    if (typeof effect.onHolisticAIResults === "function")
      effect.onHolisticAIResults(results);
  });

  const aiCamera = new Camera(videoElement, {
    onFrame: async () => {
      await holistic.send({image: videoElement});
    },
    width: size.width,
    height: size.height
  });
  aiCamera.start();
});
</script>
