export function assertNever(arg: never): never {
    throw new Error("Type not handled");
}