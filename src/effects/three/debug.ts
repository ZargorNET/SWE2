import type {Scene} from "three";
import {BoxGeometry, BufferGeometry, Camera, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3} from "three";
import type {Video} from "@/video";
import type {Results} from "@mediapipe/holistic";
import type {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import type ThreeEffect from "@/effects/three_effect";
import type {HolisticEffect} from "@/effects/ai_results_effect";

export default class DebugEffect implements ThreeEffect, HolisticEffect {
    name = "debug";

    scene: Scene = null!;

    camera: Camera = null!;

    onDestroy(): void {
        console.log("DESTROY");
    }

    onInit(scene: Scene, camera: Camera, video: Video, composer: EffectComposer): void {
        console.log("Initializing debug...");
        this.scene = scene;
        this.camera = camera;
        const geometry = new BoxGeometry(5, 5, 5);
        const material = new MeshBasicMaterial({map: video.videoTexture});
        const cube = new Mesh(geometry, material);


        const lineMat = new LineBasicMaterial({color: 0x00FF00});
        const line = new Line(undefined, lineMat);
        line.name = "yLine";

        scene.add(cube);
        scene.add(line);
    }

    onHolisticAIResults(results: Results): void {
        const nose = results.faceLandmarks[1];

        console.log(nose);
        const points = [];
        points.push(new Vector3(-5, -nose.y, -1));
        points.push(new Vector3(5, -nose.y, -1));

        const geometry = new BufferGeometry().setFromPoints(points);

        (this.scene.getObjectByName("yLine") as Line).geometry = geometry;
    }


    onRender(): void {
        console.log("render")
    }

}
