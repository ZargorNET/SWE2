<template>
  <div>
    <div ref="renderDivElementRef">
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {PerspectiveCamera, ReinhardToneMapping, Scene, VideoTexture, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import type ThreeEffect from "@/effects/three_effect";

const renderDivElementRef = ref<HTMLDivElement>();

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let controls: OrbitControls;
let composer: EffectComposer;

let disposed = false;

const {effect, videoElement, size} = defineProps<{
  effect: ThreeEffect,
  videoElement: HTMLVideoElement,
  size: { width: number, height: number }
}>();

onMounted(() => {
  scene = new Scene();
  camera = new PerspectiveCamera(75, size.width / size.height);
  renderer = new WebGLRenderer({antialias: true});
  controls = new OrbitControls(camera, renderer.domElement);

  renderer.setSize(size.width, size.height, true);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = ReinhardToneMapping;

  renderDivElementRef.value!.append(renderer.domElement);

  camera.position.z = 5;


  window.addEventListener('resize', onWindowResize);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  effect.onInit(scene, camera, {videoTexture: new VideoTexture(videoElement)}, composer);

  animate();
});

onUnmounted(() => {
  disposed = true;
});

function onWindowResize() {
  const width = size.width;
  const height = size.height;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}

function animate() {
  if (disposed)
    return;

  requestAnimationFrame(animate);

  if (effect != null)
    effect.onRender();

  controls.update();
  composer.render();
}

</script>
