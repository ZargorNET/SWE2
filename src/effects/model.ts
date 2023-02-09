import type {Effect} from "@/effects/effect";
import type {Results} from "@mediapipe/holistic";
import type {Camera, Scene} from "three";
import {AmbientLight, Color, Fog, SkeletonHelper} from "three";
import type {Video} from "@/video";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import modelUrl from "./model/obj.gltf?url";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {toRaw} from "vue";

export default class ModelEffect implements Effect {
    name: String = "Model";

    onAIResults(results: Results): void {
    }

    onDestroy(): void {
    }

    skeleton: SkeletonHelper = null!;

    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void {
        scene.add(new AmbientLight(0x404040, 10));
        scene.background = new Color(0xa0a0a0);
        scene.fog = new Fog(0xa0a0a0, 10, 50);

        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf => {
            const model = gltf.scene;
            scene.add(model);


            this.skeleton = new SkeletonHelper(model);
            this.skeleton.visible = true;
            scene.add(toRaw(this.skeleton));
        }));
    }

    onRender(): void {

    }
}
