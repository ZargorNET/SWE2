export interface Effect {
    name: String;

    onRender(): void;

    onDestroy(): void;
}
