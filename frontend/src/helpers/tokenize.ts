export function tokenize(raw: string): string[] {
    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const tokens: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
        tokens.push(match[1] ?? match[2] ?? match[3]);
    }
    return tokens;
}