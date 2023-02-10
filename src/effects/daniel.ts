import type {Effect} from "@/effects/effect";
import type {NormalizedLandmark, Results} from "@mediapipe/holistic";
import type {Video} from "@/video";
import {Mesh, MeshBasicMaterial, SphereGeometry, type Camera, type Scene} from "three";
import {AmbientLight, AnimationMixer, Clock, Group, PointLight, Vector2} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import ionModel from "./PrimaryIonDrive.glb?url";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {toRaw} from "vue";

class Sphere {
    constructor(public object: Mesh, public lifetime: number) {}   
}

export class DanielEffect implements Effect {
    name: String = "Daniel";
    nose: NormalizedLandmark | undefined;
    onAIResults(results: Results): void {
        if (results.faceLandmarks.length > 1) {
            this.nose = results.faceLandmarks[1];

        }
    }

    onDestroy(): void {
        this.composer.renderer.toneMappingExposure = 1;
        if (this.bloomPass != null)
            this.composer.removePass(toRaw(this.bloomPass));
    }

    mixer: AnimationMixer = null!;
    clock: Clock = new Clock();

    obj: Group = null!;
    scene: Scene = null!;
    spheres: Sphere[]  = [];

    composer: EffectComposer = null!;
    bloomPass: UnrealBloomPass = null!;

    // @ts-ignore
    clipAction: AnimationAction = null!;

    isHandRemovedAgain = true;

    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void {
        this.composer = composer;

        scene.add(new AmbientLight(0x404040));
        const pointLight = new PointLight(0xffffff, 1);
        this.scene = scene;
        camera.add(pointLight);

        this.bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0;
        this.bloomPass.strength = 1.5;
        this.bloomPass.radius = 0;
        composer.addPass(toRaw(this.bloomPass));

        composer.renderer.toneMappingExposure = Math.pow(2, 4);

        camera.position.set(0,0,-50)

    }

    onRender(): void {
        const delta = this.clock.getDelta();
        
        

        if(this.nose) {
            const geometry = new SphereGeometry( 1, 32, 16 );
            const material = new MeshBasicMaterial( { color: 0xffff00 } );
            const object = new Mesh( geometry, material );
            let transformed = transform(this.nose.x, this.nose.y);
            object.position.set(transformed.x, transformed.y, 0)
            console.log(this.nose.x, this.nose.y)
            console.log(transformed)
            this.scene.add(object);
            this.spheres.push(new Sphere(object, 0))
        }

        toRaw(this.spheres).forEach((s) => {
            s.lifetime += delta;
        });

        
        toRaw(this.spheres).forEach((s) => {
            if(s.lifetime >= 1) {
                this.scene.remove(s.object);
                this.spheres = toRaw(this.spheres).filter((x) => x !== s );
            }
        });

        this.mixer?.update(delta);
    }


}

function transform(x: number, y:number) {
        return {
            x: (x*2-1)*75,
            y: -(y*2-1)*32
        }
}