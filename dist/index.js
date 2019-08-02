var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import loadConfig from './config/loadConfig';
import setupCamera from './config/setupCamera';
import setupControls from './config/setupControls';
import PCDLoader from './three/PCDLoader';
var load = function (path, configuration) {
    var canvas = useRef(null);
    var _a = useState(0), loading = _a[0], setLoading = _a[1];
    var _b = useState(null), err = _b[0], setErr = _b[1];
    var _c = useState(undefined), frameId = _c[0], setFrameId = _c[1];
    var config = loadConfig(configuration);
    var getFile = function () { return __awaiter(_this, void 0, void 0, function () {
        var scene, loader, camera, renderer, controls_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scene = new THREE.Scene();
                    scene.background = new THREE.Color(config.backgroundColor);
                    loader = new PCDLoader();
                    camera = setupCamera(config.camera);
                    scene.add(camera);
                    renderer = new THREE.WebGLRenderer({ antialias: true });
                    renderer.setPixelRatio(window.devicePixelRatio);
                    renderer.setSize(config.windowSize.width, config.windowSize.height);
                    if (!(canvas.current !== null)) return [3 /*break*/, 2];
                    controls_1 = setupControls(camera, canvas.current, config.controls);
                    return [4 /*yield*/, loader.load(path, function (mesh) {
                            scene.add(mesh);
                            var center = mesh.geometry.boundingSphere.center;
                            controls_1.target.set(center.x, center.y, center.z);
                            controls_1.update();
                            var sceneStyle = scene.getObjectByName(path.substring(path.lastIndexOf('/') + 1));
                            if (config.particalColor !== undefined) {
                                sceneStyle.material.color = new THREE.Color(config.particalColor);
                            }
                            sceneStyle.material.size = config.particalSize;
                            if (canvas.current !== null) {
                                canvas.current.appendChild(renderer.domElement);
                            }
                            var renderScene = function () {
                                renderer.render(scene, camera);
                            };
                            var animate = function () {
                                controls_1.update();
                                requestAnimationFrame(animate);
                                renderScene();
                            };
                            var start = function () {
                                if (!frameId) {
                                    setFrameId(requestAnimationFrame(animate));
                                }
                            };
                            start();
                            var onWindowResize = function () {
                                camera.aspect =
                                    config.windowSize.width / config.windowSize.height;
                                camera.updateProjectionMatrix();
                                renderer.setSize(config.windowSize.width, config.windowSize.height);
                                controls_1.handleResize();
                            };
                            window.addEventListener('resize', onWindowResize, false);
                        }, function (xhr) {
                            var completed = (xhr.loaded / xhr.total) * 100;
                            // console.log(completed + '% loaded');
                            setLoading(completed);
                        }, function (error) {
                            setErr(error);
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        if (canvas.current !== null) {
            if (canvas.current.children.length === 0) {
                getFile();
            }
        }
    }, []);
    return [
        canvas,
        {
            error: err,
            loading: loading < 100,
            percentage: loading
        }
    ];
};
export default load;
