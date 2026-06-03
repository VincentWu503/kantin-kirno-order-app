
//  This is called when checking the validiti of a number along an integer range (also works for floats)
export function checkInteger(n: number, min?: number, max?: number): void {
    if (exists(min)) if (n < min!) throw new Error("Number is less than minimum value!"); // BANG OPERATOR THE GOAT
    if (exists(max)) if (n > max!) throw new Error("Number is bigger than maximum value!");
}

export function exists(some: unknown): boolean {
    if (typeof some === "undefined") return false;
    return true;
}