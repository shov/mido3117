declare module "Container" {
    export class Container {
        private store;
        register(name: string, resolver: any, deps?: string[]): void;
        registerObject(name: string, reference: any): void;
        get(name: string): any;
    }
}
declare module "EventBus" {
    export class EventBus {
        private store;
        on(name: string, cb: (msg: string) => void): void;
        emit(name: string, ...args: any[]): void;
    }
}
declare module "ImageModifier" {
    import { EventBus } from "EventBus";
    export class ImageModifier {
        protected _bus: EventBus;
        protected _ctx?: CanvasRenderingContext2D;
        protected _originImageData?: ImageData;
        protected _dependedButtons: HTMLElement[];
        constructor(_bus: EventBus);
        initWith(ctx: CanvasRenderingContext2D): ImageModifier;
        protected _xReset(): void;
        protected _xInvert(): void;
        protected _xGrayScale(): void;
        protected _mustBeInitialized(): void;
    }
}
declare module "ImageLoader" {
    import { EventBus } from "EventBus";
    import { ImageModifier } from "ImageModifier";
    export class ImageLoader {
        protected _bus: EventBus;
        protected _imageModifier: ImageModifier;
        protected _loadBt: HTMLInputElement;
        constructor(_bus: EventBus, _imageModifier: ImageModifier);
        protected _loadImage(): void;
        protected _createImage(imageResult: string | ArrayBuffer): void;
        protected _imageLoaded(img: HTMLImageElement): void;
    }
}
declare module "main" { }
