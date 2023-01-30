import type {Effect} from "@/effects/effect";
import type {PerspectiveCamera, Scene} from "three";

export default class DebugEffect implements Effect {
    name = "debug";

    onDestroy(): void {
        alert("DESTROY")
    }

    onInit(scene: Scene, camera: PerspectiveCamera): void {
        alert("INIT")
    }

    onRender(): void {
        console.log("render")
    }

}
