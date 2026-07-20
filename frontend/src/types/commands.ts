import type { VfsFolder, VfsFile } from "./vfs";
import type { CommandOutput } from "./CommandOutput";

type CommandContext = {
    currentFolder: VfsFolder;
    cd: (target: string) => boolean;
    resolveFile: (target: string) => VfsFile | null;
};

export type CommandDefinition = {
    name: string;
    alias?: string;
    options?: string[];
    usage: string;
    description: string;
    run: (args: string[], ctx: CommandContext) => CommandOutput | "CLEAR" | "EXIT";
};

export const commands: CommandDefinition[] = [
    {
        name: "hello",
        usage: "hello",
        description: "read the welcome message.",
        run: () => ({
            type: "text",
            value: "Hello world type message... but on a terminal.",
            color: "cli-dim"
        })
    },
    {
        name: "help",
        usage: "help",
        description: "list everything(?) you can do here.",
        run: () => ({
            type: "help",
            color: "cli-green"
        }),
    },
    {
        name: "ls",
        alias: "dir",
        usage: "ls",
        description: "check what's in here.",
        run: (_args, ctx) => ({
            type: "list",
            items: ctx.currentFolder.children.map((c) => ({
                name: c.name,
                slug: c.slug,
                isFolder: c.type === "folder",
                description: c.description,
                itemCount: ctx.currentFolder.children.length,
                updatedAt: c.updatedAt,
            })),
            color: "cli-green"
        }),
    },
    {
        name: "cd",
        alias: "enter",
        usage: "cd <page>",
        options: [" .. ","../../ ", "~ ", "directory/folder "],
        description: "go into a page; type 'cd ..' to go back.",
        run: (args, ctx) => {
            if (!args[0]) return { type: "error", value: "usage: cd <folder>", color: "cli-info" };

            if (!ctx.cd(args[0]))
                return { type: "error", value: `cd: no such folder: ${args[0]}`, color: "cli-info" };
            return { type: "none", color: "cli-green" };
        },
    },
    {
        name: "cat",
        alias: "view",
        usage: "cat <file>",
        description: "open and read a page's entry.",
        run: (args, ctx) => {
            if (!args[0]) return { type: "error", value: "usage: cat <file>", color: "cli-info" };

            const file = ctx.resolveFile(args[0] ?? "");

            return file
                ? { type: "markdown", file, color: "cli-green" }
                : { type: "error", value: `cat: no such file: ${args[0]}`, color: "cli-info" };
        },
    },
    {
        name: "links",
        usage: "links <media>",
        options: [" github ", " linkedin "],
        description: "let's get friendly :).",
        run: (args) => {
            if (!args[0]) return { type: "error", value: "usage: links <media>", color: "cli-info" };

            let link = "";
            let media = args[0];

            if (media === "linkedin") {
                link = "https://www.linkedin.com/in/andriguez-905581159/"
            } else if (media === "github") {
                link = "https://github.com/andriguez"
            }

            return { type: "link", value: `>Go to my ${media} profile clicking here<`, url: link, color: "cli-green" }
        },
    },
    {
        name: "source",
        usage: "source",
        description: "get the link to the public repo. [implement]",
        run: () => ({
            type: "link", value: `>Go to my github repo clicking here<`, url: "", color: "cli-green"
        })
    },
    {
        name: "stack",
        usage: "stack",
        description: "lists the technology used for this portfolio. [implement]",
        run: () => ({
            type: "text", value: "...", color: "cli-green"
        })
    },
    {
        name: "contact",
        alias: "email",
        usage: "contact <msg>",
        options: ["message"],
        description: "come on.. send me an email.",
        run: () => ({
            type: "text",
            value: "message sent...",
            color: "cli-green"
        })
    },
    {
        name: "echo",
        alias: "say",
        usage: "echo <text>",
        description: "prints input back, like an online parrot.",
        run: (args) => {
            if (args.length === 0) return { type: "error", value: "usage: echo <text>", color: "cli-info" };

            return { type: "text", value: args.join(" "), color: "cli-green" }
        },
    },
    {
        name: "date",
        usage: "date",
        description: "in case you were wondering what date is it.",
        run: () => ({
            type: "text",
            value: new Date().toString(),
            color: "cli-green"
        }),
    },
    {
        name: "pwd",
        usage: "pwd",
        alias: "where",
        description: "wanna know where you at?",
        run: ([], ctx: CommandContext) => ({
            type: "text",
            value: ctx.currentFolder.name,
            color: "cli-green"
        })
    },
    {
        name: "sudo",
        usage: "sudo",
        description: "try it.. i dare you. :3",
        run: () => ({
            type: "error",
            value: "lool nice try.. you don't have root on someone else's portfolio..",
            color: "cli-info"
        })
    },
    {
        name: "secret",
        usage: "secret",
        description: "pick my brain! learn something random about me.",
        run: () => ({
            type: "text",
            value: randomThoughts[Math.floor(Math.random() * randomThoughts.length)],
            color: "cli-green"
        })
    },
    {
        name: "fortune",
        usage: "fortune",
        description: "i'm a piscis, if i focus hard enough, i can basically predict your future..",
        run: () => ({
            type: "text",
            value: fortunes[Math.floor(Math.random() * fortunes.length)],
            color: "cli-green"
        })
    },
    {
        name: "8ball",
        usage: "8ball <q>",
        options: ["question"],
        description: "you have doubts, i have answers.. let's go!",
        run: (args) => {
            if (!args[0]) return { type: "error", value: "ehh, what was the question?? <br> usage: 8ball <question>", color: "cli-info" };

            return { type: "text", value: ballAnswers[Math.floor(Math.random() * ballAnswers.length)] , color: "cli-green" };
        }
    },
    {
        name: "changelog",
        usage: "changelog",
        description: "check what i have been doing in here. [implement]",
        run: () => ({
            type: "text", value: "...", color: "cli-green"
        })
    },
    {
        name: "clear",
        usage: "clear",
        alias: "cls",
        description: "wipe the screen.",
        run: () => "CLEAR",
    },
    {
        name: "exit",
        alias: "bye",
        usage: "exit",
        description: "when you're ready to leave..",
        run: () => "EXIT"
    }
];

const randomThoughts = ["fact 1", "fact 2", "fact 3", "fact 4"];
const fortunes = ["fortune 1", "fortune 2", "fortune 3", "fortune 4"];
const ballAnswers = ["yass", "i don't think so", "let that sink in..", "i guess", "hmmm..", "girl.. call your therapist.", "yes babes", "nope", "let me get back to you on that..", "sure!", "ugh"]