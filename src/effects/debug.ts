import type {Effect} from "@/effects/effect";
import type {Scene} from "three";
import {BoxGeometry, BufferGeometry, Camera, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3} from "three";
import type {Video} from "@/video";
import type {Results} from "@mediapipe/holistic";

export default class DebugEffect implements Effect {
    name = "debug";

    onDestroy(): void {
        alert("DESTROY")
    }


    scene: Scene = null!;
    camera: Camera = null!;

    onInit(scene: Scene, camera: Camera, video: Video): void {
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

    onAIResults(results: Results): void {
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
