import { statSync } from "fs";
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import { formatDateUtc } from "../utils/formatDate.ts";

export function remarkModifiedTime() {
    return function (tree, file) {
        const filepath = file.history[0];
        const stats = statSync(filepath);
        // 直接传入 Date 对象 stats.mtime.toISOString() '2025-01-02T12:03:08.316Z' 实际是20.03，但是显示为utc。
        file.data.astro.frontmatter.lastModified = formatDateUtc(stats.mtime);

        // 获取文章字数和阅读时长
        const textOnPage = toString(tree);
        file.data.astro.frontmatter.readingTime = getReadingTime(textOnPage);
    };
}

