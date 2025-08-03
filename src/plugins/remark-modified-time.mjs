import { statSync } from "fs";
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import { formatDateUtc,formatDate } from "../utils/formatDate.ts";

export function remarkModifiedTime() {
    // Remark 插件的标准结构是返回一个 "transformer" 函数。
    // 这个函数接收两个参数：tree (Markdown 文件的 AST) 和 file (当前处理的文件对象)。
    return function (tree, file) {
        const frontmatter = file.data.astro.frontmatter;
        let lastModifiedValue;

        // 1. 优先从 frontmatter 中获取 `date_updated`。
        // 如果是字符串，直接使用它的原始值。
        if (frontmatter.date_updated) {
            lastModifiedValue = formatDate(frontmatter.date_updated);
        } else {
            // 2. 如果没有，则回退到使用文件系统的元数据，并进行格式化。
            const filepath = file.history[0];
            const stats = statSync(filepath);
            lastModifiedValue = formatDateUtc(stats.mtime);
        }
        
        // 将最终的字符串赋值给 `lastModified`
        frontmatter.lastModified = lastModifiedValue;

        // --- 处理阅读时长 ---
        // 1. 将 Markdown 的 AST 转换为纯文本字符串。
        const textOnPage = toString(tree);
        // 2. 使用 getReadingTime 库分析纯文本，返回一个包含字数、阅读分钟数等信息的对象。
        // 3. 将这个阅读时长对象赋值给 frontmatter 的 readingTime 属性。
        file.data.astro.frontmatter.readingTime = getReadingTime(textOnPage);
    };
}
