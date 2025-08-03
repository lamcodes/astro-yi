---
id: "unique-20250616-140726"
title: "java新版本特性与springboot新版本特性"
description: ""
date: 2025-06-16 18:10:05
date_created: 2025-06-16
date_updated: 2025-06-16 18:10:05
tags: ["java"]
katex: false
pin: false
draft: false
---

[JEP 0: JEP Index](https://openjdk.org/jeps/0)

jep：**JDK Enhancement Proposal** jdk 增强提案。java 新功能引入的提案

参考地址

[Java 17 新特性概览（重要） | JavaGuide](https://javaguide.cn/java/new-features/java17.html)

[Java 11 新特性介绍 | 未读代码](https://www.wdbyte.com/2020/03/jdk/jdk11-feature/)

[Download GraalVM](https://www.graalvm.org/downloads-thanks/)

[Java Download | Java 8, Java 11, Java 17, Java 21, Java 24 - OpenJDK Builds for Linux, Windows & macOS](https://bell-sw.com/pages/downloads/#jdk-21-lts)

# Java 8 到 Java 24 主要更新特点

Java 平台自 Java 11 以来，采用了每六个月发布一次的快速迭代周期。**下面每个版本中的新特性非全部特性，为部分特性。**

### Oracle Java SE 支持路线图

Oracle 将 Java 版本分为两类，这决定了它们的命运和支持周期：

- **长期支持版本 (LTS - Long-Term Support)** ：
- 这是为企业级应用和需要长期稳定性的项目设计的“旗舰版”。
- 它们会获得多年的官方支持和更新（包括安全补丁和错误修复）。
- 路线图明确指出 **Java 8, 11, 17, 21** 是 LTS 版本。
- **特性发布版本 (Feature Release)** ：
- 这些是在两个 LTS 版本之间发布的、以数字命名的版本（如 Java 18, 19, 20, 22, 23 等）。
- 它们的生命周期非常短，通常在下一个特性版本发布后就不再获得更新。
- 其主要目的是为了让开发者能更快地用上 Java 的新功能，实现“小步快跑”式的创新。

- **每六个月一次特性发布**：每年 3 月和 9 月，Oracle 都会发布一个新的 Java 版本。
- **每两年一个 LTS 版本**：自 Java 17 开始，Oracle 将 LTS 版本的发布周期从三年缩短为**两年**。Java 17 (2021 年 9 月) -> Java 21 (2023 年 9 月)。Java 25 将是下一个 LTS 版本，预计于 2025 年 9 月发布。
- [Oracle Java SE Support Roadmap | Oracle 中国](https://www.oracle.com/cn/java/technologies/java-se-support-roadmap.html)
- [JDK Releases](https://www.java.com/releases/)

- **JEP (JDK Enhancement Proposal - JDK 增强提案)**：向 JDK 引入重要新特性或改进的正式提案。每个 JEP 都有一个编号和一个详细的文档，描述了该特性的动机、设计、实现细节等。JEP 是 Java 平台演进的核心机制。你可以在 OpenJDK 网站上找到所有 JEP 的列表和详细信息。
- 一个新特性从概念到最终成为 Java 标准的一部分，通常会经历以下几个阶段：孵化特性 (Incubator Modules/Features) ，预览特性 (Preview Features)，正式发布/最终特性 (Final/Standard Features)
- [JEP 0: JEP Index](https://openjdk.org/jeps/0)

### Java 9：模块化与增强工具的开端

- **JEP 102: 进程 API 更新** - 改进了用于控制和管理操作系统进程的 API。
- **JEP 143: 改进竞争锁** - 优化了 Java 对象监视器的性能，以减少高竞争情况下的锁争用。
- **JEP 158: 统一 JVM 日志记录** - 为 JVM 的所有组件引入了一个统一的日志记录系统。
- **JEP 165: 编译器控制** - 提供了对 JVM 编译器的细粒度控制。
- **JEP 193: 变量句柄 (Variable Handles)** - 引入 `java.lang.invoke.VarHandle` API，作为 `sun.misc.Unsafe` 的安全替代品。
- **JEP 200: 模块化 JDK** - 将 JDK 自身进行模块化划分，是模块系统项目（Project Jigsaw）的一部分。
- **JEP 201: 模块化源码** - 将 JDK 的源代码按照新的模块化结构进行重组。
- **JEP 220: 模块化运行时镜像** - 允许使用 `jlink` 工具创建自定义的、最小化的运行时镜像。
- **JEP 222: jshell: Java 命令行工具 (Read-Eval-Print Loop)** - 提供了一个交互式的 REPL 工具，用于快速执行 Java 代码片段。
- **JEP 226: UTF-8 属性文件** - 属性文件 (`.properties`) 现在默认使用 UTF-8 编码。
- **JEP 247: 为旧平台版本编译** - `javac` 增加了 `--release` 标志，可以更可靠地为旧版本 Java 平台编译代码。
- **JEP 248: G1 成为默认垃圾收集器** - 将 G1 (Garbage-First) 设置为默认的垃圾收集器。
- **JEP 261: 模块系统** - 引入了 Java 平台模块系统（Project Jigsaw）。
- **JEP 266: 更多并发更新** - 包含对 `CompletableFuture`、`Flow` API 等并发工具的改进。
- **JEP 269: 集合的便捷工厂方法** - 为 List、Set 和 Map 接口添加了静态工厂方法 `of()`，用于创建不可变集合。
- **JEP 271: 统一 GC 日志** - 将所有 GC 的日志格式统一。
- **JEP 275: 模块化 Java 应用打包** - `jlink` 工具可用于创建包含应用模块和依赖的运行时镜像和原生安装包。
- **JEP 285: 自旋等待提示** - 引入 `onSpinWait()` 方法，允许 JVM 优化自旋等待循环。
- **JEP 287: SHA-3 哈希算法** - 增加了对 SHA-3 系列哈希算法的支持。
- **JEP 291: 废弃 CMS 垃圾收集器** - 将 CMS 垃圾收集器标记为废弃。

#### Project Jigsaw (模块系统)

**主要特性：** Project Jigsaw 引入了模块化的 JDK、模块化的 Java 源代码、模块化的运行时镜像以及对 Java 内部 API 的封装，共同构成了 Java 平台模块系统 。模块的定义核心在于 `module-info.java` 文件（编译为 `module-info.class`），它明确声明了模块的名称、其依赖项（`requires`）、导出的包（`exports`）以及为反射打开的包（`opens`）。这种显式声明与传统类路径模型形成了鲜明对比，在传统模型中，所有公共类默认都是可访问的 。

**优势：**

- **强封装性：** 模块通过要求显式导出包来强制执行强封装，防止内部类被无意暴露。这提高了安全性并减少了组件间的耦合。
- **清晰的依赖管理：** 模块显式声明对其他模块的依赖，使 JVM 能够快速定位和加载它们，从而改善编译和运行时性能，并有效避免“Jar 地狱”问题 。模块系统还禁止不同模块导出相同包的“拆分包”情况 。
- **减小应用体积（精简 JRE）：** JDK 本身被模块化为 94 个模块 。`jlink` 工具允许开发人员创建仅包含必要模块的自定义 JRE，显著减小了应用体积（例如，JRE 11 的大小仅为 JRE 8 的 53%）。这对于微服务和嵌入式系统尤为重要 。
- **提高性能：** 模块化系统为 JVM 和编译器提供了更深入的洞察，了解哪些模块被使用，从而带来更快的启动时间和更低的内存使用 。
- **提高部署可靠性：** 显式声明的依赖项减少了因缺少依赖项而导致的运行时问题 。

**挑战与缺点：** 模块系统增加了设计和维护的复杂性，特别是对于现有单体应用的迁移。由于 `javax` 依赖项和第三方库兼容性问题，迁移过程可能变得复杂 。为了访问内部 API，可能需要使用 `--add-exports` 和 `--add-opens` 标志 。此外，“拆分包”规则（不同模块不能导出相同包）也可能构成迁移障碍 。

**代码示例 (`module-info.java`)：**

**之前 (单体应用 - 无 `module-info.java`)：** 应用依赖于类路径。

```java
// 无 module-info.java 文件
// 应用程序作为一个整体运行，所有公共类都可访问。
// 依赖项通过类路径管理。
```

**之后 (模块化)：**

```java
// module-info.java，用于名为 'com.example.myModule' 的模块
module com.example.myModule {
    // 导出 'services' 包，使其对其他模块公开
    exports com.example.myModule.services;
    // 声明对 'java.sql' 模块的依赖
    requires java.sql;
    // 可选：为反射打开一个包
    opens com.example.myModule.internal.data to com.example.anotherModule;
    // 声明此模块提供的服务
    provides com.example.myModule.spi.MyService with com.example.myModule.impl.MyServiceImpl;
    // 声明此模块使用的服务
    uses com.example.myModule.spi.AnotherService;
}
```

**差异：** `module-info.java` 明确声明了模块的导出和依赖，提供了强大的封装和清晰的依赖管理，这与之前基于类路径的隐式方法不同。

- **Spring Boot 的工作方式**：传统的 Spring Boot 应用打包成一个**Fat JAR (可执行 JAR)** 。在这个 JAR 包里，所有依赖的 JAR 都被解压并平铺在 `BOOT-INF/lib` 和 `BOOT-INF/classes` 下。整个应用在运行时依赖的是**类路径（Classpath）** ，JVM 把所有类都看作在一个大集合里。
- **JPMS 的原则**：模块系统运行在**模块路径（Module Path）** 上。JVM 需要清楚地知道每个模块的边界和它们之间的依赖关系图。Fat JAR 的“大杂烩”结构破坏了这种边界。
- **冲突结果**：你不能直接把一个标准的 Spring Boot Fat JAR 放在模块路径上运行。你需要改变打包策略。

- **对于大多数标准的 Spring Boot Web 应用**：
  - 坚持使用**非模块化**的 Fat JAR 和类路径模式。这是 Spring Boot 生态系统最成熟、最简单的方式。为了模块化而维护复杂的 `module-info.java` 文件带来的收益可能并不明显。
- **在以下情况下，请考虑使用模块系统**：

1. **你对应用的运行时体积有极致要求**，希望通过 `jlink` 创建最小的 Docker 镜像来优化云原生部署。
2. 你正在构建一个**大型、长生命周期的单体应用**，希望利用 JPMS 强制实施清晰的架构边界和高内聚、低耦合的设计。

#### JShell (REPL - 读取-求值-打印循环)

JShell 是 Java 9 引入的一个交互式工具，它提供了一个“读取-求值-打印循环”（REPL）环境，用于执行 Java 代码片段、语句和表达式 。

**优势：** JShell 提供了即时反馈，简化了 API 探索，并允许快速测试 Java 构造（如类、接口、枚举、对象和语句），而无需完整的编译过程或集成开发环境（IDE）。这对于学习 Java 和进行快速原型开发非常有用。

**代码示例 (JShell 会话)：**

```java
// 在 JShell 中：
jshell> System.out.println("Hello, JShell!");
Hello, JShell!
jshell> int x = 10;
x ==> 10
```

**差异：** 传统的 Java 开发需要创建 `.java` 文件，然后通过 `javac` 编译，最后通过 `java` 命令执行。JShell 则允许直接、交互式地执行代码片段，并立即显示结果。

#### 接口中的私有方法

Java 8 允许在接口中定义 `default` 和 `static` 方法。然而，如果多个 `default` 方法需要共享通用逻辑，这可能导致代码重复 。Java 9 引入了接口中的 `private` 和 `private static` 方法，以封装这些通用的辅助逻辑，从而促进代码重用并提高可读性，同时避免将内部实现细节暴露给 API 客户端。

**优势：** 避免代码重复，确保代码可重用性，提高代码可读性，并防止将内部工具方法暴露给外部客户端 。

**代码示例：**

**之前 (Java 8 - 可能存在重复)：**

```
interface MyInterfaceJava8 {
    default void processData(String data) {
        // 通用验证逻辑
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data cannot be empty");
        }
        System.out.println("Processing: " + data);
    }

    default void analyzeData(String data) {
        // 通用验证逻辑（重复）
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data cannot be empty");
        }
        System.out.println("Analyzing: " + data);
    }
}
```

**之后 (Java 9 - 使用私有方法)：**

```
interface MyInterfaceJava9 {
    default void processData(String data) {
        validate(data); // 调用私有辅助方法
        System.out.println("Processing: " + data);
    }

    default void analyzeData(String data) {
        validate(data); // 调用私有辅助方法
        System.out.println("Analyzing: " + data);
    }

    // 私有方法，仅在接口内部可访问
    private void validate(String data) {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data cannot be empty");
        }
    }
}
```

**差异：** `validate` 方法现在是接口中的 `private` 方法，允许 `processData` 和 `analyzeData` 共享逻辑，而无需将 `validate` 暴露给实现类，从而减少了冗余并改进了接口设计。

#### 集合工厂方法

在 Java 9 中为集合的创建增加了静态工厂创建方式，也就是 `of` 方法，通过静态工厂 `of` 方法创建的集合是**只读集合**，里面的对象**不可改变**。并在**不能存在 `null` 值**，对于 `set` 和 `map` 集合，也**不能存在 `key` 值重复**。这样不仅**线程安全**，而且**消耗的内存也更小**。

```java
// 工厂方法创建集合
List<String> stringList = List.of("a", "b", "c", "d");
Set<String> stringSet = Set.of("a", "b", "c", "d");
Map<String, Integer> stringIntegerMap = Map.of("key1", 1, "key2", 2, "key3", 3);
Map<String, Integer> stringIntegerMap2 = Map.ofEntries(Map.entry("key1", 1), Map.entry("key2", 2));
```

### Java 10：局部变量类型推断 (`var`)

Java 10 引入了 `var` 关键字，实现了局部变量类型推断（LVTI），允许编译器根据变量的初始化表达式推断其类型 。

**目的：** 简化局部变量声明，减少样板代码。

**优势：**

- **减少样板代码：** 特别适用于复杂的泛型类型，使代码更短、更清晰 [24, 26]。
- **提高可读性：** 当推断类型从上下文显而易见时，可以使代码更简洁、更易读 [24, 25]。
- **维护性：** 简化重构，因为类型更改只需修改赋值的右侧 [24]。

**局限性：**

- **仅限局部变量：** 不能用于类字段、方法参数或返回类型 [24, 25, 26]。
- **不能用 `null` 初始化：** 编译器无法从 `null` 推断类型 [25]。
- **推断歧义：** 如果推断类型不明显，可能会降低可读性 [24]。

**代码示例：**

**之前 (Java 9 及更早版本)：**

```java
Map<String, List<String>> userPreferences = new HashMap<String, List<String>>();
String message = "Hello, World!";
for (String item : items) { /*... */ }
```

**之后 (Java 10+)：**

```java
var userPreferences = new HashMap<String, List<String>>(); // 类型推断为 Map<String, List<String>>
var message = "Hello, World!"; // 类型推断为 String
for (var item : items) { // 类型推断基于 'items' 集合的元素类型
    System.out.println(item);
}
```

**差异：** `var` 替代了显式类型声明，减少了冗余，提高了简洁性，尤其是在处理复杂泛型类型时。

`var` 关键字的引入是 Java 语法的一个重大改进，它解决了 Java 长期以来的冗长问题，使其与现代语言趋势保持一致，即优先考虑简洁性。它是一个编译时特性，这意味着它不会影响运行时性能，但它要求开发人员在保持代码清晰度方面做出判断。`var` 是一种类型推断形式，编译器在编译时仍然会确定精确的静态类型 。Java 仍然是一种静态类型语言 。权衡在于，如果初始化表达式复杂或变量名不具描述性，可能会导致歧义 。

### Java 11 (LTS)：

- **JEP 181: 基于嵌套的访问控制** - 优化了内部类（嵌套类）之间的访问控制规则，使其逻辑上更一致。
- **JEP 309: 动态类文件常量** - 引入了一种新的常量池条目 `CONSTANT_Dynamic`，以简化动态语言和复杂常量的处理。
- **JEP 315: 改进 Aarch64 内在函数** - 改进了 AArch64（ARM64）架构下的多个核心库方法的内在函数性能。
- **JEP 318: Epsilon：一个无操作的垃圾收集器** - 提供一个不做任何内存回收的“无操作”垃圾收集器，主要用于性能分析和测试。
- **JEP 320: 移除 Java EE 和 CORBA 模块** - 从 Java SE 标准版中彻底移除了在 JDK 9 中已废弃的 Java EE 和 CORBA 模块。
- **JEP 321: HTTP 客户端（标准）** - 内置了一个全新的、支持 HTTP/1.1 和 HTTP/2 的客户端 API，它在之前版本中是孵化特性，在 JDK 11 中正式可用。
- **JEP 323: Lambda 参数的局部变量语法** - 允许在 Lambda 表达式的参数列表中使用 `var` 关键字。
- **JEP 324: Curve25519 和 Curve448 密钥协商** - 添加了对 `Curve25519` 和 `Curve448` 两种现代椭圆曲线加密算法的支持。
- **JEP 327: Unicode 10** - 将 JDK 中的 Unicode 标准支持更新到 10.0 版本。
- **JEP 328: 飞行记录器** - 将原本属于商业版 JDK 的飞行记录器功能开源，提供了一个低开销的事件信息收集框架。
- **JEP 329: ChaCha20 和 Poly1305 加密算法** - 实现了 `ChaCha20` 流加密算法和 `Poly1305` 认证算法。
- **JEP 330: 启动单文件源代码程序** - 允许通过 `java` 命令直接运行单个 Java 源代码文件，无需预先手动编译。
- **JEP 331: 低开销堆分析** - 提供了一种低开销、可用于生产环境的 Java 对象堆内存分配分析方法。
- **JEP 332: 传输层安全性（TLS）1.3** - 提供了对最新版传输层安全协议 TLS 1.3 的支持，增强了安全性和性能。
- **JEP 335: 废弃 Nashorn JavaScript 引擎** - 将 Nashorn JavaScript 引擎标记为废弃，并计划在未来的版本中移除。
- **JEP 336: 废弃 Pack200 工具和 API** - 将用于压缩 JAR 文件的 Pack200 工具及相关的 API 标记为废弃。

#### 标准化 HTTP 客户端 API (`java.net.http`)

**目的：** 提供一个现代、灵活且高效的 API，用于处理 HTTP 请求和响应，取代老旧的 `HttpURLConnection` [3, 27, 28, 29]。

**主要特性：**

- 支持 HTTP/1.1 和 HTTP/2（多路复用连接、服务器推送）[3, 17, 27, 28, 29]。
- 支持同步（阻塞）和异步模式（使用 `CompletableFuture`）[3, 17, 28, 29]。
- 能够将请求/响应体作为响应式流处理 [17, 29]。
- 内置连接管理和连接池 [3, 28]。

**优势：** 提高了性能（减少延迟、高效连接重用），更易于使用，更好地支持现代 Web 服务和响应式编程范式 [3, 28, 29]。

**缺点：** 缺乏对 OAuth 的直接支持 [28]。

**代码示例：**

**之前 (Java 8 - `HttpURLConnection`)：**

```java
// 使用 HttpURLConnection 的基本 GET 请求
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
public class OldHttpClientExample {
public static void main(String args) throws Exception {
URL url = new URL("https://jsonplaceholder.typicode.com/todos/1");
HttpURLConnection con = (HttpURLConnection) url.openConnection();
con.setRequestMethod("GET");
    int responseCode = con.getResponseCode();
    System.out.println(&quot;Response Code: &quot; + responseCode);

    if (responseCode == HttpURLConnection.HTTP_OK) { // 成功
        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer content = new StringBuffer();
        while ((inputLine = in.readLine())!= null) {
            content.append(inputLine);
        }
        in.close();
        System.out.println(&quot;Response Body:\n&quot; + content.toString());
    } else {
        System.out.println(&quot;GET request failed&quot;);
    }
}
}
```

**之后 (Java 11+ - `HttpClient`)：**

```java
// 使用 Java 11+ HttpClient 的 GET 请求（同步）
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
public class NewHttpClientExample {
public static void main(String args) throws Exception {
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
.uri(URI.create("https://jsonplaceholder.typicode.com/todos/1"))
.GET() // 或.POST(HttpRequest.BodyPublishers.ofString("..."))
.build();
    HttpResponse&lt;String&gt; response = client.send(request, BodyHandlers.ofString());

    System.out.println(&quot;Response Code: &quot; + response.statusCode());
    System.out.println(&quot;Response Body:\n&quot; + response.body());

    // 异步示例
    /*
    client.sendAsync(request, BodyHandlers.ofString())
         .thenApply(HttpResponse::body)
         .thenAccept(System.out::println)
         .join(); // 等待完成
    */
}
}
```

**差异：** 新的 `HttpClient` API 更流畅，原生支持现代 HTTP/2 和异步操作，与 `HttpURLConnection` 相比，显著减少了样板代码，后者是阻塞的且难以维护 。

HTTP 客户端 API 的标准化对于 Java 在微服务和 API 驱动世界中的重要性至关重要。它直接解决了传统 API 的缺点，并减少了对基本网络操作的第三方库的依赖，从而提高了代码一致性并减少了依赖开销。`HttpURLConnection` 在“连接池不足”方面效率较低，“缺乏对异步执行的原生支持”，并且“仅支持 HTTP/1.1”[28, 29]。在高度并发的微服务和 Web 应用世界中，这些都是严重的限制。新的 `HttpClient` 直接解决了这些问题，使 Java 在构建高性能网络应用方面具有竞争力 [28, 29]。这清楚地表明 Java 正在不断发展，以满足现代分布式计算和云原生架构的需求，在这些架构中，高效且可扩展的网络通信至关重要。它减少了对外部库进行基本 HTTP 操作的需求，从而简化了依赖管理。

#### 新的 String 和文件 I/O 方法

Java 11 引入了新的 `String` 方法和文件 I/O 方法，以简化常见的编程任务。

- **`String` 方法：** `isBlank()`、`lines()`、`strip()`、`stripLeading()`、`stripTrailing()` 。
- **文件 I/O 方法：** `Files.readString()`、`Files.writeString()` 。
- **优势：** 提高可读性，减少冗余，并简化常见的字符串操作和文件操作。

**代码示例 (`String.strip()` 与 `String.trim()`)：**

**之前 (Java 8 - `trim()`)：**

```java
String text = "  Hello World  \t\n";
System.out.println("'" + text.trim() + "'"); // 输出: 'Hello World' (仅移除 ASCII 空白字符)
```

**之后 (Java 11+ - `strip()`)：**

```java
String text = "  Hello World  \t\n\u2005"; // \u2005 是 Unicode "四分之一个空格"
System.out.println("'" + text.strip() + "'"); // 输出: 'Hello World' (移除 Unicode 空白字符)
System.out.println("'" + text.stripLeading() + "'"); // 输出: 'Hello World  \t\n\u2005'
System.out.println("'" + text.stripTrailing() + "'"); // 输出: '  Hello World'
```

**差异：** `strip()` 方法支持 Unicode，可以处理比旧版 `trim()` 更广泛的空白字符，后者只考虑 ASCII 空白字符。`stripLeading()` 和 `stripTrailing()` 提供了更细粒度的控制。

`strip()` 是 Unicode 感知的 ，解决了 `trim()` 在国际化应用中的局限性。`readString()` 和 `writeString()` 简化了以前需要更多样板代码的常见文件 I/O 操作

#### Lambda 参数的局部变量语法

从 Java 10 开始，便引入了局部变量类型推断这一关键特性。类型推断允许使用关键字 var 作为局部变量的类型而不是实际类型，编译器根据分配给变量的值推断出类型。

Java 10 中对 var 关键字存在几个限制

- 只能用于局部变量上
- 声明时必须初始化
- 不能用作方法参数
- 不能在 Lambda 表达式中使用

Java11 开始允许开发者在 Lambda 表达式中使用 var 进行参数声明。

```
// 下面两者是等价的
Consumer<String> consumer = (var i) -> System.out.println(i);
Consumer<String> consumer = (String i) -> System.out.println(i);
```

### Java 12-16：语言和 API 的增量改进

Java 12 到 16 版本在语言和 API 方面进行了持续的增量改进，为 Java 17 的长期支持版本奠定了基础。

#### Switch 表达式 (java14 中确定)

**目的：**让 `switch` 成为表达式，解决传统 switch 的冗长和易错性，修复作用域问题

**优势：**

简洁清晰：引入了 `case L ->` 箭头语法，代码意图一目了然。不再需要写大量的 `break`，代码更干净。

作用域更合理：在使用 `case L ->` 语法时，箭头右侧的代码块拥有独立的作用域。

具备返回值能力：直接产生一个结果并赋值给变量

安全性提高：箭头语法 `->` 彻底消除了意外的“贯穿”行为，因为箭头右侧的代码执行完后 `switch` 会自动结束，从根本上杜绝了一类常见 bug

使用 yield 从代码块返回值：

- 当 `->` 右侧的逻辑无法用单个表达式完成时，使用 `{}` 创建代码块。
- 使用 `yield` 关键字从代码块中“产出”一个值作为该分支的结果。

**代码示例：**

```java
// 定义一个枚举类
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
//老版本逻辑
Day day = Day.MONDAY;
int numLetters;

switch (day) {
    case MONDAY:
    case FRIDAY:
    case SUNDAY:
        numLetters = 6;
        break;
    case TUESDAY:
        numLetters = 7;
        break;
    // 对于 switch 语句，default 不是必需的
    // 如果 day 是null，这里会抛出 NullPointerException
}

//新版本 switch 表达式的穷尽性检查 当 switch 表达式处理 enum 类型时，如果你覆盖了所有枚举常量，那么你不需要写 default 分支。
//switch表达式中枚举类中没有覆盖所有情况。会直接报错。当 switch 表达式处理 String、int 等类型时必须提供 default 分支

Day day = Day.TUESDAY;

int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY                -> 7;
    case THURSDAY, SATURDAY     -> 8;
    case WEDNESDAY              -> 9;
    // 注意：这里没有 default 分支！
    // 因为编译器知道 Day 枚举的所有可能值都已被覆盖。
};
//switch作为语句情况下的更新变化
// 目标：在不同 case 中定义临时变量
switch (day) {
    case MONDAY:
        String mood = "Ugh, Mondays..."; // mood 的作用域会持续到 switch 结束
        System.out.println(mood);
        break;
    case TUESDAY:
        // String mood = "Slightly better."; // 编译错误！变量 mood 已在作用域中定义
        String differentMood = "Slightly better.";
        System.out.println(differentMood);
        break;
}
// 新代码 (独立作用域) 每个 -> 右侧的代码块都有自己的作用域，变量互不影响。不需要写break，避免漏写break，导致代码执行流程“贯穿”到下一个 case
switch (day) {
    case MONDAY -> {
        String mood = "Ugh, Mondays..."; // mood 只在这个代码块内有效
        System.out.println(mood);
    }
    case TUESDAY -> {
        String mood = "Slightly better."; // 这是一个新的、独立的作用域
        System.out.println(mood);
    }
    default -> System.out.println("Another day.");
}
//yield 关键字
String result = switch (day) {
            case "M", "W", "F" -> "MWF";
            case "T", "TH", "S" -> "TTS";
            default -> {
                if(day.isEmpty())
                    yield "Please insert a valid day.";
                else
                    yield "Looks like a Sunday.";
            }

        };
System.out.println(result);
```

#### 文本块 (Java 15 中最终确定)

**目的：** 提供一种多行字符串字面量，减少对显式换行符和转义序列的需求。

**优势：** 显著提高了多行字符串（例如 JSON、SQL、HTML）的可读性，减少了视觉混乱，并自动处理了附带的空白字符。

**代码示例：**

**之前 (传统字符串字面量)：**

```java
String json = "{\n" +
              "  \"name\": \"John Doe\",\n" +
              "  \"age\": 30\n" +
              "}";
System.out.println(json);
```

**之后 (文本块)：**

```java
String json = """
    {
      "name": "John Doe",
      "age": 30
    }
    """;
System.out.println(json);
```

**差异：** 文本块允许直接嵌入多行文本，消除了连接和显式的 `\n` 字符，使代码更清晰、更易读。

#### `instanceof` 的模式匹配 (Java 14 中预览，Java 16 中最终确定)

**目的：** 通过将类型检查与绑定变量结合起来，简化条件逻辑，从而消除显式类型转换的需要。

**优势：** 移除了冗余的类型转换，使条件语句更具可读性，减少了样板代码。

**代码示例：**

**之前 (传统 `instanceof`)：**

```java
public void processObject(Object obj) {
    if (obj instanceof String) {
        String s = (String) obj; // 显式类型转换
        System.out.println("Processing String: " + s.length());
    } else if (obj instanceof Integer) {
        Integer i = (Integer) obj; // 显式类型转换
        System.out.println("Processing Integer: " + (i * 2));
    }
}
```

**之后 (`instanceof` 的模式匹配)：**

```java
public void processObject(Object obj) {
    if (obj instanceof String s) { // 模式变量 's'
        System.out.println("Processing String: " + s.length());
    } else if (obj instanceof Integer i) { // 模式变量 'i'
        System.out.println("Processing Integer: " + (i * 2));
    }
}
```

**差异：** 模式匹配语法 (`obj instanceof String s`) 会在类型检查通过时自动将对象转换为指定类型 (`String`) 并将其赋值给新的模式变量 (`s`)，从而消除了单独显式类型转换的需要。

传统的 `instanceof` 检查后跟显式类型转换是一种重复且冗长的模式。此功能通过确保仅在类型检查为真且变量在作用域内时才进行转换来简化此操作，从而减少了 `ClassCastException` 的可能性。此功能是 `switch` 表达式中更高级模式匹配的关键推动因素

#### Records (Java 14 中预览，Java 16 中最终确定)

**目的：** 提供一种简洁的方式来声明不可变的数据持有类，减少样板代码 。类似于使用 `class` 定义类，同时使用了 lombok 插件，并打上了`@Getter,@ToString,@EqualsAndHashCode`注解。

**主要特性：**

- 隐式 `final` 字段，促进不可变性 。
- 自动生成规范构造函数、访问器方法（getter）、`equals()`、`hashCode()` 和 `toString()` 。
- 可以实现接口，但不能扩展类 。

**优势：** 大幅减少样板代码，提高代码可读性和简洁性，由于不可变性增强了线程安全性，非常适合作为数据传输对象（DTO）和值对象。

**缺点：** 不可变性意味着创建后值不能更改。不能扩展其他类。

**代码示例 (POJO 与 Record)：**

**之前 (传统 POJO - 冗长)：**

```java
// Person.java (POJO) 或者使用lombok注解
public class Person {
    private final String name;
    private final int age;
public Person(String name, int age) {
    this.name = name;
    this.age = age;
}

public String getName() {
    return name;
}

public int getAge() {
    return age;
}

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass()!= o.getClass()){
        return false;
    }
	Person person = (Person) o;
	return age == person.age && name.equals(person.name);
}
@Override
public int hashCode() {
    return Objects.hash(name, age);
}
}
```

**之后 (Record - 简洁)：**

```java
// Person.java (Record)
public record Person(String name, int age) {
    // 可选：用于验证的自定义构造函数
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
    }
    // 可选：自定义方法
    public String greet() {
        return "Hello, " + name;
    }
}
```

**差异：** Records 提供了一种声明式的方式来定义数据类，自动生成标准方法，极大地减少了样板代码并促进了不可变性，这在 POJO 中通常需要手动完成。

### Java 17 (LTS)：

- **JEP 306:** 恢复始终严格的浮点语义 (Restore Always-Strict Floating-Point Semantics)
- **JEP 356:** 增强型伪随机数生成器 (Enhanced Pseudo-Random Number Generators)
- **JEP 382:** 新的 macOS 渲染管线 (New macOS Rendering Pipeline)
- **JEP 391:** macOS/AArch64 移植 (macOS/AArch64 Port)
- **JEP 403:** 强封装 JDK 内部构件 (Strongly Encapsulate JDK Internals)
- **JEP 409:** 密封类 (Sealed Classes)
- **JEP 415:** 特定于上下文的反序列化过滤器 (Context-Specific Deserialization Filters)

#### 密封类 (最终确定)

**目的：** Java 15 中作为预览功能引入，Java 17 中最终确定 。它们允许类或接口使用 `permits` 关键字明确定义哪些其他类可以扩展或实现它。这提供了受控的继承，介于开放继承和 `final` 类之间。

**主要特性：** 使用 `sealed`、`permits`、`non-sealed` 和 `final` 修饰符。允许的子类必须明确声明为 `final`、`sealed` 或 `non-sealed`。

**优势：**

- **受控继承：** 阻止不必要的子类化，增强封装性和设计控制 。
- **提高安全性：** 将继承限制在受信任的子类，降低安全风险。
- **增强可维护性和可读性：** 清晰定义类层次结构，使代码更易于理解和演进。
- **更好的穷尽性检查：** 与 `switch` 表达式的模式匹配协同工作，使编译器能够确保处理所有可能的子类型。

**缺点：** 增加了设计复杂性；新的子类需要修改密封类本身。

**代码示例 (无限制继承与密封继承)：**

**之前 (无限制继承)：**

```java
// Shape.java (传统)
public abstract class Shape {
    abstract double area();
}
// 任何类都可以扩展 Shape
public class Circle extends Shape { /*... / }
public class Rectangle extends Shape { /... / }
public class Triangle extends Shape { /... / }
public class Pentagon extends Shape { /... */ } // 可能出现意外扩展
```

**之后 (密封继承)：**

```java
// Shape.java (密封)
public sealed abstract class Shape permits Circle, Rectangle, Triangle {
    abstract double area();
}
// 允许的子类：
public final class Circle extends Shape { /*... / } // 必须是 final, sealed 或 non-sealed
public non-sealed class Rectangle extends Shape { /... / } // 可以进一步扩展
public sealed class Triangle extends Shape permits EquilateralTriangle { /... */ } // 自身也可以是密封的
// public class Pentagon extends Shape { /*... */ } // 编译错误：Pentagon 不是允许的子类
```

**差异：** `sealed` 关键字与 `permits` 子句明确列出了允许的子类，在编译时强制执行封闭的层次结构，这在传统继承中如果不将类声明为 `final` 是无法实现的。

#### `instanceof` 的模式匹配 (最终确定)

`instanceof` 的模式匹配在 Java 16/17 中最终确定。此功能通过将类型检查与绑定变量结合，简化了 `instanceof` 检查，消除了显式类型转换的需要。这减少了样板代码并提高了代码可读性，尤其是在 `if-else if` 链中。

### Java 18-20：持续创新 (预览和孵化器)

Java 18 到 20 版本主要作为孵化器和预览版，为许多在 Java 21 中最终确定的功能奠定了基础，例如虚拟线程、结构化并发和作用域值 。

这种模式（JEPs 用于预览/孵化器）允许开发人员试验新功能并提供反馈，使 OpenJDK 团队能够在这些功能成为标准之前对其进行完善。这降低了最终版本中出现重大破坏性更改或设计缺陷的风险。这种迭代方法使 Java 的演进更具可预测性，对生态系统的破坏性更小。这也意味着开发人员需要了解“预览”状态，并使用 `--enable-preview` 标志来测试它们。

### Java 21 (LTS)：并发、数据处理及其他

- **JEP 431: 有序集合 (Sequenced Collections)** - 为集合框架引入新的接口，用于表示具有确定遍历顺序的集合。
- **JEP 439: 分代 ZGC (Generational ZGC)** - 通过为 ZGC 垃圾收集器引入分代机制，来降低停顿时间和 CPU 开销，提升应用性能。
- **JEP 440: 记录模式 (Record Patterns)** - 增强模式匹配，以解构记录（Record）类实例，从而简化数据访问。
- **JEP 441: switch 的模式匹配 (Pattern Matching for switch)** - 扩展 `switch` 语句和表达式，使其可以处理更复杂的基于模式的数据查询。
- **JEP 444: 虚拟线程 (Virtual Threads)** - 引入由 JVM 管理的轻量级线程，以简化高吞吐量并发应用的编写、维护和扩展。
- **JEP 449: 弃用 Windows 32 位 x86 移植版本** - 弃用对 Windows 32 位 x86 操作系统的支持，并计划在未来版本中将其移除。
- **JEP 451: 准备禁止代理的动态加载** - 通过在默认情况下限制在运行时动态加载代理程序，来增强程序的完整性和安全性。
- **JEP 452: 密钥封装机制 API (Key Encapsulation Mechanism API)** - 引入一种使用公钥加密技术来保护对称密钥的现代化加密 API。

#### 虚拟线程 (Virtual Thread)

**目的：** 通过提供与操作系统线程解耦的轻量级 JVM 管理线程，彻底改变并发编程 。

**优势：**

- **更高的可伸缩性：** 能够处理数百万个并发任务（每请求一线程模型），而不会耗尽操作系统资源，非常适合 I/O 密集型应用。
- **更少的内存使用：** 虚拟线程是轻量级的，比传统平台线程消耗的内存显著减少。
- **高效的阻塞 I/O：** 当虚拟线程在 I/O 上阻塞时，其底层载体线程被释放以运行其他虚拟线程，从而提高资源利用率。
- **简化的并发编程：** 允许编写像异步代码一样可伸缩的直观阻塞代码，降低了复杂性。

**缺点：** 新的并发概念需要学习曲线，可能带来新的调试挑战。在 `synchronized` 块或原生方法中可能发生线程“固定”（pinning）现象 。不适用于 CPU 密集型任务 。

虽然虚拟线程非常强大，但它不是“银弹”，使用时需要注意几点：

1. **不适用于 CPU 密集型任务**：如果你的任务是大量的计算（如视频转码、复杂算法），它会长时间占用载体线程，导致其他虚拟线程无法运行，反而会降低性能。这类任务仍然应该使用传统的、数量固定的平台线程池。
2. **线程“钉住”（Pinning）问题**：
   - 当虚拟线程运行在 `synchronized` 代码块或本地方法（JNI）中时，它会被“钉”在载体线程上，无法被卸载。
   - 如果此时 `synchronized` 块内部发生了阻塞操作，那么这个宝贵的载体线程就会被一同阻塞，失去了虚拟线程的优势。
   - **解决方案**：尽量使用 `java.util.concurrent.locks.ReentrantLock` 来替代 `synchronized` 关键字，因为 `ReentrantLock` 不会导致线程钉住。
3. **`ThreadLocal` 的使用**： \* 由于虚拟线程数量可能非常多，过度使用 `ThreadLocal` 可能会导致巨大的内存消耗，因为它会为每一个虚拟线程都存储一份数据。 \* 需要谨慎评估 `ThreadLocal` 的使用场景，或者考虑使用新的 `ScopedValue`（Java 21 预览特性）作为替代方案。
4. **依赖库的兼容性**：确保你使用的数据库驱动、连接池（如 HikariCP）等第三方库都与虚拟线程兼容，不会在内部创建和管理自己的平台线程池，或存在其他导致“钉住”的问题。

**代码示例：**

**之前 (传统线程与线程池处理 I/O)：**

```java
    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(10); // 受限于操作系统线程
        for (int i = 0; i < 100; i++) { // 模拟 100 个 I/O 密集型任务
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("平台线程 " + Thread.currentThread().getName() + " 正在处理任务 " + taskId);
                try {
                    Thread.sleep(100); // 模拟阻塞 I/O
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.out.println("平台线程 " + Thread.currentThread().getName() + " 完成任务 " + taskId);
            });
        }
        executor.shutdown();

    }
```

**之后 (虚拟线程)：**

```java
// 1、通过 Thread.ofVirtual() 创建
Runnable fn = () -> {
  // your code here
};

Thread thread = Thread.ofVirtual(fn).start();

// 2、通过 Thread.startVirtualThread() 、创建
Thread thread = Thread.startVirtualThread(() -> {
  // your code here
});

// 3、通过 Executors.newVirtualThreadPerTaskExecutor() 创建
var executorService = Executors.newVirtualThreadPerTaskExecutor();

executorService.submit(() -> {
  // your code here
});

class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}

//4、通过 ThreadFactory 创建
CustomThread customThread = new CustomThread();
// 获取线程工厂类
ThreadFactory factory = Thread.ofVirtual().factory();
// 创建虚拟线程
Thread thread = factory.newThread(customThread);
// 启动线程
thread.start();


public class VirtualThreadTest {

    static List<Integer> list = new ArrayList<>();

    public static void main(String[] args) {
        // 开启线程 统计平台线程数
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
        scheduledExecutorService.scheduleAtFixedRate(() -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            ThreadInfo[] threadInfo = threadBean.dumpAllThreads(false, false);
            updateMaxThreadNum(threadInfo.length);
        }, 10, 10, TimeUnit.MILLISECONDS);

        long start = System.currentTimeMillis();
        // 虚拟线程
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        // 使用平台线程
//         ExecutorService executor =  Executors.newFixedThreadPool(200);
        for (int i = 0; i < 10000; i++) {
            executor.submit(() -> {
                try {
                    // 线程睡眠 0.5 s，模拟业务处理
                    TimeUnit.MILLISECONDS.sleep(500);
                } catch (InterruptedException ignored) {
                }
            });
        }
        executor.close();
        scheduledExecutorService.close();
        System.out.println("max：" + list.getFirst() + " platform thread/os thread");
        System.out.printf("totalMillis：%dms\n", System.currentTimeMillis() - start);


    }

    // 更新创建的平台最大线程数
    private static void updateMaxThreadNum(int num) {
        if (list.isEmpty()) {
            list.add(num);
        } else {
            Integer integer = list.getFirst();
            if (num > integer) {
                list.addFirst(num);
            }
        }
    }
}
```

虚拟线程通过与操作系统线程解耦，允许“每请求一线程”模型扩展到数百万个任务。当虚拟线程阻塞时（例如，进行 I/O 操作），其底层操作系统线程被释放以运行其他虚拟线程，从而实现更高的吞吐量和更简单的代码，这与管理线程池或复杂的异步 API 相比有显著优势。

虚拟线程是“轻量级的”，“与操作系统线程解耦”，并能为“高吞吐量并发应用”实现“更高的可伸缩性”。它们解决了“阻塞 I/O 问题”。传统的 Java 线程（平台线程）与操作系统线程是 1:1 映射的，而操作系统线程是有限的资源。这导致 I/O 密集型应用出现“线程池耗尽”和“CPU 利用率低”的情况。虚拟线程引入了“载体线程”的概念：当虚拟线程阻塞时，它会从其载体（操作系统线程）上“卸载”，从而释放载体以供其他虚拟线程使用。这使得数百万个虚拟线程可以在少量操作系统线程上运行 。这使得“每请求一线程”模型能够在不增加响应式编程复杂性的情况下实现可伸缩性。

| 特性         | 平台线程 (Platform Threads)                | 虚拟线程 (Virtual Threads)                                            |
| :----------- | :----------------------------------------- | :-------------------------------------------------------------------- |
| **本质**     | 操作系统线程的轻量级包装                   | JVM 管理的用户态轻量级线程                                            |
| **映射关系** | 与 OS 线程 1:1 映射                        | M 个虚拟线程 : N 个平台线程 (M:N 映射)                                |
| **资源消耗** | 重（MB 级别栈内存），数量有限（几千个）    | 极轻（KB 级别内存），数量庞大（可达数百万）                           |
| **调度方**   | 操作系统 (OS)                              | Java 虚拟机 (JVM)                                                     |
| **阻塞处理** | 阻塞整个 OS 线程，代价高昂                 | 不阻塞载体线程，JVM 自动切换，代价极低                                |
| **适用场景** | CPU 密集型任务（需要充分利用多核并行计算） | I/O 密集型、高并发任务（如 Web 服务器、微服务）                       |
| **创建方式** | `new Thread()` 或 `Thread.ofPlatform()`    | `Thread.ofVirtual()` 或 `Executors.newVirtualThreadPerTaskExecutor()` |

[Java 19 Virtual Threads--Java 的虚拟线程到来，给带来哪些改变？ - 知乎](https://www.zhihu.com/question/536743167)

[Virtual Threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)

#### 记录模式(Record Patterns)

**目的：** 在 Java 21 中最终确定 ,允许对记录进行模式匹配以进行解构，消除样板代码，让数据查询和处理变得更简洁、更直观、更安全

**优势：** 将类型检查、强制转换和数据提取（调用访问器方法）三个独立步骤合而为一，极大地减少了代码行数。

整个操作是类型安全的，避免了手写强制转换可能引发的 `ClassCastException`。

记录模式支持嵌套，允许你用一个模式深入查询复杂的数据对象图，编写出以往需要多层 `if` 判断和非空检查才能实现的优雅代码。

**代码示例：**

```java
// 定义一个数据载体 Point
record Point(int x, int y) {}

//老版本代码 (JDK 16 之前，或不使用记录模式)
public void processPointLegacy(Object obj) {
    // 目标：判断 obj 是否为 Point，并打印其坐标

    if (obj instanceof Point) {      // 步骤 1: 类型检查
        Point p = (Point) obj;       // 步骤 2: 强制类型转换

        int x = p.x();               // 步骤 3: 调用访问器方法获取 x
        int y = p.y();               // 步骤 4: 调用访问器方法获取 y

        System.out.println("这是一个点，坐标为: x=" + x + ", y=" + y);
    }
}
// 更简洁的嵌套记录模式：新版本代码 (使用 JDK 21 的记录模式)
public void processPointNew(Object obj) {
    // 目标：判断 obj 是否为 Point，并打印其坐标

    // 类型检查、强制转换、数据解构，一步到位！
    if (obj instanceof Point(int x, int y)) {
        // 如果匹配成功，变量 x 和 y 会被自动创建并赋值
        System.out.println("这是一个点，坐标为: x=" + x + ", y=" + y);
    }
}
```

Record Patterns 将模式匹配的强大功能扩展到记录，从而实现简洁的声明式数据处理，这对于复杂的 DTO 和嵌套数据结构特别有用。

**记录模式（Record Patterns）目前仅适用于 `Record` 类型，不能直接用于普通的 Java 实体类（POJO）**

#### `switch` 的模式匹配

**目的：**增强 Java 中的 switch 表达式和语句，允许在 case 标签中使用模式。当模式匹配时，执行 case 标签对应的代码。

传统 `switch` 语句的功能非常有限，它只能对少数几种类型（如 `int`、`String`、`enum`）进行精确的值匹配。对于更复杂的业务逻辑，比如“如果这个对象是某种类型，并且其某个属性满足某个条件，则执行...”，开发者不得不放弃 `switch`，转而使用冗长、丑陋且容易出错的 `if-else if-else` 链。

**优势：** 实现了更具表达性和更安全的条件逻辑，减少了重复的 `if-else` 代码并提供了类型安全。结合记录模式: 可以直接在 case 中解构 Record 对象，获取其内部组件。

守护模式 (Guarded Patterns)：可以在 `case` 标签后使用 `when` 关键字添加一个额外的布尔条件，实现更精细的逻辑匹配。

可以直接在 case 中处理 null！

**代码示例：**

```java
// 使用密封接口，告知编译器 Shape 只有这三种实现
sealed interface Shape {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
//不使用switch 模式匹配
public double getAreaLegacy(Shape shape) {
    // 处理 null 的前置判断
    if (shape == null) {
        return 0;
    }

    // 冗长且容易出错的 if-else if 链
    if (shape instanceof Circle) {
        Circle c = (Circle) shape; // 手动转换
        return Math.PI * c.radius() * c.radius();
    } else if (shape instanceof Rectangle) {
        Rectangle r = (Rectangle) shape; // 手动转换
        return r.width() * r.height();
    } else {
        // 如果 Shape 接口未来新增了子类，这里需要手动修改，否则会出错
        throw new IllegalArgumentException("未知的形状");
    }
}
//(Java 21新版本代码 (使用模式匹配的 switch))
public double getAreaNew(Shape shape) {
    // 一体化的 switch 表达式，简洁、安全、可读性强
    return switch (shape) {
        // 1. 直接处理 null
        case null -> 0;

        // 2. 匹配 Circle 类型，并自动解构出 radius
        case Circle(double r) -> Math.PI * r * r;

        // 3. 匹配 Rectangle 类型，并使用 "when" 添加额外条件（守护模式）
        case Rectangle(double w, double h) when w == h -> {
            System.out.println("这是一个正方形！");
            yield w * h; // 使用 yield 返回块中的值
        }

        // 4. 匹配普通的 Rectangle
        case Rectangle(double w, double h) -> w * h;
    };
    // 注意：因为 Shape 是密封的，且我们处理了所有情况(Circle, Rectangle)，
    // 所以编译器知道我们已经覆盖了所有可能性，无需 default 分支。
}
//守护模式 (when 子句)
// 老方法
switch (obj) {
    case String s:
        if (s.length() > 5) { // 嵌套 if
            System.out.println("Long String");
        }
        break;
}

// 新方法：使用 when 将条件写在 case 级别
switch (obj) {
    case String s when s.length() > 5 -> System.out.println("Long String");
    case String s                      -> System.out.println("Short String");
    default -> {}
}
```

`switch` 的模式匹配是控制流的重大改进，使 `switch` 成为一个更强大、更具表达力的构造。它允许更清晰地处理多态类型和复杂条件逻辑，减少代码冗余并提高可读性。

#### 有序集合

**目的：** 引入了新的接口（`SequencedCollection`、`SequencedSet`、`SequencedMap`）

**优势：** 这是一种具有确定出现顺序（encounter order）的集合（无论我们遍历这样的集合多少次，元素的出现顺序始终是固定的）。序列化集合提供了处理集合的第一个和最后一个元素以及反向视图（与原始集合相反的顺序）的简单方法。

以下集合类实现了新的接口：

- 实现 SequencedCollection：
  - List（如 ArrayList, LinkedList）
  - Deque（如 ArrayDeque, LinkedList）
  - SortedSet（如 TreeSet）
  - LinkedHashSet
- 实现 SequencedSet：
  - LinkedHashSet
  - SortedSet（如 TreeSet）
- 实现 SequencedMap：
  - LinkedHashMap
  - SortedMap（如 TreeMap）

**代码示例：**

**之后 (Java 21+ - Sequenced Collections - 统一 API)：**

```java
SequencedCollection<String> seqList = new ArrayList<>(List.of("A", "B", "C"));
System.out.println("First element: " + seqList.getFirst()); // "A"
System.out.println("Last element: " + seqList.getLast());   // "C"
System.out.println("Reversed: " + seqList.reversed()); // (返回一个视图)

SequencedSet<String> seqSet = new LinkedHashSet<>(Set.of("X", "Y", "Z"));
System.out.println("First element: " + seqSet.getFirst()); // "X"
System.out.println("Last element: " + seqSet.getLast());   // "Z"

SequencedMap<String, Integer> seqMap = new LinkedHashMap<>();
seqMap.put("one", 1);
seqMap.put("two", 2);
seqMap.put("three", 3);
System.out.println("First entry: " + seqMap.firstEntry()); // one=1
System.out.println("Last entry: " + seqMap.lastEntry());   // three=3
System.out.println("Reversed map: " + seqMap.reversed()); // {three=3, two=2, one=1}
```

**差异：** Sequenced Collections 为 Java 集合框架中长期存在的空白提供了解决方案，通过为有序集合提供标准化的交互方式，提高了 API 一致性并减少了对自定义工具方法的依赖。

#### 分代 ZGC

**目的：** 增强 ZGC，通过为年轻代和老年代对象维护单独的分代 。

**优势：** 提高了垃圾回收效率和性能，特别是对于大堆应用，通过更频繁地回收短生命周期对象。分代 ZGC 是 ZGC 的一项重要性能增强，进一步巩固了 Java 在大堆和严格延迟要求应用中的地位。这表明了对 JVM 性能的持续投入。

DK21 中对 ZGC 进行了功能扩展，增加了分代 GC 功能。不过，默认是关闭的，需要通过配置打开：

```java
// 启用分代ZGC
java -XX:+UseZGC -XX:+ZGenerational ...
```

在未来的版本中，官方会把 ZGenerational 设为默认值，即默认打开 ZGC 的分代 GC。在更晚的版本中，非分代 ZGC 就被移除。

### Java 22-24：前沿技术 (预览和孵化器)

Java 22 到 24 版本继续推动平台创新，引入了多项处于预览和孵化器阶段的功能，这些功能旨在进一步提升性能、简化开发并增强安全性。

**java25（LTS）：预计 2025 年 9 月发布**

## 
