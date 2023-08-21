import Debug from "debug";

import { name } from "./constants";

export const debug = Debug(name);
export const utilDebug = debug.extend("utils");
