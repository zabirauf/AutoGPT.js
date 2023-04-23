import { BaseFileStore } from 'langchain/schema';

let directoryHandle: FileSystemDirectoryHandle | null = null;
let getDirectoryHandleFn: () => Promise<FileSystemDirectoryHandle | null>;

export function initBrowserFilesStoreDeps({
  getDirectoryHandle: _getDirectoryHandle,
}: {
  getDirectoryHandle: typeof getDirectoryHandleFn;
}) {
  getDirectoryHandleFn = _getDirectoryHandle;
}

async function getDirectoryHandle() {
  if (!directoryHandle) {
    directoryHandle = await getDirectoryHandleFn();
  }

  return directoryHandle!;
}

export class BrowserFilesStore extends BaseFileStore {
  async readFile(fileName: string): Promise<string> {
    try {
      const dh = await getDirectoryHandle();
      const fileHandle = await dh.getFileHandle(fileName, { create: false });
      if (!fileHandle) {
        return "Error: Unable to read file";
      }

      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      console.error("Error reading from file", error);
      return `Error: ${error}`;
    }
  }
  async writeFile(fileName: string, contents: string): Promise<void> {
    try {
      const dh = await getDirectoryHandle();
      const fileHandle = await dh.getFileHandle(fileName, { create: true });
      if (!fileHandle) {
        throw new Error("Error: Unable to create a file");
      }

      const file = await fileHandle.createWritable();
      await file.write(contents);
      await file.close();
    } catch (error) {
      console.error("Error writing to file", error);
      throw new Error(`Error: ${error}`);
    }
  }
}