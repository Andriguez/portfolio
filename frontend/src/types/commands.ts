import type { VfsFolder, VfsFile } from "./vfs";
import type { CommandOutput } from "./CommandOutput";

type CommandContext = {
    currentFolder: VfsFolder;
    cd: (target: string) => VfsFolder;
    resolveFile: (target: string) => VfsFile | null;
};

export type CommandDefinition = {
    name: string;
    alias?: string;
    options?: string[];
    usage: string;
    show: boolean;
    description: string;
    run: (args: string[], ctx: CommandContext) => CommandOutput | "CLEAR" | "EXIT";
};

export const commands: CommandDefinition[] = [
    {
        name: "hello",
        usage: "hello",
        description: "read the welcome message.",
        show: true,
        run: () => ({
            type: "text",
            value: "Hello world type message... but on a terminal. [implement]",
            color: "cli-dim"
        })
    },
    {
        name: "help",
        usage: "help",
        show: false,
        description: "list everything(?) you can do here.",
        run: (_args) => {

            let showExtra = false;
            if (_args[0] === "--extra") showExtra = true;

                return {
                    type: "help",
                    extra: showExtra,
                    color: "cli-green"
                }
        },
    },
    {
        name: "ls",
        alias: "dir",
        usage: "ls",
        show: true,
        description: "check what's in here.",
        run: (_args, ctx) => {
            const folder = _args[0] ? ctx.cd(_args[0]) : ctx.currentFolder;

            return ({
                type: "list",
                items: folder.children.map((c) => ({
                    name: c.name,
                    slug: c.slug,
                    isFolder: c.type === "folder",
                    description: c.description,
                    itemCount: folder.children.length,
                    updatedAt: c.updatedAt,
                })),
                color: "cli-green"
            })
        },
    },
    {
        name: "cd",
        alias: "enter",
        usage: "cd <page>",
        show: true,
        options: [" .. ","../../ ", "~ ", "directory/folder ", "back "],
        description: "go into a page; type 'cd back' to go backwards.",
        run: (args, ctx) => {
            if (!args[0]) return { type: "error", value: "usage: cd <folder>", color: "cli-info" };

            if (ctx.cd(args[0]) === null)
                return { type: "error", value: `cd: no such folder: ${args[0]}`, color: "cli-info" };
            return { type: "none", color: "cli-green" };
        },
    },
    {
        name: "cat",
        alias: "view",
        usage: "cat <file>",
        show: true,
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
        show: true,
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
        name: "download-cv",
        usage: "download-cv <type>",
        show: true,
        options: ["webdev", "cybersec", "general"],
        description: "get a copy of my cv. [implement]",
        run: () => ({
            type: "text", value: "downloading cv...", color: "cli-green"
        })
    },
    {
        name: "contact",
        alias: "email",
        show: true,
        usage: "contact <msg>",
        options: ["message"],
        description: "come on.. send me an email. [implement]",
        run: () => ({
            type: "text",
            value: "message sent...",
            color: "cli-green"
        })
    },
    {
        name: "source",
        usage: "source",
        show: false,
        description: "get the link to the public repo. [implement]",
        run: () => ({
            type: "link", value: `>Go to my github repo clicking here<`, url: "", color: "cli-green"
        })
    },
    {
        name: "stack",
        usage: "stack",
        show: false,
        description: "lists the technology used for this portfolio. [implement]",
        run: () => ({
            type: "text", value: "...", color: "cli-green"
        })
    },
    {
        name: "echo",
        alias: "say",
        show: false,
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
        show: false,
        description: "in case you were wondering: when are we??",
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
        show: false,
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
        show: false,
        description: "try it.. i dare you..",
        run: () => ({
            type: "error",
            value: "lool nice try.. you don't have root on someone else's portfolio..",
            color: "cli-info"
        })
    },
    {
        name: "secret",
        usage: "secret",
        show: false,
        description: "pick my brain! learn something random about me.[implement]",
        run: () => ({
            type: "text",
            value: randomThoughts[Math.floor(Math.random() * randomThoughts.length)],
            color: "cli-green"
        })
    },
    {
        name: "fortune",
        usage: "fortune",
        show: false,
        description: "i'm a piscis, if i focus hard enough, i can basically predict your future.. [implement]",
        run: () => ({
            type: "text",
            value: fortunes[Math.floor(Math.random() * fortunes.length)],
            color: "cli-green"
        })
    },
    {
        name: "8ball",
        usage: "8ball <q>",
        show: false,
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
        show: false,
        description: "check what i have been doing in here. [implement]",
        run: () => ({
            type: "text", value: "...", color: "cli-green"
        })
    },
    {
        name: "clear",
        usage: "clear",
        show: false,
        alias: "cls",
        description: "wipe the screen.",
        run: () => "CLEAR",
    },
    {
        name: "exit",
        alias: "bye",
        show: true,
        usage: "exit",
        description: "when you're ready to leave.. just say it",
        run: () => "EXIT"
    }
];

const randomThoughts = ["fact 1", "fact 2", "fact 3", "fact 4"];
const fortunes = ["fortune 1", "fortune 2", "fortune 3", "fortune 4"];
const ballAnswers = ["yass", "i don't think so", "let that sink in..", "i guess", "hmmm..", "girl.. call your therapist.", "yes babes", "nope", "let me get back to you on that..", "sure!", "ugh"]