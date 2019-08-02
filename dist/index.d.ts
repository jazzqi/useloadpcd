/// <reference types="react" />
import { IConfig, IFeedback } from './@types/types';
declare const load: (path: string, configuration: IConfig) => [import("react").RefObject<HTMLDivElement>, IFeedback];
export default load;
