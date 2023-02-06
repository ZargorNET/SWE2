import type {Camera, Scene} from "three";
import type {Video} from "@/video";
import type {Results} from "@mediapipe/holistic";

export interface Effect {
    name: String;

    onInit(scene: Scene, camera: Camera, video: Video): void;

    onRender(): void;

    onAIResults(results: Results): void;

    onDestroy(): void;
}
