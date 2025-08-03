import { statSync } from "fs";
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import { formatDateUtc } from "../utils/formatDate.ts";

export function remarkModifiedTime() {
    // Remark 插件的标准结构是返回一个 "transformer" 函数。
    // 这个函数接收两个参数：tree (Markdown 文件的 AST) 和 file (当前处理的文件对象)。
    return function (tree, file) {
        // 从 file 对象中获取当前正在处理的文件的完整路径。
        const filepath = file.history[0];
        // 使用 statSync 获取该文件的详细状态信息（包括大小、创建时间、修改时间等）。
        const stats = statSync(filepath);
        
        // --- 处理最后修改时间 ---
        // 将文件的最后修改时间（stats.mtime，一个 Date 对象）通过 formatDateUtc 函数格式化，
        // 然后将其赋值给 frontmatter 的 lastModified 属性。
        // 这样，我们就可以在页面上显示“最后更新于”等信息。
        file.data.astro.frontmatter.lastModified = formatDateUtc(stats.mtime);

        // --- 处理阅读时长 ---
        // 1. 将 Markdown 的 AST 转换为纯文本字符串。
        const textOnPage = toString(tree);
        // 2. 使用 getReadingTime 库分析纯文本，返回一个包含字数、阅读分钟数等信息的对象。
        // 3. 将这个阅读时长对象赋值给 frontmatter 的 readingTime 属性。
        file.data.astro.frontmatter.readingTime = getReadingTime(textOnPage);
    };
}
