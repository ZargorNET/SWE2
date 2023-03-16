<template>
  <div class="w-full h-auto min-h-full bg-[black] flex flex-col text-white items-center">
    <div class="pointer-events-none w-full h-screen absolute">
      <img src="@/assets/White-Pawn.webp" alt="White Pawn" class="absolute right-20 bottom-20 animated">
      <img src="@/assets/Black-Queen.webp" alt="Black Queen" class="absolute animated left-20 top-40">

      <img src="@/assets/Black-Knight.webp" alt="Black Knight" class="absolute left-[55%] top-2 animated z-20">
      <img src="@/assets/White-Rook.webp" alt="White Rook" class="absolute left-[27%] top-[300px] animated z-0">
    </div>

    <div class="mt-64 h-[60vh] z-10">
      <div class="relative">
        <h1 class="font-josefin text-[10rem] glitch" data-text="art23">art23</h1>
        <h1 class="font-josefin text-[10rem] glow">art23</h1>
        <div class="absolute -right-20 ">
          <p class="subtitle font-serif text-3xl text-right">Eine neue Art, Kunst zu entdecken.</p>
        </div>
      </div>
    </div>


    <video class="hidden" ref="videoElementRef"></video>
    <div class="bg-white rounded-2xl p-4 relative">
      <div :style="{'width': size.width + 'px', 'height': size.height + 'px'}">
        <ThreeJsRenderer :key="counter" v-if="currentEffectType === 'three'" :effect="currentEffect"
                         :video-element="videoElementRef"
                         :size="size"/>
        <CanvasRenderer :key="counter" v-if="currentEffectType === 'canvas'" :effect="currentEffect"
                        :video-element="videoElementRef"
                        :size="size"/>
      </div>

    </div>
    <div class="flex flex-col my-2">
      <h1 class="text-5xl bold">Wähle deinen Effekt aus: </h1>
      <select class="mt-2 cursor-pointer text-xl text-center bg-white text-black"
              @change="e => onEffectSelect(e.target.value)">
        <option disabled selected>Keiner</option>
        <option disabled>ThreeJS Effekte</option>
        <option v-for="effect in threeEffects">{{ effect.name }}</option>
        <option disabled>Canvas Effekte</option>
        <option v-for="effect in canvasEffects">{{ effect.name }}</option>
      </select>
    </div>
    <div class="py-4 text-neutral-600 font-mono text-xs">
      <p>Ein Projekt von Daniel, Niklas und Conner</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, toRaw} from "vue";
import type {Effect} from "@/effects/effect";
import CubeEffect from "@/effects/three/cube_effect";
import {IonDriveEffect} from "@/effects/three/iondrive";
import {DrawNoseEffect} from "@/effects/three/draw_nose";
import type ThreeEffect from "@/effects/three_effect";
import ThreeJsRenderer from "@/components/ThreeJsRenderer.vue";
import {Holistic} from "@mediapipe/holistic";
import {Camera} from "@mediapipe/camera_utils";
import AIMeshEffect from "@/effects/canvas/ai_mesh";
import type CanvasEffect from "@/effects/canvas_effect";
import CanvasRenderer from "@/components/CanvasRenderer.vue";
import PongGameEffect from "@/effects/canvas/pong_game";

const size = {width: 900, height: 600};

const threeEffects = ref<ThreeEffect[]>([new CubeEffect(), new IonDriveEffect(), new DrawNoseEffect()]);
const canvasEffects = ref<CanvasEffect[]>([new AIMeshEffect(), new PongGameEffect()]);

const currentEffect = ref<Effect | null>(null);
const currentEffectType = ref<"three" | "canvas" | undefined>();
const counter = ref<number>(0); // force destroy effect renderer components

const videoElementRef = ref<HTMLVideoElement>();

function onEffectSelect(selected: String) {
  init();

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

let inited = false;

function init() {
  if (inited)
    return;
  inited = true;


  const videoElement = videoElementRef.value!;

  navigator.mediaDevices
      .getUserMedia({video: {width: size.width, height: size.height, facingMode: 'user'}})
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
}

</script>

<style lang="scss">
.animated {
  animation: 20s ease-in-out -16.8475s infinite normal none running hovering;
}

@keyframes hovering {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0, 15%);
  }
  100% {
    transform: translate(0, 0);
  }
}

.glitch {
  color: rgb(223, 191, 191);
  position: relative;
  animation: glitch 5s 5s infinite;
}

.glitch::before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: -2px 0 magenta;
  background: transparent;
  overflow: hidden;
  top: 0;
  animation: noise-1 3s linear infinite alternate-reverse, glitch 5s 5.05s infinite;
}

.glitch::after {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  text-shadow: -5px 0 lightgreen;
  background: transparent;
  overflow: hidden;
  top: 0;
  animation: noise-2 3s linear infinite alternate-reverse, glitch 5s 5s infinite;
}

@keyframes glitch {
  1% {
    transform: rotateX(10deg) skewX(90deg);
  }
  2% {
    transform: rotateX(0deg) skewX(0deg);
  }
}

@keyframes noise-1 {
  $steps: 30;
  @for $i from 1 through $steps {
    #{percentage($i*(calc(1/$steps)))} {
      $top: random(100);
      $bottom: random(101 - $top);
      clip-path: inset(#{$top}px 0 #{$bottom}px 0);
    }
  }
}

@keyframes noise-2 {
  $steps: 30;
  @for $i from 0 through $steps {
    #{percentage($i*(calc(1/$steps)))} {
      $top: random(100);
      $bottom: random(101 - $top);
      clip-path: inset(#{$top}px 0 #{$bottom}px 0);
    }
  }
}

.scanlines {
  overflow: hidden;
  mix-blend-mode: difference;
}

.scanlines::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  background: repeating-linear-gradient(
          to bottom,
          transparent 0%,
          rgba(255, 255, 255, 0.05) .5%,
          transparent 1%
  );

  animation: fudge 7s ease-in-out alternate infinite;
}


@keyframes fudge {
  from {
    transform: translate(0px, 0px);
  }
  to {
    transform: translate(0px, 2%);
  }
}

.glow {
  @extend .glitch;
  text-shadow: 0 0 1000px rgb(223, 191, 191);
  color: transparent;
  position: absolute;
  top: 0;
}

.subtitle {
  animation: glitch-2 5s 5.02s infinite;
}

@keyframes glitch-2 {
  1% {
    transform: rotateX(10deg) skewX(70deg);
  }
  2% {
    transform: rotateX(0deg) skewX(0deg);
  }
}

</style>
