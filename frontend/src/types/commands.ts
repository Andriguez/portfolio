import type { VfsFolder, VfsFile } from "./vfs";
import type { CommandOutput } from "./CommandOutput";
import type { SiteData } from "../hooks/useSiteData";
import { CV_PLACE, type Place } from "../hooks/useVfs";
import changelog from "../../CHANGELOG.md?raw";

type CommandContext = {
    currentFolder: VfsFolder;
    cd: (target: string) => VfsFolder;
    resolveFile: (target: string) => VfsFile | null;
    site: SiteData;
    place: Place | null;
    goToPlace: (p: Place) => void;
    theme: "dark" | "light";
    setTheme: (t: "dark" | "light") => void;
};

export type CommandDefinition = {
    name: string;
    alias?: string;
    options?: string[] | ((site: SiteData) => string[]);
    usage: string;
    show: boolean;
    description: string;
    run: (args: string[], ctx: CommandContext) => CommandOutput | "CLEAR" | "EXIT" | "LOGIN";
};

export const commands: CommandDefinition[] = [
    {
        name: "hello",
        usage: "hello",
        description: "read the welcome message.",
        show: true,
        run: (_args, ctx) => {
            const hello_msg = ctx.site.staticContent.hello_message;
            
            return {
                type: "text",
                value: hello_msg,
                color: "cli-dim"
            };
        }
    },
    {
        name: "help",
        usage: "help",
        show: false,
        description: "list everything(?) you can do here.",
        run: (_args) => {
                return {
                    type: "help",
                    extra: _args[0] === "--extra" || _args[0] === "—extra" ? true : false,
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
                items: folder.children?.map((c) => ({
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

            const clean = args[0].replace(/^~?\/+/, "").replace(/\/+$/, "").toLowerCase();
            if (clean === "cv") {
                if (ctx.site.cvs.length === 0)
                    return { type: "error", value: "cd: no cv available just yet..", color: "cli-info"}

                ctx.goToPlace("cv");
                return { type: "none", color: "cli-green" };
            }

            if (!ctx.cd(args[0])) return { type: "error", value: `cd: no such folder: ${args[0]}`, color: "cli-info" };

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
            if (!args[0]) {
                if (ctx.place === CV_PLACE && ctx.site.cvs.length > 0)
                    return { type: "cv-list", cvs: ctx.site.cvs, color: "cli-green" }

                return { type: "error", value: "usage: cat <file>", color: "cli-info" };
            }

            const file = ctx.resolveFile(args[0] ?? "");
            if (!file) return { type: "error", value: `cat: no such file: ${args[0]}`, color: "cli-info"}

            if (file.cv)
            return { type: "cv-view", cv: file.cv, color: "cli-green" };

            return { type: "markdown", file, color: "cli-green" }
        },
    },
    {
        name: "links",
        usage: "links <media>",
        show: true,
        description: "let's get friendly :).",
        options: (site) => site.links.map((l) => l.name.toLowerCase()),
        run: (_args, ctx) => {
            const links = ctx.site.links;
            if (links.length === 0)
                return { type: "error", value: "no links yet, check back soon.", color: "cli-info" };

            const [name] = _args;
            if (!name) return { type: "link-list", links, color: "cli-green" };

            const match = links.find((l) => l.name.toLowerCase() === name.toLowerCase());
            if (!match)
                return {
                    type: "error",
                    value: `no link named "${name}". available: ${links.map((l) => l.name.toLowerCase()).join(", ")}`,
                    color: "cli-info",
                };

            return { type: "link-list", links: [match], color: "cli-green" };
        },
    },
    {
        name: "cv",
        alias: "resume",
        usage: "cv <type>",
        show: true,
        options: (site) => site.cvs.map((l) => l.type.toLowerCase()),
        description: "get a copy of my cv.",
        run: (args, ctx) => {
            const cvs = ctx.site.cvs;
            ctx.goToPlace(CV_PLACE);

            if (cvs.length === 0) return { type: "error", value: "no cv available right now.", color: "cli-info" };
            if (!args[0]) return { type: "cv-list", cvs, color: "cli-green" };

            const cv = cvs.find((c) => c.type === args[0].toLowerCase());
            if (cv)return {type: "cv-view", cv: cv, color: "cli-green"}
            
            if (!cv) return { 
                type: "error", 
                value: `no cv version "${args[0]}". available: ${cvs.map((c) => c.type).join(", ")}`,
                color: "cli-info" 
            };

            return { type: "cv-list", cvs: [cv], color: "cli-green" };
        }
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
        run: (_args, ctx) => {
           const stack_msg = ctx.site.staticContent.stack_info;

           return {
                type: "text",
                value: stack_msg,
                color: "cli-dim"
           }
        }
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
        description: "check what i have been doing in here.",

        run: () => ({
            type: "changelog", file: changelog ,color: "cli-green"
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
        name: "theme",
        usage: "theme <dark|light>",
        show: true,
        options: ["dark", "light"],
        description: "change the theme of the terminal or leave empty to switch.",
        run: (args, ctx) => {
            if (!args[0]) {
                const next = ctx.theme === "dark" ? "light" : "dark";
                ctx.setTheme(next);
                return { type: "text", value:  `Theme changed to ${next}`, color: "cli-green"};
            }

            const name = args[0].toLowerCase();

            if (name !== "dark" && name !== "light") return { type: "error", value: `theme: no such theme: ${args[0]}`, color: "cli-info" };

            ctx.setTheme(name)

            return { type: "text", value: `Theme changed to ${name}`, color: "cli-green" };
        }
    },
    {
        name: "exit",
        alias: "bye",
        show: true,
        usage: "exit",
        description: "when you're ready to leave.. just say it.",
        run: () => "EXIT"
    },
    {
        name: "login",
        alias: "sudo",
        show: false,
        usage: "...",
        description: "...",
        run: () => "LOGIN"
    }
];

const randomThoughts = ["fact 1", "fact 2", "fact 3", "fact 4"];
const fortunes = ["fortune 1", "fortune 2", "fortune 3", "fortune 4"];
const ballAnswers = ["yass", "i don't think so", "let that sink in..", "i guess", "hmmm..", "girl.. call your therapist.", "yes babes", "nope", "let me get back to you on that..", "sure!", "ugh"]

export function getOptions(cmd: CommandDefinition, site: SiteData): string[] {
    const raw = typeof cmd.options === "function" ? cmd.options(site) : (cmd.options ?? []);
    return raw.map((o) => o.trim());   // drops the padding spaces in " github "
}