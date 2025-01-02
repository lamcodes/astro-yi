import { statSync } from "fs";
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import { formatDate } from "../utils/formatDate.ts";

export function remarkModifiedTime() {
    return function (tree, file) {
        const filepath = file.history[0];
        const stats = statSync(filepath);
        // 直接传入 Date 对象
        file.data.astro.frontmatter.lastModified = formatDate(stats.mtime);

        // 获取文章字数和阅读时长
        const textOnPage = toString(tree);
        file.data.astro.frontmatter.readingTime = getReadingTime(textOnPage);
    };
}

