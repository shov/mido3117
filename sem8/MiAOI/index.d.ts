declare module "Container" {
    export class Container {
        private store;
        register(name: string, resolver: any, deps?: never[]): void;
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
declare module "ImageLoader" {
    import { EventBus } from "EventBus";
    export class ImageLoader {
        protected _bus: EventBus;
        protected _loadBt: HTMLInputElement;
        constructor(_bus: EventBus);
        protected _loadImage(): void;
        protected _createImage(imageResult: string | ArrayBuffer): void;
        protected _imageLoaded(img: HTMLImageElement): void;
    }
}
declare module "main" { }
