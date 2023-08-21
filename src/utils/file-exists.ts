import { accessSync } from "fs";

export function fileExists(fileName: string) {
  try {
    accessSync(fileName);
    return true;
  } catch (error) {
    return false;
  }
}
