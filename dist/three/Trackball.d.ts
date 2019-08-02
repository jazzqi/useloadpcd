import * as THREE from 'three';
declare class TrackballControls extends THREE.EventDispatcher {
    object: any;
    domElement: any;
    enabled: boolean;
    screen: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    noRotate: boolean;
    noZoom: boolean;
    noPan: boolean;
    staticMoving: boolean;
    dynamicDampingFactor: number;
    minDistance: number;
    maxDistance: number;
    keys: number[];
    target: THREE.Vector3;
    target0: THREE.Vector3;
    position0: THREE.Vector3;
    up0: THREE.Vector3;
    [key: string]: any;
    handleResize: () => void;
    handleEvent: (event: Event) => void;
    constructor(object: any, domElement: any);
}
export default TrackballControls;
