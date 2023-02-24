import type {Results} from "@mediapipe/holistic";

export interface HolisticEffect {
    onHolisticAIResults(results: Results): void;
}
