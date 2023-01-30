import type {PerspectiveCamera, Scene} from "three";

export interface Effect {
    name: String;

    onInit(scene: Scene, camera: PerspectiveCamera): void;

    onRender(): void;

    onDestroy(): void;
}
