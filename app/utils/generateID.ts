
export function generateID(): string {
    return Math.random().toString(36).slice(2, 11);
}