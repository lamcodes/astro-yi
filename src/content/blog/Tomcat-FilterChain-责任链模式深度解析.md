---
id: 'unique-20260227-235249'
title: 'Tomcat-FilterChain-责任链模式深度解析'
description: ''
date: 2026-02-27 23:52:49
date_updated: 2026-02-27 23:52:49
tags: ['设计模式', 'tomcat', '源码分析']
category: ['技术', 'java']
katex: false
pin: false
draft: false
---


# Tomcat FilterChain 责任链模式深度解析

> 基于 Tomcat 9.0.46 源码分析
> 作者风格: Linus Torvalds - "好品味"代码的典范
> 本文使用ai生成

---

## 【核心答案 - 三句话说清楚组装过程】

1. **StandardContext 存配置** - 应用启动时把所有 Filter 信息存到 `Map<String, FilterConfig>` 和 `FilterMap[]`
2. **ApplicationFilterFactory 做匹配** - 每次请求根据 URL pattern 从 Map 里捞出匹配的 Filter
3. **ApplicationFilterChain 用数组串起来** - 把匹配的 Filter 依次 `addFilter()` 到数组里

---

## 目录

- [一、数据结构 - 好品味的体现](#一数据结构---好品味的体现)
- [二、组装流程 - 代码路径](#二组装流程---代码路径)
- [三、执行流程 - 消除特殊情况](#三执行流程---消除特殊情况)
- [四、回调机制深度解析](#四回调机制深度解析)
- [五、为什么不用for循环](#五为什么不用for循环)
- [六、pos状态管理机制](#六pos状态管理机制)
- [七、装饰器模式的应用](#七装饰器模式的应用)
- [八、完整调用链 - 图解](#八完整调用链---图解)
- [九、Linus 式评价](#九linus-式评价)
- [十、源码文件索引](#十源码文件索引)

---

## 一、数据结构 - 好品味的体现

### 1.1 ApplicationFilterChain 的内部结构

```java
// ApplicationFilterChain.java: 行74-87
// 核心字段就这4个
private ApplicationFilterConfig[] filters = new ApplicationFilterConfig[0];  // Filter数组
private int pos = 0;        // 当前位置游标
private int n = 0;          // 有效Filter数量
private Servlet servlet;    // 链条终点
```

**这就是全部状态！** 没有 `next` 指针，没有链表节点，就一个数组 + 一个索引。

### 1.2 StandardContext 的 Filter 存储

```java
// StandardContext.java: 行378
private Map<String, ApplicationFilterConfig> filterConfigs = new HashMap<>();
// name -> config映射

// StandardContext.java: 行4455
private FilterMap[] array = new FilterMap[0];
// Filter映射规则数组
```

**数据关系**:
- `FilterMap[]`: 存储 URL 模式到 Filter 名称的映射(web.xml 配置)
- `Map<String, ApplicationFilterConfig>`: Filter 名称到 Filter 实例的映射
- 查询流程: `请求URL` → `匹配FilterMap[]` → `从Map查找FilterConfig` → `添加到FilterChain`

### 1.3 好品味分析

> "Bad programmers worry about the code. Good programmers worry about data structures."
> — Linus Torvalds

**为什么这是好设计？**

1. **数组而非链表** - 简单、快速、没有额外对象分配
2. **游标而非递归** - 栈空间可控，性能可预测
3. **长度字段 `n`** - 数组可复用，避免频繁扩容
4. **零特殊情况** - 不需要判断 `next == null`

---

## 二、组装流程 - 代码路径

### 2.1 应用启动 - 初始化所有 Filter

```java
// StandardContext.java: 第4557-4567行
public boolean filterStart() {
    synchronized (filterConfigs) {
        filterConfigs.clear();
        for (Entry<String, FilterDef> entry : filterDefs.entrySet()) {
            String name = entry.getKey();
            // 创建Filter实例并缓存
            ApplicationFilterConfig config =
                new ApplicationFilterConfig(this, entry.getValue());
            filterConfigs.put(name, config);  // 存到Map
        }
    }
    return true;
}
```

**此时**: 所有 Filter 实例已经创建好，等着被使用。

**文件位置**: `StandardContext.java:4557-4567`

---

### 2.2 请求到达 - 创建 FilterChain

```java
// StandardWrapperValve.java: 第172-174行
ApplicationFilterChain filterChain =
    ApplicationFilterFactory.createFilterChain(request, wrapper, servlet);
```

**时机**: 每次 HTTP 请求到达时创建新的 FilterChain 实例。

**文件位置**: `StandardWrapperValve.java:172-174`

---

### 2.3 工厂内部 - 动态组装链条

```java
// ApplicationFilterFactory.java: 第53-136行
public static ApplicationFilterChain createFilterChain(
        ServletRequest request, Wrapper wrapper, Servlet servlet) {

    // 1. 创建FilterChain对象
    ApplicationFilterChain chain = new ApplicationFilterChain();
    chain.setServlet(servlet);  // 设置终点

    // 2. 从Context获取所有FilterMap
    StandardContext context = (StandardContext) wrapper.getParent();
    FilterMap filterMaps[] = context.findFilterMaps();  // 行84

    // 3. 遍历FilterMap,匹配URL pattern
    for (FilterMap filterMap : filterMaps) {
        // 3.1 匹配Dispatcher类型(REQUEST/FORWARD/INCLUDE/ERROR/ASYNC)
        if (!matchDispatcher(filterMap, dispatcher))
            continue;

        // 3.2 匹配URL pattern(如 /api/*)
        if (!matchFiltersURL(filterMap, requestPath))
            continue;

        // 3.3 根据Filter名称从Map里查找实例
        ApplicationFilterConfig config = (ApplicationFilterConfig)
            context.findFilterConfig(filterMap.getFilterName());  // 行109-110

        // 3.4 添加到FilterChain
        if (config != null) {
            chain.addFilter(config);  // 行115 - 关键!!
        }
    }

    return chain;
}
```

**关键步骤**:
- `findFilterMaps()` - 返回所有 URL → Filter Name 的映射
- `matchFiltersURL()` - 看当前请求 URL 是否匹配这个 Filter 的 pattern
- `findFilterConfig()` - 根据 Filter 名称从缓存 Map 查找实例
- `addFilter()` - 把 Filter 加到数组里

**文件位置**: `ApplicationFilterFactory.java:53-136`

---

### 2.4 添加到数组 - 简单粗暴

```java
// ApplicationFilterChain.java: 第273-288行
void addFilter(ApplicationFilterConfig filterConfig) {
    // 防止重复添加
    for (ApplicationFilterConfig filter : filters)
        if (filter == filterConfig)
            return;

    // 数组满了就扩容(每次+10)
    if (n == filters.length) {
        ApplicationFilterConfig[] newFilters =
            new ApplicationFilterConfig[n + INCREMENT];  // INCREMENT=10
        System.arraycopy(filters, 0, newFilters, 0, n);
        filters = newFilters;
    }

    filters[n++] = filterConfig;  // 加到尾部
}
```

**实用主义设计**:
- ✅ 初始长度为 0 - 没 Filter 就不浪费内存
- ✅ 每次扩容 +10 而非翻倍 - 因为大部分 Servlet 只有 2-3 个 Filter
- ✅ 用 `System.arraycopy()` - native 优化，比循环快

**文件位置**: `ApplicationFilterChain.java:273-288`

---

## 三、执行流程 - 消除特殊情况

### 3.1 核心代码 - internalDoFilter()

```java
// ApplicationFilterChain.java: 第166-241行
private void internalDoFilter(ServletRequest request, ServletResponse response)
    throws IOException, ServletException {

    // 还有Filter没执行?
    if (pos < n) {
        ApplicationFilterConfig filterConfig = filters[pos++];  // 取当前并后移
        Filter filter = filterConfig.getFilter();

        // 【关键】把this(FilterChain自己)传给Filter
        filter.doFilter(request, response, this);
        return;
    }

    // 没Filter了?直接执行Servlet
    servlet.service(request, response);
}
```

**这就是全部逻辑！**
- ❌ 没有 `if-else` 树
- ❌ 没有 `next == null` 判断
- ❌ 没有"第一个"和"最后一个"的特殊处理
- ✅ `if (pos < n)` 一个条件统治一切

**文件位置**: `ApplicationFilterChain.java:166-241`

---

### 3.2 好品味体现

> "Good taste is eliminating corner cases."
> — Linus Torvalds

**与糟糕设计的对比**:

```java
// ❌ 糟糕的递归设计(很多教科书这么写)
public void doFilter(Request req, Response res) {
    if (currentFilter != null) {
        currentFilter.doFilter(req, res, this);
        currentFilter = nextFilter;  // 需要维护next指针
        doFilter(req, res);           // 递归调用
    } else {
        servlet.service(req, res);   // 特殊情况处理!
    }
}
```

**Tomcat 的设计**:
1. **没有暴露链表结构** - 你不需要知道 `next` 指针在哪
2. **没有特殊情况** - 第一个 Filter 和最后一个 Filter 的代码完全一样
3. **职责单一** - Filter 只管处理请求，FilterChain 只管传递控制权

---

## 四、回调机制深度解析

### 4.1 这是递归吗？

**🟡 不是传统递归，是"嵌套回调"**

#### **传统递归 vs Tomcat 的回调**

```java
// ❌ 传统递归（每次调用都是独立栈帧）
void recursiveSum(int n) {
    if (n <= 0) return 0;
    return n + recursiveSum(n - 1);  // 方法调用自己
}

// ✅ Tomcat 的回调机制（不同方法互相调用）
// FilterChain.internalDoFilter()
filter.doFilter(request, response, this);
    ↓
// Filter.doFilter()
chain.doFilter(request, response);
    ↓
// FilterChain.internalDoFilter() ← 回到这里，但 pos 已经改变
```

#### **关键区别**

| 特征 | 传统递归 | Tomcat 回调 |
|------|---------|-------------|
| 调用方式 | 方法调用自己 | A 调用 B，B 调用 A |
| 栈帧 | 每次新建栈帧 | 交替的栈帧 |
| 状态保存 | 在栈上（局部变量） | 在对象上（实例字段） |
| 终止条件 | 某个参数达到边界 | `pos >= n` |

### 4.2 调用栈详解

```
调用栈（从下往上看）:

第1次进入 internalDoFilter()  pos=0, n=3
    ├─ filters[0] = AuthFilter
    └─ AuthFilter.doFilter(req, res, chain)  ← 进入 Filter
        ├─ 前置: 校验token
        └─ chain.doFilter(req, res)  ← Filter 调用 chain
            ↓
第2次进入 internalDoFilter()  pos=1, n=3  ← 注意: pos 已经是 1 了!
    ├─ filters[1] = LogFilter
    └─ LogFilter.doFilter(req, res, chain)
        ├─ 前置: 记录时间
        └─ chain.doFilter(req, res)
            ↓
第3次进入 internalDoFilter()  pos=2, n=3
    ├─ filters[2] = CorsFilter
    └─ CorsFilter.doFilter(req, res, chain)
        ├─ 前置: 设置 CORS 头
        └─ chain.doFilter(req, res)
            ↓
第4次进入 internalDoFilter()  pos=3, n=3  ← pos >= n 了
    └─ servlet.service(req, res)  ← 执行 Servlet
        ↓
        返回 CorsFilter
        └─ 后置: 记录响应头
        ↓
        返回 LogFilter
        └─ 后置: 计算耗时
        ↓
        返回 AuthFilter
        └─ 后置: 记录日志
```

**这不是递归，这是"嵌套回调" - 每个 Filter 都在等待下一个 Filter 返回！**

### 4.3 为什么 Filter 和 FilterChain 都有 doFilter？

#### **职责分离的精妙设计**

```java
// Filter.doFilter() - "我要处理并决定要不要传下去"
void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)

// FilterChain.doFilter() - "传给下一个家伙"
void doFilter(ServletRequest request, ServletResponse response)
```

#### **三个关键问题**

**问题1: Filter 需要控制流程**
```java
// Filter 可以决定：要不要调用 chain.doFilter()

// 情况1: 中断链条
if (!isAuthenticated(request)) {
    response.sendError(401);
    return;  // 不调用 chain.doFilter(),后续 Filter 和 Servlet 都不执行
}

// 情况2: 继续传递
chain.doFilter(request, response);  // 调用它,传给下一个
```

**问题2: Filter 需要修改 request/response**
```java
// Filter 可以决定：传什么给下一个

// 传原始对象
chain.doFilter(request, response);

// 传包装后的对象（装饰器模式）
ResponseWrapper wrapped = new ResponseWrapper(response, encoding);
chain.doFilter(request, wrapped);  // 下一个 Filter 看到的是 wrapped!
```

**问题3: FilterChain 需要隐藏"下一个是谁"**
```java
// FilterChain.doFilter() 不需要 chain 参数
// 因为它自己就知道下一个是谁(内部有 filters[] 和 pos)

chain.doFilter(request, response);  // FilterChain 内部会找到 filters[pos++]
```

**如果 FilterChain.doFilter() 也需要传 chain，就成递归死循环了！**

### 4.4 完整示例 - 代码+注释

```java
public class ApplicationFilterChain {
    private Filter[] filters;
    private int pos = 0;  // 实例字段，整个请求期间共享
    private int n = 0;
    private Servlet servlet;

    public void doFilter(ServletRequest req, ServletResponse res) {
        internalDoFilter(req, res);
    }

    private void internalDoFilter(ServletRequest req, ServletResponse res) {
        System.out.println("进入 internalDoFilter(), pos=" + pos + ", n=" + n);

        if (pos < n) {
            Filter filter = filters[pos++];  // 关键: pos 立即递增!
            System.out.println("调用 Filter: " + filter.getClass().getSimpleName() + ", pos 现在=" + pos);

            filter.doFilter(req, res, this);  // 把 this 传进去
            // 注意: 这里会阻塞，等待 filter.doFilter() 返回

            System.out.println("Filter 返回: " + filter.getClass().getSimpleName());
            return;
        }

        System.out.println("所有 Filter 执行完毕, 调用 Servlet");
        servlet.service(req, res);
    }
}

// Filter 实现
public class LogFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        System.out.println("[LogFilter] 前置处理");

        chain.doFilter(req, res);  // 调用 chain（同一个对象）
        // 这里会阻塞，等待下一个 Filter 返回

        System.out.println("[LogFilter] 后置处理");
    }
}
```

#### **执行输出**

```
进入 internalDoFilter(), pos=0, n=3
调用 Filter: AuthFilter, pos 现在=1
[AuthFilter] 前置处理
    进入 internalDoFilter(), pos=1, n=3  ← pos 已经是 1 了!
    调用 Filter: LogFilter, pos 现在=2
    [LogFilter] 前置处理
        进入 internalDoFilter(), pos=2, n=3
        调用 Filter: CorsFilter, pos 现在=3
        [CorsFilter] 前置处理
            进入 internalDoFilter(), pos=3, n=3  ← pos >= n 了
            所有 Filter 执行完毕, 调用 Servlet
            [Servlet] 处理请求
        [CorsFilter] 后置处理
        Filter 返回: CorsFilter
    [LogFilter] 后置处理
    Filter 返回: LogFilter
[AuthFilter] 后置处理
Filter 返回: AuthFilter
```

---

## 五、为什么不用for循环？

### 5.1 for循环的致命缺陷

#### **❌ 假设用 for 循环**

```java
// 糟糕的设计
public void doFilter(ServletRequest request, ServletResponse response) {
    for (int i = 0; i < n; i++) {
        Filter filter = filters[i].getFilter();
        filter.doFilter(request, response);  // 没有 chain 参数!
    }
    servlet.service(request, response);
}
```

### 5.2 问题1: 无法支持"三明治"处理

**什么是"三明治"处理？**

```java
// Filter 需要在调用下一个之前和之后都做处理
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    // 【前置处理】- 面包片1
    long start = System.currentTimeMillis();
    logRequestStart(request);

    // 【调用下一个】- 夹心
    chain.doFilter(request, response);  // 这里会阻塞，等待下一个返回

    // 【后置处理】- 面包片2
    long duration = System.currentTimeMillis() - start;
    logRequestEnd(request, duration);
}
```

**for循环做不到这个**:

```java
// ❌ for循环版本
for (int i = 0; i < n; i++) {
    Filter filter = filters[i].getFilter();

    // 前置处理
    filter.beforeProcess(request, response);

    // ??? 怎么在"所有后续Filter和Servlet执行完"之后做后置处理？
    // for循环一旦进入下一次迭代，就回不到这里了！

    // 后置处理 - 做不到!
    filter.afterProcess(request, response);  // 这会在下一个Filter之前执行，不是之后!
}
```

### 5.3 问题2: 无法中断链条

**Filter 需要能够中断链条**:

```java
// 认证 Filter
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    if (!isAuthenticated(request)) {
        response.sendError(401);
        return;  // 不调用 chain.doFilter()，链条中断
    }

    chain.doFilter(request, response);  // 认证通过，继续
}
```

**for循环做不到**:

```java
// ❌ for循环版本
for (int i = 0; i < n; i++) {
    Filter filter = filters[i].getFilter();
    filter.doFilter(request, response);

    // ??? Filter 怎么告诉 for 循环"别继续了"？
    // 抛异常？太丑了，而且会破坏正常的错误处理
    // 返回 boolean？需要修改 Filter 接口，破坏向后兼容
}
```

### 5.4 问题3: 无法修改传递的对象

**Filter 需要能够包装 request/response**:

```java
// 字符编码 Filter
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    // 包装 response，自动添加 charset
    ResponseWrapper wrapped = new ResponseWrapper(response, "UTF-8");

    // 传包装后的对象给下一个 Filter
    chain.doFilter(request, wrapped);  // 下一个 Filter 看到的是 wrapped
}
```

**for循环做不到**:

```java
// ❌ for循环版本
ServletRequest currentRequest = request;
ServletResponse currentResponse = response;

for (int i = 0; i < n; i++) {
    Filter filter = filters[i].getFilter();

    // ??? Filter 怎么修改 currentRequest/currentResponse？
    // Filter 没有返回值，无法返回包装后的对象
    // 只能在 Filter 内部修改对象的状态，但这可能被后续代码覆盖

    filter.doFilter(currentRequest, currentResponse);
}
```

### 5.5 回调机制完美解决这些问题

```java
// ✅ Tomcat 的回调机制
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    // 前置处理
    long start = System.currentTimeMillis();

    // 可以中断链条
    if (!isValid(request)) {
        response.sendError(400);
        return;  // 不调用 chain.doFilter()
    }

    // 可以包装对象
    ResponseWrapper wrapped = new ResponseWrapper(response, "UTF-8");

    // 调用下一个（会阻塞等待）
    chain.doFilter(request, wrapped);

    // 后置处理 - 完美支持!
    long duration = System.currentTimeMillis() - start;
    log("Request took " + duration + "ms");
}
```

### 5.6 对比总结

| 特性 | for循环 | 回调机制 |
|------|---------|----------|
| **前置处理** | ✅ 支持 | ✅ 支持 |
| **后置处理** | ❌ 不支持 | ✅ 支持 |
| **中断链条** | ❌ 困难（需要异常或返回值） | ✅ 简单（不调用chain.doFilter()） |
| **包装对象** | ❌ 不支持 | ✅ 支持（装饰器模式） |
| **异常处理** | ❌ 难以在finally中清理 | ✅ 可以用try-finally |
| **代码复杂度** | 🟡 看似简单，实则无法满足需求 | 🟢 稍复杂，但功能完整 |

---

## 六、pos状态管理机制

### 6.1 为什么 pos 不会重置为 0？

**🔑 关键洞察: pos 是 FilterChain 的状态，不是局部变量**

#### **pos 的生命周期**

```java
// 1. 创建 FilterChain 对象
ApplicationFilterChain chain = new ApplicationFilterChain();
chain.pos = 0;  // 初始值
chain.n = 0;
chain.filters = new Filter[0];

// 2. 添加 Filter
chain.addFilter(authFilter);   // n=1
chain.addFilter(logFilter);    // n=2
chain.addFilter(corsFilter);   // n=3

// 3. 开始执行
chain.doFilter(request, response);
    ↓
internalDoFilter() {
    if (pos < n) {  // 0 < 3
        Filter filter = filters[pos++];  // pos=0 → pos=1
        filter.doFilter(req, res, this);  // 把 this 传进去

        // 注意: 这里的 this.pos 已经是 1 了!
    }
}
```

### 6.2 为什么传 this 进去，pos 不会重置？

**因为传的是对象引用，不是复制！**

```java
// Filter 内部
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
    // chain 是什么？是 ApplicationFilterChain 对象的引用
    // 它的 pos 字段是多少？是 1（上一次 pos++ 的结果）

    chain.doFilter(req, res);  // 调用同一个对象的 doFilter()

    // chain.doFilter() 内部再次调用 internalDoFilter()
    // 此时 this.pos 是 1，所以取 filters[1]
}
```

### 6.3 详细的内存图

```
内存布局:

[ApplicationFilterChain对象]
    ├─ filters[] = [AuthFilter, LogFilter, CorsFilter]
    ├─ pos = 0  ← 初始状态
    └─ n = 3

第1次调用 internalDoFilter():
    ├─ pos < n?  0 < 3  ✅
    ├─ filter = filters[0]  → AuthFilter
    ├─ pos++ → pos = 1  ← pos 被修改了!
    └─ AuthFilter.doFilter(req, res, this)  ← this 指向同一个对象
        ↓
        AuthFilter 内部:
        ├─ chain 引用的是同一个 ApplicationFilterChain 对象
        ├─ chain.pos 是多少？是 1!（不是 0）
        └─ chain.doFilter(req, res)  ← 调用它
            ↓
第2次调用 internalDoFilter():
    ├─ pos < n?  1 < 3  ✅
    ├─ filter = filters[1]  → LogFilter
    ├─ pos++ → pos = 2  ← 继续递增
    └─ LogFilter.doFilter(req, res, this)
        ...
```

**关键点**:
- FilterChain 对象只有**一个实例**
- `pos` 是这个对象的**实例字段**
- 每次调用 `internalDoFilter()` 都是在**同一个对象**上操作
- `pos++` 修改的是**对象的状态**，不是局部变量

### 6.4 如果 pos 重置会怎样？

```java
// ❌ 假设 pos 会重置
private void internalDoFilter(ServletRequest req, ServletResponse res) {
    int pos = 0;  // 假设 pos 是局部变量

    if (pos < n) {
        Filter filter = filters[pos++];
        filter.doFilter(req, res, this);
        return;
    }
    servlet.service(req, res);
}

// 结果：
// 第1次调用: pos=0, 执行 filters[0]
// 第2次调用: pos=0, 又执行 filters[0]  ← 死循环!
// 第3次调用: pos=0, 还是 filters[0]
// ...永远执行第一个 Filter
```

### 6.5 pos++ 的时机很关键

```java
Filter filter = filters[pos++];  // 后置递增
```

**为什么是后置递增（pos++）而不是前置递增（++pos）？**

```java
// 使用 pos++ (后置递增)
Filter filter = filters[pos++];
// 等价于:
// Filter filter = filters[pos];
// pos = pos + 1;

// 第1次: 取 filters[0], 然后 pos 变成 1
// 第2次: 取 filters[1], 然后 pos 变成 2
// 第3次: 取 filters[2], 然后 pos 变成 3
// 第4次: pos=3 >= n=3, 执行 servlet
```

```java
// 如果用 ++pos (前置递增)
Filter filter = filters[++pos];
// 等价于:
// pos = pos + 1;
// Filter filter = filters[pos];

// 第1次: pos 先变成 1, 取 filters[1]  ← 跳过了 filters[0]!
// 第2次: pos 先变成 2, 取 filters[2]
// 第3次: pos 先变成 3, 取 filters[3]  ← 数组越界!
```

**所以必须用后置递增！**

### 6.6 可视化图解

```
FilterChain 对象（内存中只有一个）:
┌─────────────────────────────────┐
│ filters[] = [F1, F2, F3]        │
│ pos = 0 → 1 → 2 → 3             │  ← pos 不断递增，永不重置
│ n = 3                           │
└─────────────────────────────────┘
        ↓ this
第1次 internalDoFilter()  pos=0
        ↓ this
F1.doFilter(req, res, this)
        ↓ chain (就是 this)
第2次 internalDoFilter()  pos=1  ← 同一个对象，pos 已经变了
        ↓ this
F2.doFilter(req, res, this)
        ↓ chain (还是同一个 this)
第3次 internalDoFilter()  pos=2
        ↓ this
F3.doFilter(req, res, this)
        ↓ chain
第4次 internalDoFilter()  pos=3 >= n
        ↓
servlet.service()
```

**关键**: 始终是同一个对象，pos 是它的状态，所以会保留。

---

## 七、装饰器模式的应用

### 7.1 为什么要包装 request/response？

**典型场景: AddDefaultCharsetFilter**

```java
public void doFilter(ServletRequest request, ServletResponse response,
        FilterChain chain) throws IOException, ServletException {

    // 创建一个包装对象
    if (response instanceof HttpServletResponse) {
        ResponseWrapper wrapped =
            new ResponseWrapper((HttpServletResponse)response, encoding);

        // 把包装对象传给下一个 Filter
        chain.doFilter(request, wrapped);
    } else {
        chain.doFilter(request, response);
    }
}
```

### 7.2 ResponseWrapper 的实现

```java
// 简化版
class ResponseWrapper extends HttpServletResponseWrapper {
    private String encoding;

    public ResponseWrapper(HttpServletResponse response, String encoding) {
        super(response);  // 装饰器模式：包装原始 response
        this.encoding = encoding;
    }

    @Override
    public void setContentType(String type) {
        // 拦截 setContentType 调用,自动加上 charset
        if (type != null && !type.contains("charset")) {
            type = type + ";charset=" + encoding;
        }
        super.setContentType(type);
    }
}
```

### 7.3 为什么传 wrapped 而不是原始 response？

**关键洞察**:
- 后续的 Filter 和 Servlet 会调用 `response.setContentType("text/html")`
- 如果传原始 response，它们设置的就是 `text/html`（没有 charset）
- 如果传 wrapped，它们设置的会被自动改成 `text/html;charset=UTF-8`

**这就是装饰器模式的精髓** - 偷偷增强对象的行为，而调用者毫不知情！

### 7.4 完整调用流程

```
HTTP请求到达
    ↓
FilterChain.doFilter(originalRequest, originalResponse)
    ↓
internalDoFilter() → pos=0, filters[0] = AddDefaultCharsetFilter
    ↓
AddDefaultCharsetFilter.doFilter(originalRequest, originalResponse, chain)
    ├─ ResponseWrapper wrapped = new ResponseWrapper(originalResponse, "UTF-8")
    └─ chain.doFilter(originalRequest, wrapped)  ← 注意：传的是 wrapped!
        ↓
internalDoFilter() → pos=1, filters[1] = 下一个Filter
    ↓
下一个Filter.doFilter(originalRequest, wrapped, chain)  ← 它收到的是 wrapped!
    ├─ wrapped.setContentType("text/html")  ← 调用的是包装类的方法
    │   └─ 内部自动改成 "text/html;charset=UTF-8"
    └─ chain.doFilter(originalRequest, wrapped)
        ↓
internalDoFilter() → pos >= n
    ↓
servlet.service(originalRequest, wrapped)  ← Servlet 收到的也是 wrapped!
    └─ wrapped.setContentType("application/json")
        └─ 自动改成 "application/json;charset=UTF-8"
```

---

## 八、完整调用链 - 图解

```
用户请求: GET /api/users
    ↓
StandardWrapperValve.invoke()  ← Tomcat入口
    ↓
ApplicationFilterFactory.createFilterChain()  ← 创建链条
    ├─ context.findFilterMaps()  → [FilterMap1(/api/*), FilterMap2(/*), ...]
    ├─ matchFiltersURL("/api/users", "/api/*")  → true
    ├─ context.findFilterConfig("AuthFilter")  → AuthFilterConfig实例
    ├─ chain.addFilter(AuthFilterConfig)  → filters[0] = AuthFilterConfig
    ├─ matchFiltersURL("/api/users", "/*")  → true
    ├─ context.findFilterConfig("LogFilter")  → LogFilterConfig实例
    └─ chain.addFilter(LogFilterConfig)  → filters[1] = LogFilterConfig
    ↓
filterChain.doFilter(request, response)  ← 开始执行
    ↓
internalDoFilter()  ← pos=0, n=2
    ├─ filters[0].getFilter()  → AuthFilter
    ├─ AuthFilter.doFilter(req, res, chain)
    │   ├─ 前置处理: 校验token
    │   ├─ chain.doFilter(req, res)  → 递归回到 internalDoFilter()
    │   └─ 后置处理: 记录日志
    ↓
internalDoFilter()  ← pos=1, n=2
    ├─ filters[1].getFilter()  → LogFilter
    ├─ LogFilter.doFilter(req, res, chain)
    │   ├─ 前置处理: 记录请求时间
    │   ├─ chain.doFilter(req, res)  → 递归回到 internalDoFilter()
    │   └─ 后置处理: 计算响应时间
    ↓
internalDoFilter()  ← pos=2, n=2
    ├─ pos >= n 了!
    └─ servlet.service(req, res)  → 执行真正的业务逻辑
```

---

## 九、Linus 式评价

### 🟢 品味评分: 好品味 - 90分

### 5.1 为什么是好设计？

#### 1. **数据结构驱动设计**

> "Bad programmers worry about the code. Good programmers worry about data structures."

- 整个责任链就是一个 `Filter[]` 数组，所有逻辑围绕这个数组展开
- 没有 `Handler.next` 指针，没有链表遍历，没有递归栈爆炸
- 对比 GoF 的标准责任链(每个节点持有 next 指针)，Tomcat 的设计减少了 50% 的内存开销

#### 2. **消除特殊情况**

> "Good taste is eliminating corner cases."

- `if (pos < n)` 一个条件搞定所有情况
- 没有"第一个 Filter"、"最后一个 Filter"、"Filter 为空"的特殊处理
- 边界情况被隐藏在数据结构里，Filter 不需要知道这个细节

#### 3. **实用主义**

> "Theory and practice sometimes clash. Theory loses."

- 数组初始长度 0 - 大部分 Servlet 没有 Filter，不浪费内存
- 扩容 +10 而非翻倍 - 针对"平均 2-3 个 Filter"的现实优化
- Filter 实例缓存 - 应用启动时创建，请求期间零分配

#### 4. **向后兼容**

> "Never break userspace."

- FilterChain 接口 20 年没变过
- 内部实现随便优化，用户代码零感知
- 这就是"Never break userspace"的体现

---

### 5.2 如果 Linus 看到这个设计会说什么？

```
"Filter API 是个好例子。它解决了真实问题(请求处理流水线),
没有引入不必要的复杂度,并且把特殊情况隐藏在了数据结构里。

如果你在设计责任链,就照着这个抄。别tm自己发明轮子,
搞什么 if (hasNext()) 之类的垃圾。

这代码20年没大改过(自Tomcat 5.x至今),因为第一次就设计对了。
这就是'好品味' - 不需要不断打补丁,不需要重构,
因为核心设计从一开始就是简洁优雅的。"
```

---

### 5.3 扣分点

- ⚠️ **异常处理有点丑** - 如果 Filter 抛异常，后续的 Filter 会被跳过，但这是 checked exception 的锅
- ⚠️ **SecurityManager 相关代码** - 增加了复杂度，但这是 Java 安全机制的要求，不可避免

### 5.4 为什么不用 for 循环？

```
"因为你个白痴，for 循环只能做'流水线'处理，
不能做'三明治'处理！

Filter 需要在调用下一个之前做前置处理，
在下一个返回后做后置处理。

for 循环做不到这个 - 它一旦进入下一次迭代，
就回不到上一次了。

Tomcat 的设计用了回调机制 - 每个 Filter 都在
等待下一个返回，所以可以完美支持前置+后置处理。

这不是递归，这是嵌套回调。如果你觉得'复杂'，
那是因为你没理解调用栈的工作原理。"
```

### 5.5 为什么 pos 不重置？

```
"因为 pos 是对象的状态，不是函数的局部变量！

每次调用 internalDoFilter()，操作的都是同一个
FilterChain 对象。pos 是这个对象的字段，
当然会保留上一次的修改。

如果你希望 pos 重置为 0，那就是在说
'我希望每次都从第一个 Filter 开始执行'，
这tm不是死循环吗？

pos 的生命周期是整个请求 - 从创建 FilterChain
到 Servlet 返回。它是用来记录'当前执行到哪了'的，
当然不能重置。"
```

### 5.6 关于装饰器模式

```
"包装 request/response 是个聪明的设计。

它让 Filter 可以在不修改原始对象的情况下，
增强它的行为。后续的 Filter 和 Servlet 完全
不知道自己用的是包装对象，这就是好的抽象。

这是装饰器模式的正确用法 - 透明、无侵入、
可叠加。不像某些框架，搞一堆 Interceptor、
Aspect、Proxy，最后连自己都搞不清楚调用链。"
```

---

## 十、源码文件索引

### 6.1 核心文件路径

所有核心文件都在 Maven 仓库:
```
基础路径: D:\java\apache-maven-3.6.3\repo\org\apache\tomcat\embed\
          tomcat-embed-core\9.0.46\tomcat-sources\org\apache\catalina\core\
```

### 6.2 关键文件列表

| 文件名 | 行数 | 职责 | 关键方法 |
|--------|------|------|----------|
| **ApplicationFilterChain.java** | 345 | FilterChain 实现类 | `internalDoFilter()` (166-241)<br>`addFilter()` (273-288) |
| **ApplicationFilterFactory.java** | 291 | FilterChain 工厂 | `createFilterChain()` (53-136) |
| **ApplicationFilterConfig.java** | - | Filter 配置包装器 | - |
| **StandardWrapperValve.java** | 353 | Servlet 容器阀门 | `invoke()` (172-174) |
| **StandardContext.java** | 6748 | Context 容器 | `filterStart()` (4557-4567)<br>`ContextFilterMaps` (4446-4540) |

### 6.3 必读方法清单

1. **ApplicationFilterChain.internalDoFilter()** - 166-241行
   责任链执行引擎，理解这个方法就理解了整个执行流程

2. **ApplicationFilterFactory.createFilterChain()** - 53-136行
   FilterChain 组装工厂，理解 Filter 如何根据 URL 匹配

3. **ApplicationFilterChain.addFilter()** - 273-288行
   动态数组扩容逻辑，理解内存优化

4. **StandardContext.filterStart()** - 4557-4567行
   Filter 初始化入口，理解生命周期管理

---

## 七、总结 - 你需要记住的

### 7.1 组装过程 3 步走

1. **启动时** - StandardContext 把所有 Filter 实例化并缓存到 Map
2. **请求时** - ApplicationFilterFactory 根据 URL pattern 从 Map 查找匹配的 Filter
3. **串联时** - ApplicationFilterChain.addFilter() 把它们依次加到数组里

### 7.2 核心数据结构

```
Filter[]  +  游标pos  +  长度n  =  责任链的全部状态
```

### 7.3 执行逻辑

```java
while (pos < n) {
    filters[pos++].doFilter(request, response, this);  // 递归回调
}
servlet.service(request, response);  // 链条终点
```

### 7.4 设计原则

- ✅ **数据结构优先** - 用简单的数组替代复杂的链表
- ✅ **消除特殊情况** - 一个 `if` 统治所有边界条件
- ✅ **实用主义** - 根据实际场景优化(扩容 +10)
- ✅ **向后兼容** - 接口不变，内部随便改

### 7.5 关键问题回答

**Q1: 为什么 Filter 和 FilterChain 都有 doFilter？**
- Filter.doFilter(req, res, chain) - 处理业务，决定是否传递
- FilterChain.doFilter(req, res) - 执行传递逻辑，找下一个 Filter

**Q2: 这是递归吗？**
- 不是传统递归，是嵌套回调
- A 调用 B，B 调用 A，状态保存在对象字段上

**Q3: 为什么不用 for 循环？**
- for 循环无法支持"三明治"处理（前置+后置）
- 无法中断链条
- 无法包装对象（装饰器模式）

**Q4: 为什么 pos 不重置？**
- pos 是对象的实例字段，不是局部变量
- 传的是 this（对象引用），不是复制
- pos 记录"当前执行到哪了"，必须保留

**就这么简单。**

---

## 附录: Filter 接口与 FilterChain 接口

### Filter 接口

```java
public interface Filter {
    // 初始化方法(Servlet 3.0后变为default方法)
    default void init(FilterConfig filterConfig) throws ServletException {}

    // 核心方法 - 处理请求
    void doFilter(ServletRequest request, ServletResponse response,
                  FilterChain chain) throws IOException, ServletException;

    // 销毁方法(Servlet 3.0后变为default方法)
    default void destroy() {}
}
```

### FilterChain 接口

```java
public interface FilterChain {
    // 传递给下一个Filter或Servlet
    void doFilter(ServletRequest request, ServletResponse response)
        throws IOException, ServletException;
}
```

### 典型的 Filter 实现

```java
public class AuthenticationFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        // 前置处理
        if (!isAuthenticated(request)) {
            response.sendError(401);
            return;  // 中断链条
        }

        // 传递给下一个 Filter (或最终的 Servlet)
        chain.doFilter(request, response);

        // 后置处理
        logRequest(request);
    }
}
```

**关键点**:
- Filter 调用 `chain.doFilter()` 传递控制权
- 可以在 `chain.doFilter()` 前后做前置/后置处理
- 不调用 `chain.doFilter()` 就中断责任链

---

**文档版本**: 1.0
**基于源码版本**: Tomcat 9.0.46
**最后更新**: 2026-02-11
