<template>
  <div class="w-full h-full bg-gray-800 flex flex-col text-white items-center">
    <div ref="renderDivElementRef" class="mt-8">
      <video class="hidden" ref="videoElementRef"></video>
    </div>
    <div class="flex flex-col mt-2">
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
import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import type {Effect} from "@/effects/effect";
import DebugEffect from "@/effects/debug";

const videoElementRef = ref<HTMLVideoElement>();
const renderDivElementRef = ref<HTMLDivElement>();

const effects = ref<Effect[]>([new DebugEffect()]);

const canvasSize = {width: 700, height: 400};
let currentEffect: Effect | null;
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;

onMounted(() => {
  const videoElement = videoElementRef.value!;

  scene = new Scene();
  camera = new PerspectiveCamera(75, canvasSize.width / canvasSize.height);
  renderer = new WebGLRenderer();

  renderer.setSize(canvasSize.width, canvasSize.height);

  renderDivElementRef.value!.append(renderer.domElement);

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({color: 0x00ff00});
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;


  window.addEventListener('resize', onWindowResize);
  animate();
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (currentEffect != null)
    currentEffect.onRender();

  renderer.render(scene, camera);
}


function onEffectSelect(selected: String) {
  const effectsArray = effects.value;

  const effect = effectsArray.find(e => e.name === selected);

  if (effect == null)
    return;

  if (currentEffect) {
    currentEffect.onDestroy();
    scene.clear();
  }

  effect.onInit(scene, camera);
  currentEffect = effect;
}


</script>
