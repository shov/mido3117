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
        constructor(_bus) {
            this._bus = _bus;
            this._dependedButtons = [];
            Object.entries({
                '#x_reset': this._xReset,
                '#x_invert': this._xInvert,
                '#x_grayscale': this._xGrayScale,
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
            return this;
        }
        _xReset() {
            if (!this._ctx || !this._originImageData) {
                return;
            }
            this._ctx.putImageData(this._originImageData, 0, 0);
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
        constructor(_bus, _imageModifier) {
            this._bus = _bus;
            this._imageModifier = _imageModifier;
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
define("main", ["require", "exports", "EventBus", "Container", "ImageLoader", "ImageModifier"], function (require, exports, EventBus_1, Container_1, ImageLoader_1, ImageModifier_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const container = new Container_1.Container();
    container.registerObject('bus', new EventBus_1.EventBus());
    container.register('ImageModifier', ImageModifier_1.ImageModifier, ['bus']);
    container.register('ImageLoader', ImageLoader_1.ImageLoader, ['bus', 'ImageModifier']);
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