import type {Scene} from "three";
import {AmbientLight, BoxGeometry, Camera, Mesh, MeshBasicMaterial,} from "three";
import type {Video} from "@/video";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import type ThreeEffect from "@/effects/three_effect";

export default class CubeEffect implements ThreeEffect {
    name = "Cube (donk)";

    scene: Scene = null!;

    camera: Camera = null!;

    onDestroy(): void {
    }

    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void {
        console.log("Initializing debug...");
        this.scene = scene;
        this.camera = camera;
        const geometry = new BoxGeometry(5, 5, 5);
        const material = new MeshBasicMaterial({map: video.videoTexture});
        const cube = new Mesh(geometry, material);


        scene.add(new AmbientLight(0x404040));

        scene.add(cube);
    }

    onRender(): void {
    }

}
