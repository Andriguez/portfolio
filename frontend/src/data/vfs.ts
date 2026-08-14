import type { VfsNode } from "../types/vfs";

export const root: VfsNode = {
    type: "folder",
    name: "root",
    slug: "",
    updatedAt: "19/07/2026",
    children: [
        {
            type: "file",
            name: "about.md",
            slug: "about",
            updatedAt: "19/07/2026",
            content: {
                title: "About Me",
                body: "This is where your bio goes..",
                image: "../../src/assets/aboutme-photo.jfif"
            },
            description: "Get to know a bit about me"
        },
        {
            type: "folder",
            name: "projects",
            slug: "projects",
            updatedAt: "19/07/2026",
            description: "Check out some things I've built.",
            children: [
                {
                    type: "folder",
                    name: "cyber security",
                    slug: "cybersec",
                    description: "Checkout some cyber security projects.",
                    updatedAt: "19/07/2026",
                    children: [
                        {
                            type: "file",
                            name: "project-1",
                            slug: "cybersec-project-1",
                            description: "cyber security project 1 goes here.",
                            updatedAt: "19/07/2026",
                            content: {
                                title: "cybersec project 1",
                                body: "This is where project description goes.",
                            },
                        },
                        {
                            type: "file",
                            name: "project-2",
                            slug: "cybersec-project-2",
                            description: "cyber security project 2 goes here.",
                            content: {
                                title: "cybersec project 2",
                                body: "This is where project description goes.",
                            },
                            updatedAt: "19/07/2026"
                        }
                    ]
                },
                {
                    type: "folder",
                    name: "webdev",
                    slug: "webdev",
                    description: "View web/software development projects.",
                    updatedAt: "19/07/2026",
                    children: [
                        {
                            type: "file",
                            name: "project-1",
                            slug: "webdev-project-1",
                            description: "webdev project 1 goes here.",
                            updatedAt: "19/07/2026",
                            content: {
                                title: "webdev project 1",
                                body: "This is where project description goes.",
                            }
                        },
                        {
                            type: "file",
                            name: "project-2",
                            slug: "webdev-project-2",
                            description: "webdev project 2 goes here.",
                            updatedAt: "19/07/2026",
                            content: {
                                title: "webdev project 2",
                                body: "This is where project description goes.",
                            }
                        },
                        {
                            type: "file",
                            name: "project-2.md",
                            slug: "example-project",
                            description: "webdev project 3 goes here.",
                            updatedAt: "19/07/2026",
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