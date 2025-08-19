// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

/**
 * title {string} website title
 * favicon {string} website favicon url
 * description {string} website description
 * author {string} author
 * avatar {string} Avatar used in the profile
 * motto {string} used in the profile
 * url {string} Website link
 * recentBlogSize {number} Number of recent articles displayed in the sidebar
 * archivePageSize {number} Number of articles on archive pages
 * postPageSize {number} Number of articles on blog pages
 * feedPageSize {number} Number of articles on feed pages
 * beian {string} Chinese policy
 */
export const site = {
  title: "Zane blog", // required - 网站标题，用于 BaseHead.astro, Header.astro, RSS.xml.js
  // favicon: "/favicon.svg", // 已弃用，使用 favicon16 和 favicon32 替代
  description: "Welcome to my independent blog website! ", // 网站描述，用于 BaseHead.astro, RSS.xml.js
  author: "Zane", // required - 作者名称，用于 BlogFooter.astro
  avatar: "/avatar.png", // required - 个人头像，用于 BaseHead.astro, Header.astro, Profile.astro
  url: "https://blog.zkplife.com", // required - 网站链接，用于 BlogFooter.astro, RSS.xml.js
  motto: "Actions speak louder than words.", // 个人格言，用于 Header.astro, Profile.astro
  recentBlogSize: 5, // 侧边栏显示最近文章数量，用于 BlogAside.astro
  archivePageSize: 25, // 归档页面每页文章数，用于 archive/[page].astro, archive/index.astro
  postPageSize: 10, // 博客页面每页文章数，用于 index.astro, blog/[page].astro
  feedPageSize: 20, // Feed页面每页文章数，用于 feed/[page].astro
  beian: "", // 备案信息，用于 Footer.astrove
  
  // 静态资源路径配置
  appleTouchIcon: "/apple-touch-icon.png",
  favicon32: "/favicon-32x32.png",
  favicon16: "/favicon-16x16.png",
  siteManifest: "/site.webmanifest",
};

/**
 * busuanzi {boolean} 不蒜子统计：https://busuanzi.ibruce.info/
 * lang {Lang} 默认网站语言
 * codeFoldingStartLines {number} 代码折叠起始行数
 * ga {string|false} Google Analytics 追踪ID
 * memosUrl {string} Memos 服务器地址
 * memosUsername {string} Memos 登录用户名
 * memosPageSize {number} Memos 每页显示数量
 * umami {string|false} Umami 统计脚本地址，false表示禁用
 * umamiWebsiteId {string} Umami 网站ID
 */
type Lang = "en" | "zh-cn" | "zh-Hant" | "cs";

export const config = {
  busuanzi: false, // 不蒜子统计开关
  lang: "zh-cn" as Lang, // 网站语言：en | zh-cn | zh-Hant | cs
  codeFoldingStartLines: 16, // 代码折叠起始行数，修改后需重启项目
  ga: false, // Google Analytics 追踪ID，填入ID即可启用

  // memos 配置
  memosUrl: "", // Memos 服务器地址：https://xxxx.xxx.xx
  memosUsername: "", // Memos 登录用户名
  memosPageSize: 10, // Memos 每页显示数量

  // umami 配置
  umami: "https://umami.zkplife.com/script.js", // Umami 脚本地址，false表示禁用
  umamiWebsiteId: "3e6a4666-92fb-4edc-9aa2-bb8b567c5069", // Umami 网站ID
};

/**
 * Navigator
 * id {string} translation key for the name
 * iconClass {string} icon style
 * href {string} link url
 * target {string} optional "_self|_blank" open in current window / open in new window
 */
export const categories = [
  {
    id: 'nav.blog',
    iconClass: "ri-draft-line",
    href: "/blog/1",
    target: "_self"
  },
  {
    id: 'nav.feed',
    iconClass: "ri-lightbulb-flash-line",
    href: "/feed/1",
    target: "_self"
  },
  // {
  //   name: "Memos",
  //   iconClass: "ri-quill-pen-line",
  //   href: "/memos",
  // },
  {
    id: 'nav.archive',
    iconClass: "ri-archive-line",
    href: "/archive/1",
    target: "_self"
  },
  {
    id: 'nav.message',
    iconClass: "ri-chat-1-line",
    href: "/message",
    target: "_self"
  },
  {
    id: 'nav.search',
    iconClass: "ri-search-line",
    href: "/search",
    target: "_self"
  },
  {
    id: 'nav.more',
    iconClass: "ri-more-fill",
    href: "javascript:void(0);",
    target: "_self",
    children: [
      {
        id: 'nav.about',
        iconClass: "ri-information-line",
        href: "/about",
        target: "_self"
      }
    ]
  }
];

/**
 * Personal link address
 */
interface InfoLink {
  icon: string;
  name: string;
  outlink: string;
}

export const infoLinks: InfoLink[] = [
  // {
  //   icon: "ri-telegram-fill",
  //   name: "telegram",
  //   outlink: "xxxxxxx",
  // },
  // {
  //   icon: "ri-twitter-fill",
  //   name: "twitter",
  //   outlink: "xxxxxxx",
  // },
  // {
  //   icon: "ri-instagram-fill",
  //   name: "instagram",
  //   outlink: "xxxxxxx",
  // },
  // {
  //   icon: "ri-github-fill",
  //   name: "github",
  //   outlink: "xxxxxxx",
  // },
  {
    icon: "ri-rss-fill",
    name: "rss",
    outlink: "/rss.xml",
  },
];

/**
 * donate
 * enable {boolean}
 * tip {string}
 * wechatQRCode: Image addresses should be placed in the public directory.
 * alipayQRCode: Image addresses should be placed in the public directory.
 * paypalUrl {string}
 */
export const donate = {
  enable: false,
  tip: "Thanks for the coffee !!!",
  wechatQRCode: "/WeChatQR.png",
  alipayQRCode: "/AliPayQR.png",
  paypalUrl: "https://paypal.me/xxxxxxxxxx",
};

/**
 * Friendship Links Page
 * name {string}
 * url {string}
 * avatar {string}
 * description {string}
 */
export const friendshipLinks = [
  {
    name: "Cirry's Blog",
    url: 'https://cirry.cn',
    avatar: "https://cirry.cn/avatar.png",
    description: '前端开发的日常'
  },
];

/**
 * Comment Feature
 * enable {boolean}
 * type {string} required waline | giscus
 * walineConfig.serverUrl {string} server link
 * walineConfig.lang {string} link: https://waline.js.org/guide/features/i18n.html
 * walineConfig.pageSize {number} number of comments per page. default 10
 * walineConfig.wordLimit {number} Comment word s limit. When a single number is filled in, it 's the maximum number of comment words. No limit when set to 0
 * walineConfig.count {number} recent comment numbers
 * walineConfig.pageview {boolean} display the number of page views and comments of the article
 * walineConfig.reaction {string | string[]} Add emoji interaction function to the article
 * walineConfig.requiredMeta {string[]}  Set required fields, default anonymous
 * walineConfig.whiteList {string[]} set some pages not to display reaction
 */
export const comment = {
  enable: false,
  type: "giscus", // waline | giscus,
  walineConfig: {
    serverUrl: "",
    lang: "en",
    pageSize: 20,
    wordLimit: "",
    count: 5,
    pageview: true,
    reaction: true,
    requiredMeta: ["nick", "mail"],
    whiteList: ["/message/", "/friends/"],
  },

  // giscus config
  giscusConfig: {
    "data-repo": "",
    "data-repo-id": "",
    "data-category": "",
    "data-category-id": "",
    "data-mapping": "",
    "data-strict": "",
    "data-reactions-enabled": "",
    "data-emit-metadata": "",
    "data-input-position": "",
    "data-theme": "",
    "data-lang": "",
    crossorigin: "",
  },
};
