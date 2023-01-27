<script setup lang="ts">
import {onMounted, ref} from "vue";
import {FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS, Results} from "@mediapipe/holistic";
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils";
import {Camera} from "@mediapipe/camera_utils";

const videoElementRef = ref<HTMLVideoElement>();
const canvasElementRef = ref<HTMLCanvasElement>();

const position = ref("");

onMounted(() => {
  const videoElement = videoElementRef.value!;
  const canvasElement = canvasElementRef.value!;
  const canvasCtx: CanvasRenderingContext2D = canvasElement.getContext('2d')!;
  const canvasSize = {width: canvasElement.width, height: canvasElement.height};

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

  holistic.onResults((results: Results) => {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);


    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-over';

    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, results.poseLandmarks,
        {color: '#FF0000', lineWidth: 2});
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
        {color: '#C0C0C070', lineWidth: 1});
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
        {color: '#CC0000', lineWidth: 5});
    drawLandmarks(canvasCtx, results.leftHandLandmarks,
        {color: '#00FF00', lineWidth: 2});
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
        {color: '#00CC00', lineWidth: 5});
    drawLandmarks(canvasCtx, results.rightHandLandmarks,
        {color: '#FF0000', lineWidth: 2});


    if (results.faceLandmarks != undefined && results.faceLandmarks.length > 0) {
      const nose = results.faceLandmarks[1];
      const noseXYpx = {x: nose.x * canvasSize.width, y: nose.y * canvasSize.height};

      canvasCtx.strokeStyle = "lightgreen";
      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(noseXYpx.x, 0);
      canvasCtx.lineTo(noseXYpx.x, canvasSize.height);
      canvasCtx.stroke();

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, noseXYpx.y);
      canvasCtx.lineTo(canvasSize.width, noseXYpx.y);
      canvasCtx.stroke();

      position.value = `${JSON.stringify(noseXYpx)}`;

    }

    canvasCtx.restore();
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await holistic.send({image: videoElement});
    },
    width: 1280,
    height: 720
  });
  camera.start();

});
</script>

<template>
  <div class="w-full h-full bg-gray-800">
    <video class="hidden" ref="videoElementRef"></video>
    <canvas width="1280" height="720" ref="canvasElementRef"></canvas>
    <p class="text-white">{{ position }}</p>
  </div>
</template>
