define("colorsys", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.colorsys = void 0;
    const RGB_MAX = 255;
    const HUE_MAX = 360;
    const SV_MAX = 100;
    exports.colorsys = {};
    exports.colorsys.rgb2Hsl = function (r, g, b) {
        if (typeof r === 'object') {
            const args = r;
            r = args.r;
            g = args.g;
            b = args.b;
        }
        r = (r === RGB_MAX) ? 1 : (r % RGB_MAX / parseFloat(RGB_MAX));
        g = (g === RGB_MAX) ? 1 : (g % RGB_MAX / parseFloat(RGB_MAX));
        b = (b === RGB_MAX) ? 1 : (b % RGB_MAX / parseFloat(RGB_MAX));
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.floor(h * HUE_MAX),
            s: Math.floor(s * SV_MAX),
            l: Math.floor(l * SV_MAX)
        };
    };
    exports.colorsys.rgb_to_hsl = exports.colorsys.rgbToHsl = exports.colorsys.rgb2Hsl;
    exports.colorsys.rgb2Hsv = function (r, g, b) {
        if (typeof r === 'object') {
            const args = r;
            r = args.r;
            g = args.g;
            b = args.b;
        }
        r = (r === RGB_MAX) ? 1 : (r % RGB_MAX / parseFloat(RGB_MAX));
        g = (g === RGB_MAX) ? 1 : (g % RGB_MAX / parseFloat(RGB_MAX));
        b = (b === RGB_MAX) ? 1 : (b % RGB_MAX / parseFloat(RGB_MAX));
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.floor(h * HUE_MAX),
            s: Math.floor(s * SV_MAX),
            v: Math.floor(v * SV_MAX)
        };
    };
    exports.colorsys.rgb_to_hsv = exports.colorsys.rgbToHsv = exports.colorsys.rgb2Hsv;
    exports.colorsys.hsl2Rgb = function (h, s, l) {
        if (typeof h === 'object') {
            const args = h;
            h = args.h;
            s = args.s;
            l = args.l;
        }
        var r, g, b;
        h = (h === HUE_MAX) ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX));
        s = (s === SV_MAX) ? 1 : (s % SV_MAX / parseFloat(SV_MAX));
        l = (l === SV_MAX) ? 1 : (l % SV_MAX / parseFloat(SV_MAX));
        if (s === 0) {
            r = g = b = l;
        }
        else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * RGB_MAX), g: Math.round(g * RGB_MAX), b: Math.round(b * RGB_MAX) };
    };
    exports.colorsys.hsl_to_rgb = exports.colorsys.hslToRgb = exports.colorsys.hsl2Rgb;
    exports.colorsys.hsv2Rgb = function (h, s, v) {
        if (typeof h === 'object') {
            const args = h;
            h = args.h;
            s = args.s;
            v = args.v;
        }
        h = (h === HUE_MAX) ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX) * 6);
        s = (s === SV_MAX) ? 1 : (s % SV_MAX / parseFloat(SV_MAX));
        v = (v === SV_MAX) ? 1 : (v % SV_MAX / parseFloat(SV_MAX));
        var i = Math.floor(h);
        var f = h - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        var mod = i % 6;
        var r = [v, q, p, p, t, v][mod];
        var g = [t, v, v, q, p, p][mod];
        var b = [p, p, t, v, v, q][mod];
        return { r: Math.round(r * RGB_MAX), g: Math.round(g * RGB_MAX), b: Math.round(b * RGB_MAX) };
    };
    exports.colorsys.hsv_to_rgb = exports.colorsys.hsv2Rgb;
    exports.colorsys.hsvToRgb = exports.colorsys.hsv2Rgb;
    exports.colorsys.rgb2Hex = function (r, g, b) {
        if (typeof r === 'object') {
            const args = r;
            r = args.r;
            g = args.g;
            b = args.b;
        }
        r = Math.round(r).toString(16);
        g = Math.round(g).toString(16);
        b = Math.round(b).toString(16);
        r = r.length === 1 ? '0' + r : r;
        g = g.length === 1 ? '0' + g : g;
        b = b.length === 1 ? '0' + b : b;
        return '#' + r + g + b;
    };
    exports.colorsys.rgb_to_hex = exports.colorsys.rgbToHex = exports.colorsys.rgb2Hex;
    exports.colorsys.hex2Rgb = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    exports.colorsys.hex_to_rgb = exports.colorsys.hexToRgb = exports.colorsys.hex2Rgb;
    exports.colorsys.hsv2Hex = function (h, s, v) {
        var rgb = exports.colorsys.hsv2Rgb(h, s, v);
        return exports.colorsys.rgb2Hex(rgb.r, rgb.g, rgb.b);
    };
    exports.colorsys.hsv_to_hex = exports.colorsys.hsv2Hex;
    exports.colorsys.hsvToHex = exports.colorsys.hsv2Hex;
    exports.colorsys.hex2Hsv = function (hex) {
        var rgb = exports.colorsys.hex2Rgb(hex);
        return exports.colorsys.rgb2Hsv(rgb.r, rgb.g, rgb.b)[0];
    };
    exports.colorsys.hex_to_hsv = exports.colorsys.hexToHsv = exports.colorsys.hex2Hsv;
    exports.colorsys.hsl2Hex = function (h, s, l) {
        var rgb = exports.colorsys.hsl2Rgb(h, s, l);
        return exports.colorsys.rgb2Hex(rgb.r, rgb.g, rgb.b);
    };
    exports.colorsys.hsl_to_hex = exports.colorsys.hslToHex = exports.colorsys.hsl2Hex;
    exports.colorsys.hex2Hsl = function (hex) {
        var rgb = exports.colorsys.hex2Rgb(hex);
        return exports.colorsys.rgb2Hsl(rgb.r, rgb.g, rgb.b)[0];
    };
    exports.colorsys.hex_to_hsl = exports.colorsys.hexToHsl = exports.colorsys.hex2Hsl;
    exports.colorsys.rgb2cmyk = function (r, g, b) {
        if (typeof r === 'object') {
            const args = r;
            r = args.r;
            g = args.g;
            b = args.b;
        }
        var rprim = r / 255;
        var gprim = g / 255;
        var bprim = b / 255;
        var k = 1 - Math.max(rprim, gprim, bprim);
        var c = (1 - rprim - k) / (1 - k);
        var m = (1 - gprim - k) / (1 - k);
        var y = (1 - bprim - k) / (1 - k);
        return {
            c: c.toFixed(3),
            m: m.toFixed(3),
            y: y.toFixed(3),
            k: k.toFixed(3)
        };
    };
    exports.colorsys.rgb_to_cmyk = exports.colorsys.rgbToCmyk = exports.colorsys.rgb2Cmyk;
    exports.colorsys.cmyk2rgb = function (c, m, y, k) {
        if (typeof c === 'object') {
            const args = c;
            c = args.c;
            m = args.m;
            y = args.y;
            k = args.k;
        }
        var r = 255 * (1 - c) * (1 - k);
        var g = 255 * (1 - m) * (1 - k);
        var b = 255 * (1 - y) * (1 - k);
        return {
            r: Math.floor(r),
            g: Math.floor(g),
            b: Math.floor(b)
        };
    };
    exports.colorsys.cmyk_to_rgb = exports.colorsys.cmykToRgb = exports.colorsys.cmyk2Rgb;
    exports.colorsys.hsv2Hsl = function (h, s, v) {
        if (typeof h === 'object') {
            const args = h;
            h = args.h;
            s = args.s;
            v = args.v;
        }
        var l = (2 - s) * v / 2;
        if (l !== 0) {
            if (l === SV_MAX) {
                s = 0;
            }
            else if (l < SV_MAX / 2) {
                s = s * v / (l * 2);
            }
            else {
                s = s * v / (2 - l * 2);
            }
        }
        return { h, s, l };
    };
    exports.colorsys.hsv_to_hsl = exports.colorsys.hsvToHsl = exports.colorsys.hsv2Hsl;
    exports.colorsys.hsl2Hsv = function (h, s, l) {
        if (typeof h === 'object') {
            const args = h;
            h = args.h;
            s = args.s;
            l = args.l;
        }
        s = s * (l < 50 ? l : (100 - l));
        return {
            h: h,
            s: Math.floor(2 * s / (l + s)),
            v: Math.floor(l + s),
        };
    };
    exports.colorsys.hsl_to_hsv = exports.colorsys.hslToHsv = exports.colorsys.hsl2Hsv;
});
define("ColourUtils", ["require", "exports", "colorsys"], function (require, exports, colorsys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.colourUtils = exports.MatrixUtils = exports.ThirdPartyPixelUtils = exports.PixelUtils = void 0;
    class PixelUtils {
        RBGToHSV({ r, g, b }) {
            this.int0to255(r);
            this.int0to255(g);
            this.int0to255(b);
            const [dR, dG, dB] = [r, g, b].map(v255 => v255 / 255);
            const [min, , max] = [dR, dG, dB].sort((a, b) => a - b);
            let hDelta, addDegree;
            switch (true) {
                case (dR === max && dG >= dB):
                    hDelta = dG - dB;
                    addDegree = 0;
                    break;
                case (dR === max):
                    hDelta = dG - dB;
                    addDegree = 360;
                    break;
                case (dG === max):
                    hDelta = dB - dR;
                    addDegree = 120;
                    break;
                case (dB === max):
                    hDelta = dR - dG;
                    addDegree = 240;
                    break;
                default:
                    throw new Error('Wrong max calculation!');
            }
            const h = max === min ? 0 : 60 * (hDelta / (max - min)) + addDegree;
            const s = max > 0 ? Math.round((1 - min / max) * 100) : 0;
            const v = Math.round(max * 100);
            return { h, s, v };
        }
        HSVToRGB({ h, s, v }) {
            this.realInRange(h, 0, 360);
            this.realInRange(s, 0, 100);
            this.realInRange(v, 0, 100);
            const h_i = Math.floor(h / 60) % 6;
            const v_min = ((100 - s) * v) / 100;
            const a = (v - v_min) * ((h % 60) / 60);
            const v_inc = v_min + a;
            const v_dec = v - a;
            const realRGB = [
                [v, v_inc, v_min],
                [v_dec, v, v_min],
                [v_min, v, v_inc],
                [v_min, v_dec, v],
                [v_inc, v_min, v],
                [v, v_min, v_dec],
            ][h_i];
            const rgb255 = realRGB.map(percent => Math.floor(percent * 255 / 100));
            const [r, g, b] = rgb255;
            return { r, g, b };
        }
        int0to255(n) {
            if (n < 0 || n > 255 || Math.floor(n) !== n) {
                throw new TypeError('Value is not an int or not in in [0,255] range!');
            }
        }
        realInRange(n, a = 0, b = 1) {
            if (n < a || n > b) {
                throw new TypeError(`Value is over the range [${a},${b}] !`);
            }
        }
    }
    exports.PixelUtils = PixelUtils;
    class ThirdPartyPixelUtils extends PixelUtils {
        RBGToHSV({ r, g, b }) {
            return colorsys_1.colorsys.rgb2Hsv({ r, g, b });
        }
        HSVToRGB({ h, s, v }) {
            return colorsys_1.colorsys.hsv2Rgb({ h, s, v });
        }
    }
    exports.ThirdPartyPixelUtils = ThirdPartyPixelUtils;
    class MatrixUtils {
        constructor() {
            this._pcl = new PixelUtils();
        }
        RBGToHSV(rgbMatrix) {
            const result = [];
            for (let i = 0; i < rgbMatrix.length; i += 4) {
                const hsv = this._pcl.RBGToHSV({
                    r: rgbMatrix[i],
                    g: rgbMatrix[i + 1],
                    b: rgbMatrix[i + 2],
                });
                result.push(hsv.h);
                result.push(hsv.s);
                result.push(hsv.v);
                result.push(rgbMatrix[i + 3]);
            }
            return result;
        }
        HSVToRGB(hsvMatrix) {
            const result = [];
            for (let i = 0; i < hsvMatrix.length; i += 4) {
                const rgb = this._pcl.HSVToRGB({
                    h: hsvMatrix[i],
                    s: hsvMatrix[i + 1],
                    v: hsvMatrix[i + 2],
                });
                result.push(rgb.r);
                result.push(rgb.g);
                result.push(rgb.b);
                result.push(hsvMatrix[i + 3]);
            }
            return result;
        }
    }
    exports.MatrixUtils = MatrixUtils;
    exports.colourUtils = {
        pcl: new PixelUtils(),
        matrix: new MatrixUtils(),
    };
});
define("BrightChartControl", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrightChartControl = void 0;
    class BrightChartControl {
        constructor(_utils) {
            this._utils = _utils;
            this._chartCanvas = document.querySelector('#x_br_chart');
        }
        insertChart(ctx) {
            this._ctx = ctx;
            if (this._chart) {
                this._chart.destroy();
            }
            const options = {
                type: 'line',
                data: {
                    labels: ['a', 'b', 'c', 'd'],
                    datasets: [{
                            label: 'brightness',
                            data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                            borderWidth: 1,
                            pointHitRadius: 25
                        }]
                },
                options: {
                    scales: {
                        y: {
                            max: 100,
                            min: 0
                        }
                    },
                    responsive: false,
                    onHover: function (e) {
                        const point = e.chart.getElementsAtEventForMode(e, 'nearest', {
                            intersect: true
                        }, false);
                        if (point.length)
                            e.native.target.style.cursor = 'grab';
                        else
                            e.native.target.style.cursor = 'default';
                    },
                    plugins: {
                        dragData: {
                            round: 1,
                            showTooltip: true,
                            onDragStart: function (e) {
                            },
                            onDrag: function (e, datasetIndex, index, value) {
                                e.target.style.cursor = 'grabbing';
                            },
                            onDragEnd: function (e, datasetIndex, index, value) {
                                e.target.style.cursor = 'default';
                            },
                        }
                    }
                }
            };
            let chartCtx = this._chartCanvas.getContext('2d');
            this._chart = new Chart(chartCtx, options);
        }
    }
    exports.BrightChartControl = BrightChartControl;
});
define("Container", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Container = void 0;
    class Container {
        constructor() {
            this.store = {};
        }
        register(name, resolver, deps = []) {
            this.store[name] = {
                resolver, deps
            };
        }
        registerObject(name, reference) {
            this.store[name] = reference;
        }
        get(name) {
            var _a, _b, _c, _d, _e, _f;
            if ('function' === typeof ((_a = this.store[name]) === null || _a === void 0 ? void 0 : _a.resolver)
                && ((_d = (_c = (_b = this.store[name]) === null || _b === void 0 ? void 0 : _b.resolver) === null || _c === void 0 ? void 0 : _c.prototype) === null || _d === void 0 ? void 0 : _d.constructor)) {
                const deps = (((_e = this.store[name]) === null || _e === void 0 ? void 0 : _e.deps) || []).map((depName) => this.get(depName));
                return new ((_f = this.store[name]) === null || _f === void 0 ? void 0 : _f.resolver)(...deps);
            }
            return this.store[name];
        }
    }
    exports.Container = Container;
});
define("EventBus", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventBus = void 0;
    class EventBus {
        constructor() {
            this.store = {};
        }
        on(name, cb) {
            if (!Array.isArray(this.store[name])) {
                this.store[name] = [];
            }
            this.store[name].push(cb);
        }
        emit(name, ...args) {
            ;
            (this.store[name] || [])
                .forEach((cb) => Promise.resolve(cb(...args))
                .catch(e => this.emit('error', `Event listener for ${name} failed!`)));
        }
    }
    exports.EventBus = EventBus;
});
define("ImageModifier", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImageModifier = void 0;
    class ImageModifier {
        constructor(_bus, _utils, _bcControl) {
            this._bus = _bus;
            this._utils = _utils;
            this._bcControl = _bcControl;
            this._dependedButtons = [];
            Object.entries({
                '#x_reset': this._xReset,
                '#x_invert': this._xInvert,
                '#x_grayscale': this._xGrayScale,
                '#x_make_brighter': this._xMakeBrighter,
            }).forEach(([selector, cb]) => {
                const bt = document.querySelector(selector);
                bt.addEventListener('click', cb.bind(this));
                this._dependedButtons.push(bt);
            });
        }
        initWith(ctx) {
            this._ctx = ctx;
            this._originImageData = ctx
                .getImageData(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
            this._dependedButtons.forEach((bt) => {
                bt.classList.remove('_disabled');
            });
            this._bcControl.insertChart(this._ctx);
            return this;
        }
        _xReset() {
            if (!this._ctx || !this._originImageData) {
                return;
            }
            this._ctx.putImageData(this._originImageData, 0, 0);
            this._bcControl.insertChart(this._ctx);
        }
        _xInvert() {
            if (!this._ctx) {
                return;
            }
            const canvas = this._ctx.canvas;
            const imageData = this._ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            this._ctx.putImageData(imageData, 0, 0);
        }
        _xGrayScale() {
            if (!this._ctx) {
                return;
            }
            const canvas = this._ctx.canvas;
            const imageData = this._ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            this._ctx.putImageData(imageData, 0, 0);
        }
        _xMakeBrighter() {
            if (!this._ctx) {
                return;
            }
            const canvas = this._ctx.canvas;
            const imageData = this._ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const hsvMatrix = this._utils.matrix.RBGToHSV(data);
            for (let i = 0; i < hsvMatrix.length; i += 4) {
                const s = i + 1;
                const v = i + 2;
                hsvMatrix[s] = hsvMatrix[s] - 10 < 0 ? 0 : hsvMatrix[s] - 10;
                hsvMatrix[v] = hsvMatrix[v] + 10 > 100 ? 100 : hsvMatrix[v] + 10;
            }
            const rgbMatrix = this._utils.matrix.HSVToRGB(hsvMatrix);
            for (let i = 0; i < rgbMatrix.length; i++) {
                data[i] = rgbMatrix[i];
            }
            this._ctx.putImageData(imageData, 0, 0);
        }
        _mustBeInitialized() {
            if (!this._ctx) {
                throw new Error(`Image modifier is not initialized yet!`);
            }
        }
    }
    exports.ImageModifier = ImageModifier;
});
define("ImageLoader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImageLoader = void 0;
    class ImageLoader {
        constructor(_bus, _imageModifier, _brightChartControl) {
            this._bus = _bus;
            this._imageModifier = _imageModifier;
            this._brightChartControl = _brightChartControl;
            this._loadBt = document.querySelector('#x_image_file');
            this._loadBt.addEventListener('change', this._loadImage.bind(this));
        }
        _loadImage() {
            var _a, _b, _c;
            try {
                if (!((_b = (_a = this._loadBt) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length)) {
                    throw new Error('Cannot load file!');
                }
                const file = (_c = this._loadBt) === null || _c === void 0 ? void 0 : _c.files[0];
                const fr = new FileReader();
                fr.onload = () => {
                    if (null === fr.result) {
                        this._bus.emit('error', 'Cannot read image content!');
                        return;
                    }
                    this._createImage(fr.result);
                };
                fr.readAsDataURL(file);
            }
            catch (e) {
                this._bus.emit('error', e.message);
            }
        }
        _createImage(imageResult) {
            try {
                const img = new Image();
                img.onload = () => {
                    this._imageLoaded(img);
                };
                img.src = imageResult;
            }
            catch (e) {
                this._bus.emit('error', e.message);
            }
        }
        _imageLoaded(img) {
            try {
                const canvas = document.querySelector('#canvas2d');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                this._imageModifier.initWith(ctx);
                this._loadBt.value = null;
            }
            catch (e) {
                this._bus.emit('error', e.message);
            }
        }
    }
    exports.ImageLoader = ImageLoader;
});
define("main", ["require", "exports", "EventBus", "Container", "ImageLoader", "ImageModifier", "ColourUtils", "BrightChartControl"], function (require, exports, EventBus_1, Container_1, ImageLoader_1, ImageModifier_1, ColourUtils_1, BrightChartControl_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const container = new Container_1.Container();
    container.registerObject('bus', new EventBus_1.EventBus());
    container.registerObject('colourUtils', ColourUtils_1.colourUtils);
    container.register('BrightChartControl', BrightChartControl_1.BrightChartControl, ['colourUtils',]);
    container.register('ImageModifier', ImageModifier_1.ImageModifier, ['bus', 'colourUtils', 'BrightChartControl']);
    container.register('ImageLoader', ImageLoader_1.ImageLoader, ['bus', 'ImageModifier',]);
    try {
        const bus = container.get('bus');
        bus.on('error', (msg) => {
            alert(msg);
        });
        container.get('ImageLoader');
    }
    catch (e) {
        alert(e.message);
        console.log(e);
    }
});
//# sourceMappingURL=index.js.map