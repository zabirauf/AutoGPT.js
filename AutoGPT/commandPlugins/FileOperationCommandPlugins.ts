import { CommandPlugin } from './CommandPlugin';

let directoryHandle: FileSystemDirectoryHandle | null = null;
let getDirectoryHandleFn: () => Promise<FileSystemDirectoryHandle | null>;

export function initFileOperationCommandPlugins({
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

async function readFile(fileName: string) {
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

async function writeToFile(fileName: string, text: string) {
  try {
    const dh = await getDirectoryHandle();
    const fileHandle = await dh.getFileHandle(fileName, { create: true });
    if (!fileHandle) {
      return "Error: Unable to create a file";
    }

    const file = await fileHandle.createWritable();
    await file.write(text);
    await file.close();
    return "File written to successfully";
  } catch (error) {
    console.error("Error writing to file", error);
    return `Error: ${error}`;
  }
}

async function appendToFile(fileName: string, text: string) {
  try {
    const dh = await getDirectoryHandle();
    const fileHandle = await dh.getFileHandle(fileName, { create: true });
    if (!fileHandle) {
      return "Error: Unable to append to a file";
    }

    const file = await fileHandle.createWritable({ keepExistingData: true });
    let offset = (await fileHandle.getFile()).size;
    await file.write({ type: "seek", position: offset });
    await file.write(text);
    await file.close();
    return "Text appended successfully";
  } catch (error) {
    console.error("Error appending to file", error);
    return `Error: ${error}`;
  }
}

async function deleteFile(fileName: string) {
  try {
    const dh = await getDirectoryHandle();
    await dh.removeEntry(fileName);
    return "File deleted successfully";
  } catch (error) {
    console.error("Error deleting file", error);
    return `Error: ${error}`;
  }
}

const FileOperationCommandPlugins: CommandPlugin[] = [
  {
    command: "write_to_file",
    name: "Write to file",
    arguments: {
      file: "file",
      text: "text",
    },
    execute: (args) => writeToFile(args["file"], args["text"]),
  },
  {
    command: "read_file",
    name: "Read file",
    arguments: {
      file: "file",
    },
    execute: (args) => readFile(args["file"]),
  },
  {
    command: "append_to_file",
    name: "Append to file",
    arguments: {
      file: "file",
      text: "text",
    },
    execute: (args) => appendToFile(args["file"], args["text"]),
  },
  {
    command: "delete_file",
    name: "Delete file",
    arguments: {
      file: "file",
    },
    execute: (args) => deleteFile(args["file"]),
  },
];
export default FileOperationCommandPlugins;
