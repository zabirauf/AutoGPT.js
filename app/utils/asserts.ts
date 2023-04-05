export function assertNever(arg: never) {
    throw new Error("Type not handled");
}