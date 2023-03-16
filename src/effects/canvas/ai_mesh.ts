import type CanvasEffect from "@/effects/canvas_effect";
import type {HolisticEffect} from "@/effects/ai_results_effect";
import type {Results} from "@mediapipe/holistic";
import {FACEMESH_TESSELATION, HAND_CONNECTIONS, POSE_CONNECTIONS} from "@mediapipe/holistic";
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils";

export default class AIMeshEffect implements CanvasEffect, HolisticEffect {
    name: String = "AI Mesh";

    ctx: CanvasRenderingContext2D = null!;

    onDestroy(): void {
    }

    onHolisticAIResults(results: Results): void {
        this.ctx.drawImage(results.image, 0, 0);

        drawConnectors(this.ctx, results.poseLandmarks, POSE_CONNECTIONS,
            {color: '#00FF00', lineWidth: 4});
        drawLandmarks(this.ctx, results.poseLandmarks,
            {color: '#FF0000', lineWidth: 2});
        drawConnectors(this.ctx, results.faceLandmarks, FACEMESH_TESSELATION,
            {color: '#C0C0C070', lineWidth: 1});
        drawConnectors(this.ctx, results.leftHandLandmarks, HAND_CONNECTIONS,
            {color: '#CC0000', lineWidth: 5});
        drawLandmarks(this.ctx, results.leftHandLandmarks,
            {color: '#00FF00', lineWidth: 2});
        drawConnectors(this.ctx, results.rightHandLandmarks, HAND_CONNECTIONS,
            {color: '#00CC00', lineWidth: 5});
        drawLandmarks(this.ctx, results.rightHandLandmarks,
            {color: '#FF0000', lineWidth: 2});
    }

    onRender(): void {
    }

    onInit(ctx: CanvasRenderingContext2D): void {
        this.ctx = ctx;
    }

}
