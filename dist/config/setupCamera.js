import * as THREE from 'three';
var setupCamera = function (config) {
    var fov = config.fov, aspect = config.aspect, near = config.near, far = config.far, _a = config.position, x = _a.x, z = _a.z, y = _a.y;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.x = x;
    camera.position.z = z;
    if (y !== undefined) {
        camera.position.y = y;
    }
    camera.up.set(0, 0, 1);
    return camera;
};
export default setupCamera;
