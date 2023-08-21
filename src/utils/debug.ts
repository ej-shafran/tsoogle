import Debug from "debug";

import { NAME } from "./constants";

export const debug = Debug(NAME);
export const utilDebug = debug.extend("utils");
