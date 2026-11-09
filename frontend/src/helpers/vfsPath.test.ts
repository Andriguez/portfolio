import { describe, it, expect } from "vitest";
import { resolvePath } from "./vfsPath";
import type { VfsFolder } from "../types/vfs";

const root = {
    type: "folder", name: "root", slug: "root",
    children: [
        { type: "folder", name: "projects", slug: "projects", children: [
            { type: "folder", name: "web development", slug: "webdev", children: [] },
            { type: "folder", name: "cybersecurity", slug: "cybersec", children: [] },
        ]},
        { type: "file", name: "about.md", slug: "about" }
    ]
} as unknown as VfsFolder;

describe("resolvePath", () => {
    it("resolves a relative path from the current folder", () => {
        expect(resolvePath(root, ["projects"], "webdev")).toEqual(["projects", "webdev"]);
    });
    it("resolves an absolute path from root", () => {
        expect(resolvePath(root, ["projects", "webdev"], "~/projects/cybersec")).toEqual(["projects", "cybersec"]);
    });
    it("goes back with .. and ../..", () => {
        expect(resolvePath(root, ["projects", "webdev"], "..")).toEqual(["projects"]);
        expect(resolvePath(root, ["projects", "webdev"], "../..")).toEqual([]);
    });
    it("accepts a display name and returns the slug", () => {
        expect(resolvePath(root, [], "projects/web development")).toEqual(["projects", "webdev"]);
    });
    it("refuses a file as a folder", () => {
        expect(resolvePath(root, [], "about")).toBeNull();
    });
    it("returns null for a folder that doesn't exist", () => {
        expect(resolvePath(root, [], "non_existing")).toBeNull();
    });
});
