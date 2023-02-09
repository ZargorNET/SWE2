import type {Camera, Scene} from "three";
import type {Video} from "@/video";
import type {Results} from "@mediapipe/holistic";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";

export interface Effect {
    name: String;

    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void;

    onRender(): void;

    onAIResults(results: Results): void;

    onDestroy(): void;
}
