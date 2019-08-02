var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import initialConfig from '../config/defaults';
var loadConfig = function (userConfig) {
    var config = __assign({}, initialConfig, userConfig, { camera: __assign({}, initialConfig.camera, userConfig.camera, { position: __assign({}, initialConfig.camera.position, (userConfig.camera !== undefined
                ? userConfig.camera.position
                : undefined)) }), controls: __assign({}, initialConfig.controls, userConfig.controls), windowSize: __assign({}, initialConfig.windowSize, userConfig.windowSize) });
    return config;
};
export default loadConfig;
