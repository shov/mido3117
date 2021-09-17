var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define("Container", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Container = void 0;
    var Container = (function () {
        function Container() {
            this.store = {};
        }
        Container.prototype.register = function (name, resolver, deps) {
            if (deps === void 0) { deps = []; }
            this.store[name] = {
                resolver: resolver,
                deps: deps
            };
        };
        Container.prototype.registerObject = function (name, reference) {
            this.store[name] = reference;
        };
        Container.prototype.get = function (name) {
            var _a;
            var _this = this;
            var _b, _c, _d, _e, _f, _g;
            if ('function' === typeof ((_b = this.store[name]) === null || _b === void 0 ? void 0 : _b.resolver)
                && ((_e = (_d = (_c = this.store[name]) === null || _c === void 0 ? void 0 : _c.resolver) === null || _d === void 0 ? void 0 : _d.prototype) === null || _e === void 0 ? void 0 : _e.constructor)) {
                var deps = (((_f = this.store[name]) === null || _f === void 0 ? void 0 : _f.deps) || []).map(function (depName) { return _this.get(depName); });
                return new ((_a = ((_g = this.store[name]) === null || _g === void 0 ? void 0 : _g.resolver)).bind.apply(_a, __spreadArray([void 0], deps, false)))();
            }
            return this.store[name];
        };
        return Container;
    }());
    exports.Container = Container;
});
define("EventBus", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventBus = void 0;
    var EventBus = (function () {
        function EventBus() {
            this.store = {};
        }
        EventBus.prototype.on = function (name, cb) {
            if (!Array.isArray(this.store[name])) {
                this.store[name] = [];
            }
            this.store[name].push(cb);
        };
        EventBus.prototype.emit = function (name) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            ;
            (this.store[name] || [])
                .forEach(function (cb) { return Promise.resolve(cb.apply(void 0, args))
                .catch(function (e) { return _this.emit('error', "Event listener for " + name + " failed!"); }); });
        };
        return EventBus;
    }());
    exports.EventBus = EventBus;
});
define("ImageLoader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImageLoader = void 0;
    var ImageLoader = (function () {
        function ImageLoader(_bus) {
            this._bus = _bus;
            this._loadBt = document.querySelector('#image_file');
            this._loadBt.addEventListener('change', this._loadImage.bind(this));
        }
        ImageLoader.prototype._loadImage = function () {
            var _this = this;
            var _a, _b, _c;
            try {
                if (!((_b = (_a = this._loadBt) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length)) {
                    throw new Error('Cannot load file!');
                }
                var file = (_c = this._loadBt) === null || _c === void 0 ? void 0 : _c.files[0];
                var fr_1 = new FileReader();
                fr_1.onload = function () {
                    if (null === fr_1.result) {
                        _this._bus.emit('error', 'Cannot read image content!');
                        return;
                    }
                    _this._createImage(fr_1.result);
                };
                fr_1.readAsDataURL(file);
            }
            catch (e) {
                this._bus.emit('error', e.message);
            }
        };
        ImageLoader.prototype._createImage = function (imageResult) {
            var _this = this;
            try {
                var img_1 = new Image();
                img_1.onload = function () {
                    _this._imageLoaded(img_1);
                };
                img_1.src = imageResult;
            }
            catch (e) {
                this._bus.emit('error', e.message);
            }
        };
        ImageLoader.prototype._imageLoaded = function (img) {
            try {
                var canvas = document.querySelector('#canvas2d');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
            }
            catch (e) {
                this._bus.emit('error', e.message);
            }
        };
        return ImageLoader;
    }());
    exports.ImageLoader = ImageLoader;
});
define("main", ["require", "exports", "EventBus", "Container", "ImageLoader"], function (require, exports, EventBus_1, Container_1, ImageLoader_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var container = new Container_1.Container();
    container.registerObject('bus', new EventBus_1.EventBus());
    container.register('ImageLoader', ImageLoader_1.ImageLoader);
    try {
        var bus = container.get('bus');
        bus.on('error', function (msg) {
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