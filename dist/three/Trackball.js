var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as THREE from 'three';
var TrackballControls = /** @class */ (function (_super) {
    __extends(TrackballControls, _super);
    function TrackballControls(object, domElement) {
        var _this_1 = _super.call(this) || this;
        var _this = _this_1;
        var STATE = {
            NONE: -1,
            ROTATE: 0,
            ZOOM: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_ZOOM_PAN: 4
        };
        _this_1.object = object;
        _this_1.domElement = domElement !== undefined ? domElement : document;
        // API
        _this_1.enabled = true;
        _this_1.screen = { left: 0, top: 0, width: 0, height: 0 };
        _this_1.rotateSpeed = 1.0;
        _this_1.zoomSpeed = 1.2;
        _this_1.panSpeed = 0.3;
        _this_1.noRotate = false;
        _this_1.noZoom = false;
        _this_1.noPan = false;
        _this_1.staticMoving = false;
        _this_1.dynamicDampingFactor = 0.2;
        _this_1.minDistance = 0;
        _this_1.maxDistance = Infinity;
        _this_1.keys = [65 /* A */, 83 /* S */, 68 /* D */];
        // internals
        _this_1.target = new THREE.Vector3();
        var EPS = 0.000001;
        var lastPosition = new THREE.Vector3();
        var _state = STATE.NONE;
        var _prevState = STATE.NONE;
        var _eye = new THREE.Vector3();
        var _movePrev = new THREE.Vector2();
        var _moveCurr = new THREE.Vector2();
        var _lastAxis = new THREE.Vector3();
        var _lastAngle = 0;
        var _zoomStart = new THREE.Vector2();
        var _zoomEnd = new THREE.Vector2();
        var _touchZoomDistanceStart = 0;
        var _touchZoomDistanceEnd = 0;
        var _panStart = new THREE.Vector2();
        var _panEnd = new THREE.Vector2();
        // for reset
        _this_1.target0 = _this_1.target.clone();
        _this_1.position0 = _this_1.object.position.clone();
        _this_1.up0 = _this_1.object.up.clone();
        // events
        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };
        // methods
        _this_1.handleResize = function () {
            if (_this_1.domElement === document) {
                _this_1.screen.left = 0;
                _this_1.screen.top = 0;
                _this_1.screen.width = window.innerWidth;
                _this_1.screen.height = window.innerHeight;
            }
            else {
                var box = _this_1.domElement.getBoundingClientRect();
                // adjustments come from similar code in the jquery offset() function
                var d = _this_1.domElement.ownerDocument.documentElement;
                _this_1.screen.left = box.left + window.pageXOffset - d.clientLeft;
                _this_1.screen.top = box.top + window.pageYOffset - d.clientTop;
                _this_1.screen.width = box.width;
                _this_1.screen.height = box.height;
            }
        };
        _this_1.handleEvent = function (event) {
            if (typeof _this_1[event.type] === 'function') {
                _this_1[event.type](event);
            }
        };
        var getMouseOnScreen = (function wrapper() {
            var vector = new THREE.Vector2();
            return function (pageX, pageY) {
                vector.set((pageX - _this.screen.left) / _this.screen.width, (pageY - _this.screen.top) / _this.screen.height);
                return vector;
            };
        })();
        var getMouseOnCircle = (function wrapper() {
            var vector = new THREE.Vector2();
            return function (pageX, pageY) {
                vector.set((pageX - _this.screen.width * 0.5 - _this.screen.left) /
                    (_this.screen.width * 0.5), (_this.screen.height + 2 * (_this.screen.top - pageY)) /
                    _this.screen.width // screen.width intentional
                );
                return vector;
            };
        })();
        _this_1.rotateCamera = (function wrapper() {
            var axis = new THREE.Vector3();
            var quaternion = new THREE.Quaternion();
            var eyeDirection = new THREE.Vector3();
            var objectUpDirection = new THREE.Vector3();
            var objectSidewaysDirection = new THREE.Vector3();
            var moveDirection = new THREE.Vector3();
            var angle;
            return function rotateCamera() {
                moveDirection.set(_moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0);
                angle = moveDirection.length();
                if (angle) {
                    _eye.copy(_this.object.position).sub(_this.target);
                    eyeDirection.copy(_eye).normalize();
                    objectUpDirection.copy(_this.object.up).normalize();
                    objectSidewaysDirection
                        .crossVectors(objectUpDirection, eyeDirection)
                        .normalize();
                    objectUpDirection.setLength(_moveCurr.y - _movePrev.y);
                    objectSidewaysDirection.setLength(_moveCurr.x - _movePrev.x);
                    moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));
                    axis.crossVectors(moveDirection, _eye).normalize();
                    angle *= _this.rotateSpeed;
                    quaternion.setFromAxisAngle(axis, angle);
                    _eye.applyQuaternion(quaternion);
                    _this.object.up.applyQuaternion(quaternion);
                    _lastAxis.copy(axis);
                    _lastAngle = angle;
                }
                else if (!_this.staticMoving && _lastAngle) {
                    _lastAngle *= Math.sqrt(1.0 - _this.dynamicDampingFactor);
                    _eye.copy(_this.object.position).sub(_this.target);
                    quaternion.setFromAxisAngle(_lastAxis, _lastAngle);
                    _eye.applyQuaternion(quaternion);
                    _this.object.up.applyQuaternion(quaternion);
                }
                _movePrev.copy(_moveCurr);
            };
        })();
        _this_1.zoomCamera = function () {
            var factor;
            if (_state === STATE.TOUCH_ZOOM_PAN) {
                factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
                _touchZoomDistanceStart = _touchZoomDistanceEnd;
                _eye.multiplyScalar(factor);
            }
            else {
                factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;
                if (factor !== 1.0 && factor > 0.0) {
                    _eye.multiplyScalar(factor);
                    if (_this.staticMoving) {
                        _zoomStart.copy(_zoomEnd);
                    }
                    else {
                        _zoomStart.y +=
                            (_zoomEnd.y - _zoomStart.y) *
                                _this_1.dynamicDampingFactor;
                    }
                }
            }
        };
        _this_1.panCamera = (function wrapper() {
            var mouseChange = new THREE.Vector2();
            var objectUp = new THREE.Vector3();
            var pan = new THREE.Vector3();
            return function panCamera() {
                mouseChange.copy(_panEnd).sub(_panStart);
                if (mouseChange.lengthSq()) {
                    mouseChange.multiplyScalar(_eye.length() * _this.panSpeed);
                    pan.copy(_eye)
                        .cross(_this.object.up)
                        .setLength(mouseChange.x);
                    pan.add(objectUp.copy(_this.object.up).setLength(mouseChange.y));
                    _this.object.position.add(pan);
                    _this.target.add(pan);
                    if (_this.staticMoving) {
                        _panStart.copy(_panEnd);
                    }
                    else {
                        _panStart.add(mouseChange
                            .subVectors(_panEnd, _panStart)
                            .multiplyScalar(_this.dynamicDampingFactor));
                    }
                }
            };
        })();
        _this_1.checkDistances = function () {
            if (!_this.noZoom || !_this.noPan) {
                if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {
                    _this.object.position.addVectors(_this.target, _eye.setLength(_this.maxDistance));
                    _zoomStart.copy(_zoomEnd);
                }
                if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {
                    _this.object.position.addVectors(_this.target, _eye.setLength(_this.minDistance));
                    _zoomStart.copy(_zoomEnd);
                }
            }
        };
        _this_1.update = function () {
            _eye.subVectors(_this.object.position, _this.target);
            if (!_this.noRotate) {
                _this.rotateCamera();
            }
            if (!_this.noZoom) {
                _this.zoomCamera();
            }
            if (!_this.noPan) {
                _this.panCamera();
            }
            _this.object.position.addVectors(_this.target, _eye);
            _this.checkDistances();
            _this.object.lookAt(_this.target);
            if (lastPosition.distanceToSquared(_this.object.position) > EPS) {
                _this.dispatchEvent(changeEvent);
                lastPosition.copy(_this.object.position);
            }
        };
        _this_1.reset = function () {
            _state = STATE.NONE;
            _prevState = STATE.NONE;
            _this.target.copy(_this.target0);
            _this.object.position.copy(_this.position0);
            _this.object.up.copy(_this.up0);
            _eye.subVectors(_this.object.position, _this.target);
            _this.object.lookAt(_this.target);
            _this.dispatchEvent(changeEvent);
            lastPosition.copy(_this.object.position);
        };
        // listeners
        function keydown(event) {
            if (_this.enabled === false)
                return;
            window.removeEventListener('keydown', keydown);
            _prevState = _state;
            if (_state !== STATE.NONE) {
                return;
            }
            if (event.keyCode === _this.keys[STATE.ROTATE] && !_this.noRotate) {
                _state = STATE.ROTATE;
            }
            else if (event.keyCode === _this.keys[STATE.ZOOM] &&
                !_this.noZoom) {
                _state = STATE.ZOOM;
            }
            else if (event.keyCode === _this.keys[STATE.PAN] &&
                !_this.noPan) {
                _state = STATE.PAN;
            }
        }
        function keyup() {
            if (_this.enabled === false)
                return;
            _state = _prevState;
            window.addEventListener('keydown', keydown, false);
        }
        function mousemove(event) {
            if (_this.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            if (_state === STATE.ROTATE && !_this.noRotate) {
                _movePrev.copy(_moveCurr);
                _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
            }
            else if (_state === STATE.ZOOM && !_this.noZoom) {
                _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
            }
            else if (_state === STATE.PAN && !_this.noPan) {
                _panEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
            }
        }
        function mouseup(event) {
            if (_this.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            _state = STATE.NONE;
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            _this.dispatchEvent(endEvent);
        }
        function mousedown(event) {
            if (_this.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            if (_state === STATE.NONE) {
                _state = event.button;
            }
            if (_state === STATE.ROTATE && !_this.noRotate) {
                _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
                _movePrev.copy(_moveCurr);
            }
            else if (_state === STATE.ZOOM && !_this.noZoom) {
                _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
                _zoomEnd.copy(_zoomStart);
            }
            else if (_state === STATE.PAN && !_this.noPan) {
                _panStart.copy(getMouseOnScreen(event.pageX, event.pageY));
                _panEnd.copy(_panStart);
            }
            document.addEventListener('mousemove', mousemove, false);
            document.addEventListener('mouseup', mouseup, false);
            _this.dispatchEvent(startEvent);
        }
        function mousewheel(event) {
            if (_this.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            var delta = 0;
            if (event.wheelDelta) {
                // WebKit / Opera / Explorer 9
                delta = event.wheelDelta / 40;
            }
            else if (event.detail) {
                // Firefox
                delta = -event.detail / 3;
            }
            _zoomStart.y += delta * 0.01;
            _this.dispatchEvent(startEvent);
            _this.dispatchEvent(endEvent);
        }
        function touchstart(event) {
            if (_this.enabled === false)
                return;
            switch (event.touches.length) {
                case 1:
                    _state = STATE.TOUCH_ROTATE;
                    _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                    _movePrev.copy(_moveCurr);
                    break;
                case 2:
                    _state = STATE.TOUCH_ZOOM_PAN;
                    var dx = event.touches[0].pageX - event.touches[1].pageX;
                    var dy = event.touches[0].pageY - event.touches[1].pageY;
                    _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
                    var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                    var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                    _panStart.copy(getMouseOnScreen(x, y));
                    _panEnd.copy(_panStart);
                    break;
                default:
                    _state = STATE.NONE;
            }
            _this.dispatchEvent(startEvent);
        }
        function touchmove(event) {
            if (_this.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            switch (event.touches.length) {
                case 1:
                    _movePrev.copy(_moveCurr);
                    _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                    break;
                case 2:
                    var dx = event.touches[0].pageX - event.touches[1].pageX;
                    var dy = event.touches[0].pageY - event.touches[1].pageY;
                    _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
                    var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                    var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                    _panEnd.copy(getMouseOnScreen(x, y));
                    break;
                default:
                    _state = STATE.NONE;
            }
        }
        function touchend(event) {
            if (_this.enabled === false)
                return;
            switch (event.touches.length) {
                default:
                    // no touches
                    break;
                case 1:
                    _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                    _movePrev.copy(_moveCurr);
                    break;
                case 2:
                    _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
                    var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                    var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                    _panEnd.copy(getMouseOnScreen(x, y));
                    _panStart.copy(_panEnd);
                    break;
            }
            _state = STATE.NONE;
            _this.dispatchEvent(endEvent);
        }
        function contextmenu(event) {
            event.preventDefault();
        }
        _this_1.dispose = function () {
            _this_1.domElement.removeEventListener('contextmenu', contextmenu, false);
            _this_1.domElement.removeEventListener('mousedown', mousedown, false);
            _this_1.domElement.removeEventListener('mousewheel', mousewheel, false);
            _this_1.domElement.removeEventListener('DOMMouseScroll', mousewheel, false); // firefox
            _this_1.domElement.removeEventListener('touchstart', touchstart, false);
            _this_1.domElement.removeEventListener('touchend', touchend, false);
            _this_1.domElement.removeEventListener('touchmove', touchmove, false);
            document.removeEventListener('mousemove', mousemove, false);
            document.removeEventListener('mouseup', mouseup, false);
            window.removeEventListener('keydown', keydown, false);
            window.removeEventListener('keyup', keyup, false);
        };
        _this_1.domElement.addEventListener('contextmenu', contextmenu, false);
        _this_1.domElement.addEventListener('mousedown', mousedown, false);
        _this_1.domElement.addEventListener('mousewheel', mousewheel, false);
        _this_1.domElement.addEventListener('DOMMouseScroll', mousewheel, false); // firefox
        _this_1.domElement.addEventListener('touchstart', touchstart, false);
        _this_1.domElement.addEventListener('touchend', touchend, false);
        _this_1.domElement.addEventListener('touchmove', touchmove, false);
        window.addEventListener('keydown', keydown, false);
        window.addEventListener('keyup', keyup, false);
        _this_1.handleResize();
        // force an update at start
        _this_1.update();
        return _this_1;
    }
    return TrackballControls;
}(THREE.EventDispatcher));
export default TrackballControls;
