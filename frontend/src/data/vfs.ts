import type { VfsNode } from "../types/vfs";

export const root: VfsNode = {
    type: "folder",
    name: "root",
    slug: "",
    children: [
        {
            type: "file",
            name: "about.md",
            slug: "about",
            content: {
                title: "About Me",
                body: "This is where your bio goes.",
            },
        },
        {
            type: "folder",
            name: "projects",
            slug: "projects",
            children: [
                {
                    type: "folder",
                    name: "cyber-security-projects",
                    slug: "cybersec",
                    children: [
                        {
                            type: "file",
                            name: "project-1",
                            slug: "cybersec-project-1",
                            content: {
                                title: "cybersec project 1",
                                body: "This is where project description goes.",
                            }
                        },
                        {
                            type: "file",
                            name: "project-2",
                            slug: "cybersec-project-2",
                            content: {
                                title: "cybersec project 2",
                                body: "This is where project description goes.",
                            }
                        }
                    ]
                },
                {
                    type: "folder",
                    name: "webdev-projects",
                    slug: "webdev",
                    children: [
                        {
                            type: "file",
                            name: "project-1",
                            slug: "webdev-project-1",
                            content: {
                                title: "webdev project 1",
                                body: "This is where project description goes.",
                            }
                        },
                        {
                            type: "file",
                            name: "project-2",
                            slug: "webdev-project-2",
                            content: {
                                title: "webdev project 2",
                                body: "This is where project description goes.",
                            }
                        },
                        {
                            type: "file",
                            name: "example-project.md",
                            slug: "example-project",
                            content: {
                                title: "Example Project",
                                body: "A short description of a project you built.",
                            }
                        }
                    ]
                },
            ],
        },
    ],
};