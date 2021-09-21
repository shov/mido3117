declare module "colorsys" {
    export namespace colorsys {
        export function rgb2Hsl(r: any, g: any, b: any): {
            h: number;
            s: number;
            l: number;
        };
        export function rgb_to_hsl(r: any, g: any, b: any): {
            h: number;
            s: number;
            l: number;
        };
        import rgbToHsl = rgb2Hsl;
        export { rgbToHsl };
        export function rgb2Hsv(r: any, g: any, b: any): {
            h: number;
            s: number;
            v: number;
        };
        export function rgb_to_hsv(r: any, g: any, b: any): {
            h: number;
            s: number;
            v: number;
        };
        import rgbToHsv = rgb2Hsv;
        export { rgbToHsv };
        export function hsl2Rgb(h: any, s: any, l: any): {
            r: number;
            g: number;
            b: number;
        };
        export function hsl_to_rgb(h: any, s: any, l: any): {
            r: number;
            g: number;
            b: number;
        };
        import hslToRgb = hsl2Rgb;
        export { hslToRgb };
        export function hsv2Rgb(h: any, s: any, v: any): {
            r: number;
            g: number;
            b: number;
        };
        import hsv_to_rgb = hsv2Rgb;
        export { hsv_to_rgb };
        import hsvToRgb = hsv2Rgb;
        export { hsvToRgb };
        export function rgb2Hex(r: any, g: any, b: any): string;
        export function rgb_to_hex(r: any, g: any, b: any): string;
        import rgbToHex = rgb2Hex;
        export { rgbToHex };
        export function hex2Rgb(hex: any): {
            r: number;
            g: number;
            b: number;
        } | null;
        export function hex_to_rgb(hex: any): {
            r: number;
            g: number;
            b: number;
        } | null;
        import hexToRgb = hex2Rgb;
        export { hexToRgb };
        export function hsv2Hex(h: any, s: any, v: any): string;
        import hsv_to_hex = hsv2Hex;
        export { hsv_to_hex };
        import hsvToHex = hsv2Hex;
        export { hsvToHex };
        export function hex2Hsv(hex: any): any;
        export function hex_to_hsv(hex: any): any;
        import hexToHsv = hex2Hsv;
        export { hexToHsv };
        export function hsl2Hex(h: any, s: any, l: any): string;
        export function hsl_to_hex(h: any, s: any, l: any): string;
        import hslToHex = hsl2Hex;
        export { hslToHex };
        export function hex2Hsl(hex: any): any;
        export function hex_to_hsl(hex: any): any;
        import hexToHsl = hex2Hsl;
        export { hexToHsl };
        export function rgb2cmyk(r: any, g: any, b: any): {
            c: string;
            m: string;
            y: string;
            k: string;
        };
        export const rgb_to_cmyk: any;
        export const rgbToCmyk: any;
        export function cmyk2rgb(c: any, m: any, y: any, k: any): {
            r: number;
            g: number;
            b: number;
        };
        export const cmyk_to_rgb: any;
        export const cmykToRgb: any;
        export function hsv2Hsl(h: any, s: any, v: any): {
            h: any;
            s: any;
            l: number;
        };
        export function hsv_to_hsl(h: any, s: any, v: any): {
            h: any;
            s: any;
            l: number;
        };
        import hsvToHsl = hsv2Hsl;
        export { hsvToHsl };
        export function hsl2Hsv(h: any, s: any, l: any): {
            h: any;
            s: number;
            v: number;
        };
        export function hsl_to_hsv(h: any, s: any, l: any): {
            h: any;
            s: number;
            v: number;
        };
        import hslToHsv = hsl2Hsv;
        export { hslToHsv };
    }
}
declare module "ColourUtils" {
    type T_RGBPcl = {
        r: number;
        g: number;
        b: number;
    };
    type T_HSVPcl = {
        h: number;
        s: number;
        v: number;
    };
    export class PixelUtils {
        RBGToHSV({ r, g, b }: T_RGBPcl): T_HSVPcl;
        HSVToRGB({ h, s, v }: T_HSVPcl): T_RGBPcl;
        protected int0to255(n: number): void;
        protected realInRange(n: number, a?: number, b?: number): void;
    }
    export class ThirdPartyPixelUtils extends PixelUtils {
        RBGToHSV({ r, g, b }: T_RGBPcl): T_HSVPcl;
        HSVToRGB({ h, s, v }: T_HSVPcl): T_RGBPcl;
    }
    export class MatrixUtils {
        protected _pcl: PixelUtils;
        RBGToHSV(rgbMatrix: Uint8ClampedArray | number[]): number[];
        HSVToRGB(hsvMatrix: number[]): number[];
    }
    export interface IColourUtils {
        pcl: PixelUtils;
        matrix: MatrixUtils;
    }
    export const colourUtils: IColourUtils;
}
declare module "BrightChartControl" {
    import { IColourUtils } from "ColourUtils";
    type Chart = any;
    export class BrightChartControl {
        protected _utils: IColourUtils;
        protected _chartCanvas: HTMLCanvasElement;
        protected _ctx?: CanvasRenderingContext2D;
        protected _chart?: Chart;
        constructor(_utils: IColourUtils);
        insertChart(ctx: CanvasRenderingContext2D): void;
    }
}
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
    import { IColourUtils } from "ColourUtils";
    import { BrightChartControl } from "BrightChartControl";
    export class ImageModifier {
        protected _bus: EventBus;
        protected _utils: IColourUtils;
        protected _bcControl: BrightChartControl;
        protected _ctx?: CanvasRenderingContext2D;
        protected _originImageData?: ImageData;
        protected _dependedButtons: HTMLElement[];
        constructor(_bus: EventBus, _utils: IColourUtils, _bcControl: BrightChartControl);
        initWith(ctx: CanvasRenderingContext2D): ImageModifier;
        protected _xReset(): void;
        protected _xInvert(): void;
        protected _xGrayScale(): void;
        protected _xMakeBrighter(): void;
        protected _mustBeInitialized(): void;
    }
}
declare module "ImageLoader" {
    import { EventBus } from "EventBus";
    import { ImageModifier } from "ImageModifier";
    import { BrightChartControl } from "BrightChartControl";
    export class ImageLoader {
        protected _bus: EventBus;
        protected _imageModifier: ImageModifier;
        protected _brightChartControl: BrightChartControl;
        protected _loadBt: HTMLInputElement;
        constructor(_bus: EventBus, _imageModifier: ImageModifier, _brightChartControl: BrightChartControl);
        protected _loadImage(): void;
        protected _createImage(imageResult: string | ArrayBuffer): void;
        protected _imageLoaded(img: HTMLImageElement): void;
    }
}
declare module "main" { }
