import type {HolisticEffect} from "@/effects/ai_results_effect";
import type {Results} from "@mediapipe/holistic";
import {POSE_LANDMARKS} from "@mediapipe/holistic";
import type CanvasEffect from "@/effects/canvas_effect";
import {Clock, Vector2} from "three";

export default class PongGameEffect implements CanvasEffect, HolisticEffect {
    name = "Pong Game";

    private nose: { x: number, y: number } = {x: 0, y: 0};
    private clock: Clock = new Clock();
    private pong: { x: number, y: number, accX: number, accY: number } = {x: 0, y: 0, accX: 0, accY: 0};
    private barrier: { pos: Vector2, w: number, h: number, accX: number, accY: number } = {
        pos: new Vector2(0, 0),
        w: 300,
        h: 20,
        accX: 0,
        accY: 0
    };
    private ctx: CanvasRenderingContext2D = null!;

    onInit(ctx: CanvasRenderingContext2D): void {
        this.ctx = ctx;

        this.pong.x = this.ctx.canvas.width / 2;
        this.pong.y = 100;
        this.barrier.pos = new Vector2(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
    }

    onDestroy(): void {
    }

    onHolisticAIResults(results: Results): void {
        const nose = results.poseLandmarks[POSE_LANDMARKS.NOSE];
        this.nose = {x: (1 - nose.x) * this.ctx.canvas.width, y: nose.y * this.ctx.canvas.height};
    }

    onRender(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const dt = this.clock.getDelta();
        const pongRadius = 20;

        // Set position of collider/barrier to nose
        this.barrier.accX = this.nose.x - this.barrier.pos.x;
        this.barrier.accY = this.nose.y - this.barrier.pos.y;

        // Set positions based on acc
        this.barrier.pos.x += this.barrier.accX * dt;
        this.barrier.pos.y += this.barrier.accY * dt;

        this.pong.x += this.pong.accX * dt;
        this.pong.y += this.pong.accY * dt;


        // Barrier collider checking
        if (this.pong.x + pongRadius > this.barrier.pos.x - this.barrier.w / 2
            && this.pong.x - pongRadius < this.barrier.pos.x + this.barrier.w / 2
            && this.pong.y + pongRadius > this.barrier.pos.y - this.barrier.h / 2
            && this.pong.y - pongRadius < this.barrier.pos.y + this.barrier.h / 2) {

            this.pong.accX = 0;
            this.pong.accY = 0;
            this.pong.accX += this.barrier.accX;
            this.pong.accY += -100 + this.barrier.accY;
        }

        // Apply acc limits and "physics"/gracity
        this.pong.accX = Math.max(-100, Math.min(this.pong.accX, 100));
        this.pong.accY = Math.max(-100, Math.min(this.pong.accY + 50 * dt, 100));

        this.barrier.accX = Math.max(-500, Math.min(this.barrier.accX - 100 * dt, 500));
        this.barrier.accY = Math.max(-500, Math.min(this.barrier.accY - 100 * dt, 500));

        // Bounds checking
        if (this.pong.x < 0 || this.pong.x > this.ctx.canvas.width) {
            this.pong.accX *= -2;
        }
        if (this.pong.y < 0) {
            this.pong.accY *= -2;
        }

        // Game over bounds checking
        if (this.pong.y > this.ctx.canvas.height) {
            this.pong.x = this.ctx.canvas.width / 2;
            this.pong.y = 100;
            this.pong.accX = 0;
            this.pong.accY = 0;

            this.ctx.fillStyle = "red";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }

        // Do not allow barrier to go out of bounds
        if (this.barrier.pos.x < 0) {
            this.barrier.pos.x = 0;
            this.barrier.accX = 0;
        }
        if (this.barrier.pos.x > this.ctx.canvas.width) {
            this.barrier.pos.x = this.ctx.canvas.width;
            this.barrier.accX = 0;
        }

        // Render

        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.barrier.pos.x - this.barrier.w / 2, this.barrier.pos.y - this.barrier.h / 2, this.barrier.w, this.barrier.h);

        this.ctx.fillStyle = "green";
        this.ctx.arc(this.barrier.pos.x, this.barrier.pos.y, 10, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.fillStyle = "white";
        this.ctx.arc(this.pong.x, this.pong.y, pongRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.fillStyle = "yellow";
        this.ctx.arc(this.nose.x, this.nose.y, 10, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }

}
