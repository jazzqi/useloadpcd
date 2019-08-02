import * as THREE from 'three';
import { ILoadedControls } from '../@types/types';
import TrackballControls from '../three/Trackball';
declare const setupControls: (camera: THREE.PerspectiveCamera, canvas: HTMLDivElement, config: ILoadedControls) => TrackballControls;
export default setupControls;
