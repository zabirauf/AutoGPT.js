const permanentMemory: string[] = [];

export function commitMemory(val: string) {
    permanentMemory.push(val);

    return `Committing memory with string "${val}"`;
}
export function getMemory(index: number) {
    if (index >= permanentMemory.length) {
        return 'Invalid key, cannot retrieve memory.';
    }
    return permanentMemory[index];
}

export function deleteMemory(index: number) {
    if (index >= permanentMemory.length) {
        return 'Invalid key, cannot delete memory.';
    }
 
    permanentMemory.splice(index, 1);
    return `Deleting memory with key ${index}.`;
}

export function overwriteMemory(index: number, val: string) {
    if (index >= permanentMemory.length) {
        return 'Invalid key, cannote overwrite memory.'
    }

    permanentMemory[index] = val;
    return `Overwriting memory with key ${index} and string "${val}".`;
}