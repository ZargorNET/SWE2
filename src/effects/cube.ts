import type {Effect} from "@/effects/effect";
import type {Results} from "@mediapipe/holistic";
import type {Video} from "@/video";
import type {Camera, Scene} from "three";
import {AmbientLight, AnimationMixer, Clock, Group, PointLight, Vector2} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import ionModel from "./PrimaryIonDrive.glb?url";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {toRaw} from "vue";

export class CubeEffect implements Effect {
    name: String = "Cube";

    onAIResults(results: Results): void {
        if (results.faceLandmarks.length > 1) {
            const nose = results.faceLandmarks[1];

            let x = (nose.x - 0.5);
            let y = (nose.y - 0.5);

            if (Math.abs(x) < 0.05)
                x = 0;
            if (Math.abs(y) < 0.05)
                y = 0;

            this.currentRotation = new Vector2(x, y);
        }


        if (results.rightHandLandmarks != null) {
            if (this.isHandRemovedAgain) {
                this.isHandRemovedAgain = false;

                this.clipAction.paused = !this.clipAction.paused;
            }
        } else {
            this.isHandRemovedAgain = true;
        }
    }

    onDestroy(): void {
        this.composer.renderer.toneMappingExposure = 1;
        if (this.bloomPass != null)
            this.composer.removePass(toRaw(this.bloomPass));
    }

    mixer: AnimationMixer = null!;
    currentRotation: Vector2 = new Vector2(0, 0);
    clock: Clock = new Clock();

    obj: Group = null!;

    composer: EffectComposer = null!;
    bloomPass: UnrealBloomPass = null!;

    // @ts-ignore
    clipAction: AnimationAction = null!;

    isHandRemovedAgain = true;

    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void {
        this.composer = composer;

        scene.add(new AmbientLight(0x404040));
        const pointLight = new PointLight(0xffffff, 1);
        camera.add(pointLight);

        this.bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0;
        this.bloomPass.strength = 1.5;
        this.bloomPass.radius = 0;
        composer.addPass(toRaw(this.bloomPass));

        composer.renderer.toneMappingExposure = Math.pow(2, 4);

        const loader = new GLTFLoader();

        loader.load(ionModel, (gltf) => {
            this.obj = gltf.scene;
            const model = gltf.scene;

            scene.add(model);

            const clip = gltf.animations[0];
            this.mixer = new AnimationMixer(model);
            this.clipAction = this.mixer.clipAction(clip.optimize());
            this.clipAction.play();
        });
    }

    onRender(): void {
        const delta = this.clock.getDelta();

        //    this.obj.rotateX(this.currentRotation.y * delta);
        this.obj?.rotateY(this.currentRotation.x * delta);

        this.mixer?.update(delta);
    }

}
