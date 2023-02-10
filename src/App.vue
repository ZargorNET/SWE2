<template>
  <div class="w-full h-auto min-h-full bg-gray-800 flex flex-col text-white items-center">
    <div ref="renderDivElementRef" class="mt-8">
      <video class="hidden" ref="videoElementRef"></video>
    </div>
    <div class="flex flex-col my-2">
      <h1 class="text-5xl bold">Wähle deinen Effekt aus: </h1>
      <select class="mt-2 cursor-pointer text-xl text-center bg-slate-600"
              @change="e => onEffectSelect(e.target.value)">
        <option disabled selected>Keiner</option>
        <option v-for="effect in effects">{{ effect.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {PerspectiveCamera, ReinhardToneMapping, Scene, VideoTexture, WebGLRenderer} from "three";
import type {Effect} from "@/effects/effect";
import DebugEffect from "@/effects/debug";
import {Holistic} from "@mediapipe/holistic";
import {Camera} from "@mediapipe/camera_utils";
import ModelEffect from "@/effects/model";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {CubeEffect} from "@/effects/cube";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import { DanielEffect } from "@/effects/daniel";

const videoElementRef = ref<HTMLVideoElement>();
const renderDivElementRef = ref<HTMLDivElement>();

const effects = ref<Effect[]>([new DebugEffect(), new ModelEffect(), new CubeEffect(), new DanielEffect()]);

const canvasSize = {width: 1200, height: 600};
let currentEffect: Effect | null;
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let controls: OrbitControls;
let composer: EffectComposer;

onMounted(() => {
  const videoElement = videoElementRef.value!;
  scene = new Scene();
  camera = new PerspectiveCamera(75, canvasSize.width / canvasSize.height);
  renderer = new WebGLRenderer({antialias: true});
  controls = new OrbitControls(camera, renderer.domElement);

  renderer.setSize(canvasSize.width, canvasSize.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = ReinhardToneMapping;

  renderDivElementRef.value!.append(renderer.domElement);

  camera.position.z = 5;


  window.addEventListener('resize', onWindowResize);

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

    currentEffect?.onAIResults(results);
  });

  const aiCamera = new Camera(videoElement, {
    onFrame: async () => {
      await holistic.send({image: videoElement});
    },
    width: 1280,
    height: 720
  });
  aiCamera.start();

  composer = new EffectComposer(renderer);

  animate();

  onEffectSelect("Daniel");
});

function onWindowResize() {
  const width = canvasSize.width;
  const height = canvasSize.height;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  if (currentEffect != null)
    currentEffect.onRender();

  controls.update();
  composer.render();
}


function onEffectSelect(selected: String) {
  const effectsArray = effects.value;

  const effect = effectsArray.find(e => e.name === selected);

  if (effect == null)
    return;

  if (currentEffect) {
    currentEffect.onDestroy();
    scene.clear();
    composer.reset();
  }

  composer = new EffectComposer(renderer);
  scene = new Scene();

  composer.addPass(new RenderPass(scene, camera));

  effect.onInit(scene, camera, {videoTexture: new VideoTexture(videoElementRef.value!)}, composer);
  currentEffect = effect;
}


</script>
