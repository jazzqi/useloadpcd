declare const INITIAL_CONFIG: {
    backgroundColor: string;
    camera: {
        aspect: number;
        far: number;
        fov: number;
        near: number;
        position: {
            x: number;
            z: number;
        };
    };
    controls: {
        dynamicDampingFactor: number;
        maxDistance: number;
        minDistance: number;
        noPan: boolean;
        noRotate: boolean;
        noZoom: boolean;
        panSpeed: number;
        rotateSpeed: number;
        staticMoving: boolean;
        zoomSpeed: number;
    };
    particalColor: string;
    particalSize: number;
    windowSize: {
        height: number;
        width: number;
    };
};
export default INITIAL_CONFIG;
