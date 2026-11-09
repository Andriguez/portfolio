import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize";

describe("tokenize", () => {
    it("gets a string and returns an array", () => {
        expect(tokenize("cd web development")).toEqual(["cd", "web", "development"]);
    });
    it("keeps double- and single-quoted text together, without the quotes", () => {
        expect(tokenize('cd "web development"')).toEqual(["cd", "web development"]);
        expect(tokenize("echo 'hello world'")).toEqual(["echo", "hello world"]);
    });
    it("ignores extra spaces", () => {
        expect(tokenize("  ls   -la ")).toEqual(["ls", "-la"]);
    })
    it("returns an empty list for empty input", () => {
        expect(tokenize("")).toEqual([]);
    });
});