import type {Effect} from "@/effects/effect";

export default interface CanvasEffect extends Effect {
    onInit(ctx: CanvasRenderingContext2D): void;
}
