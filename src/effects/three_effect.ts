import type {Camera, Scene} from "three";
import type {Video} from "@/video";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import type {Effect} from "@/effects/effect";

export default interface ThreeEffect extends Effect {
    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void;
}
