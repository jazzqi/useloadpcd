import * as THREE from 'three';
declare class PCDLoader extends THREE.Loader {
    manager?: THREE.LoadingManager;
    littleEndian: boolean;
    path: string;
    constructor(manager?: THREE.LoadingManager);
    load(url: string, onLoad: (data: any) => void, onProgress: (request: ProgressEvent) => void, onError: (event: ErrorEvent) => void): void;
    setPath(value: string): this;
    parse(data: any, url: string): THREE.Points | undefined;
}
export default PCDLoader;
