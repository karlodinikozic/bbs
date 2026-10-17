const MAX_UNICODE_CHAR = "\u{10FFFF}";

export function startsWithRange(prefix: string) {
    return { gte: prefix, lt: prefix + MAX_UNICODE_CHAR };
}