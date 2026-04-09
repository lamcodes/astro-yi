---
id: "unique-20260106-160358"
title: "Spring Boot Maven 依赖与插件管理：从 Parent 到 BOM 的完整机制"
description: ""
date: 2026-01-06 16:03:58
date_updated: 2026-01-06 16:03:58
tags: ["springboot", "maven", "java"]
category: ["技术", "java"]
katex: false
pin: false
draft: false
---

# Spring Boot Maven 依赖与插件管理:从 Parent 到 BOM 的完整机制

新建 Spring Boot 项目时,发现 Maven 依赖配置存在多个相似概念,产生研究的兴趣。

## 一、Maven 基础机制

### 1.1 Maven 依赖分类

Maven 依赖按 **packaging** 类型分为两大类:

**代码包 (有 .class 文件):**

| packaging | 全称 | 产物 | 使用场景 | 示例 |
|-----------|------|------|---------|------|
| **jar** | Java Archive | .jar | 普通代码库、工具类 | spring-core, commons-lang3 |
| **war** | Web Application Archive | .war | Web 应用,部署到 Tomcat | my-webapp |
| **ear** | Enterprise Application Archive | .ear | J2EE 企业应用 | my-enterprise |

**构建描述文件 (没有代码):**

| 类型 | packaging | 特征 | 作用 | 示例 |
|------|-----------|------|------|------|
| **聚合 POM** | pom | 有 `<modules>` | 管理多个子模块 | 多模块父项目 |
| **父 POM** | pom | 有 `<dependencyManagement>` + `<pluginManagement>` | 子模块继承配置 | spring-boot-starter-parent |
| **BOM** | pom | 只有 `<dependencyManagement>` | 纯版本字典 | spring-boot-dependencies |
| **Starter POM** | pom | 有 `<dependencies>` | 依赖集合的"便利包" | spring-boot-starter-web |

**快速判断方法:**

```
看本地仓库 ~/.m2/repository/:
├── xxx-1.0.0.jar  → 代码包
├── xxx-1.0.0.war  → Web 应用
└── xxx-1.0.0.pom  → 构建描述文件 (无代码)
```

### 1.2 parent 标签 (继承机制)

**作用:** 让当前 POM 继承另一个 POM 的配置

**公式:**

```
parent = 继承配置
├── 继承依赖版本 (dependencyManagement)
├── 继承插件配置 (pluginManagement)
├── 继承属性定义 (properties)
└── 继承其他配置
```

**示例:**

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>
```

**限制:** Maven 单继承,一个 POM 只能有一个 `<parent>`

### 1.3 dependencyManagement 标签 (版本管理)

**作用:** 声明依赖版本号,但不引入依赖

**公式:**

```
dependencyManagement = 菜单 (声明版本号,不引入)
dependencies = 点菜 (真正引入 jar 包)
```

**区别:**

| 特性 | dependencyManagement | dependencies |
|------|---------------------|--------------|
| **作用** | 声明版本号 | 真正引入依赖 |
| **下载 jar** | ❌ 不下载 | ✅ 下载 |
| **类比** | 餐厅菜单 | 向服务员点菜 |

**示例:**

```xml
<dependencyManagement>
    <dependencies>
        <!-- 声明版本: spring-boot-starter-web 使用 3.2.0 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>3.2.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- 真正引入: 无需写版本号,继承上面的 3.2.0 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### 1.4 pluginManagement 标签 (插件管理)

**作用:** 声明插件版本和配置,但不执行插件

**公式:**

```
pluginManagement = 插件菜单 (声明版本和配置)
plugins = 引入插件 (真正执行)
```

**区别:**

| 特性 | pluginManagement | plugins |
|------|-----------------|---------|
| **作用** | 声明插件版本和配置 | 真正引入并执行插件 |
| **执行插件** | ❌ 不执行 | ✅ 执行 |
| **使用位置** | 通常在父 POM | 子 POM 继承或独立使用 |

**示例:**

```xml
<!-- 父 POM -->
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
        </plugins>
    </pluginManagement>
</build>

<!-- 子 POM -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <!-- 无需写 version 和 configuration,继承父 POM -->
        </plugin>
    </plugins>
</build>
```

### 1.5 三个核心标签对比

**管理对象对比:**

| 标签 | 管理对象 | 作用 | Maven 单继承限制 |
|------|---------|------|-----------------|
| **`<parent>`** | 整个 POM | 继承所有配置 | 只能有一个 |
| **`<dependencyManagement>`** | 依赖版本 | 声明版本号 | 可导入多个 BOM |
| **`<pluginManagement>`** | 插件 | 声明插件配置 | 可定义多个 |

**使用场景对比:**

| 场景 | parent | dependencyManagement | pluginManagement |
|------|--------|----------------------|------------------|
| **继承父项目配置** | ✅ | - | - |
| **统一依赖版本** | ✅ (通过继承) | ✅ (通过 import) | - |
| **统一插件配置** | ✅ (通过继承) | - | ✅ (通过继承) |
| **多 BOM 共存** | ❌ (单继承) | ✅ (import scope) | - |

## 二、Spring Boot 核心概念

### 2.1 spring-boot-starter-parent vs spring-boot-starter

**公式:**

```
spring-boot-starter-parent = 规则书(无代码)
spring-boot-starter = 地基(核心代码集合)
spring-boot-starter-web = 地基 + 房子(Web能力)
```

**真相: Parent 的继承链**

```
你的项目
    ↓ 继承
spring-boot-starter-parent
    ↓ 继承
spring-boot-dependencies (BOM)
    (提供 500+ 依赖的版本号)
```

**关键洞察:**

`spring-boot-starter-parent` 本身继承自 `spring-boot-dependencies`。所以当你使用 Parent 时:
- **不需要再引入** `spring-boot-dependencies`
- Parent 已经通过继承获得了 BOM 的所有版本定义
- Parent 在 BOM 之上**额外添加了插件配置**

**本质区别:**

- **spring-boot-starter-parent**
  - 定位: 父工程 POM
  - 职责: 版本管理 + 默认配置 + 插件管理
  - 特征: **不包含任何代码 jar 包**
  - 作用: 继承 `spring-boot-dependencies` 获得版本管理,再配置插件和构建默认值

- **spring-boot-starter**
  - 定位: 核心启动器
  - 职责: 提供最基础的代码集合
  - 内容: Spring Core + AutoConfigure + Logging + YAML 解析
  - 适用: 非 Web 应用(定时任务、纯后台服务)

- **spring-boot-starter-web**
  - 定位: Web 启动器
  - 内容: **包含** spring-boot-starter + Tomcat + Spring MVC + Jackson
  - 适用: API 接口、Web 应用

**使用关系:**

```
有了 Parent,必须引入至少一个 Starter
├─ Web 项目: 引入 spring-boot-starter-web (已包含 starter,无需再引)
└─ 非 Web 项目: 引入 spring-boot-starter
```

## 三、Maven 插件机制

### 3.1 插件标签结构

Maven 通过 `<build><plugins>` 配置构建行为:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <!-- 插件配置参数 -->
            </configuration>
            <executions>
                <execution>
                    <id>default-compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

**核心标签含义:**

- **`<plugins>`**: 插件列表,真正引入并执行插件
- **`<pluginManagement>`**: 插件管理,声明版本和配置,类似 dependencyManagement
- **`<version>`**: 插件版本号
- **`<configuration>`**: 插件参数配置
- **`<executions>`**: 绑定插件目标到 Maven 生命周期阶段
- **`<phase>`**: 生命周期阶段(validate/compile/test/package/install/deploy)
- **`<goals>`**: 插件目标(如 compile/test/jar/repackage)

**插件分类:**

```
Build Plugins (构建插件)
├── 编译期: maven-compiler-plugin, maven-resources-plugin
├── 测试期: maven-surefire-plugin, maven-failsafe-plugin
├── 打包期: maven-jar-plugin, maven-war-plugin
└── 部署期: maven-deploy-plugin

Reporting Plugins (报告插件)
├── maven-javadoc-plugin
├── maven-checkstyle-plugin
└── maven-pmd-plugin
```

### 3.2 生命周期与插件绑定

Maven 构建生命周期:

```
clean 生命周期:
    pre-clean → clean → post-clean

default 生命周期 (构建核心):
    validate → compile → test → package → install → deploy
       ↑         ↑       ↑       ↑        ↑        ↑
       |         |       |       |        |        |
     验证项目    编译    测试     打包      安装     部署

site 生命周期:
    pre-site → site → post-site → site-deploy
```

**默认插件绑定:**

| 生命周期阶段 | 绑定插件 | 插件目标 |
|------------|---------|---------|
| compile | maven-compiler-plugin | compile |
| test | maven-surefire-plugin | test |
| package | maven-jar-plugin | jar |
| install | maven-install-plugin | install |
| deploy | maven-deploy-plugin | deploy |

### 3.3 pluginManagement vs plugins

**公式:**

```
pluginManagement = 插件菜单(声明版本和配置)
plugins = 引入插件(真正执行)
```

**区别:**

- **`<pluginManagement>`**
  - 声明插件版本和默认配置
  - 不执行插件
  - 通常在父 POM 中定义

- **`<plugins>`**
  - 真正引入并执行插件
  - 可继承 pluginManagement 的配置

**示例:**

```xml
<!-- 父 POM: pluginManagement -->
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
        </plugins>
    </pluginManagement>
</build>

<!-- 子 POM: plugins -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <!-- 无需写 version 和 configuration,继承父 POM -->
        </plugin>
    </plugins>
</build>
```

### 3.4 maven-compiler-plugin (编译插件)

**作用:**
- 将 `.java` 源文件编译成 `.class` 字节码
- 绑定到 `compile` 阶段

**核心参数:**

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <!-- 编译目标版本 -->
        <source>17</source>
        <target>17</target>

        <!-- JDK 9+ 可用,替代 source/target -->
        <release>17</release>

        <!-- 编译编码 -->
        <encoding>UTF-8</encoding>

        <!-- 编译器参数 -->
        <compilerArgs>
            <arg>-parameters</arg>  <!-- 保留方法参数名(反射可用) -->
            <arg>-Xlint:unchecked</arg>
        </compilerArgs>
    </configuration>
</plugin>
```

**使用场景:**
- 指定 Java 版本(如 Java 17)
- 保留方法参数名(Spring MVC 等框架需要)
- 自定义编译器选项

### 3.5 spring-boot-maven-plugin (Spring Boot 打包插件)

**作用:**
- 将普通 JAR 重新打包成**可执行 Fat JAR**
- 核心目标: `repackage`,绑定到 `package` 阶段

**工作流程:**

```
1. mvn package 执行
   ↓
2. 生成普通 JAR (不含依赖)
   ↓
3. repackage 目标执行
   ↓
4. 原始 JAR 重命名为 xxx.original
   ↓
5. 创建新的 Fat JAR:
   - BOOT-INF/classes: 你的代码
   - BOOT-INF/lib: 所有依赖 jar
   - org.springframework.boot.loader: 启动加载器
```

**Fat JAR 结构:**

```
my-app.jar
├── META-INF/
│   └── MANIFEST.MF           # 主类: org.springframework.boot.loader.JarLauncher
├── org/springframework/boot/loader/  # 类加载器
├── BOOT-INF/
│   ├── classes/              # 你的 .class 文件
│   └── lib/                  # 依赖的第三方 jar
│       ├── spring-core.jar
│       ├── jackson-databind.jar
│       └── ...
```

**配置示例:**

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <!-- 指定主类(通常自动检测) -->
        <mainClass>com.example.Application</mainClass>

        <!-- 排除某些依赖 -->
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>

        <!-- 可执行 jar 归档器配置 -->
        <archive>
            <manifest>
                <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
            </manifest>
        </archive>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**使用场景:**
- 生成可直接运行 `java -jar app.jar` 的包
- 微服务部署
- 容器化部署(Docker)

### 3.6 两个插件对比

**公式:**

```
maven-compiler-plugin = 编译期 (.java → .class)
spring-boot-maven-plugin = 打包期 (.class → 可执行 .jar)
```

**生命周期位置:**

```
validate → compile → test → package → install → deploy
           ↑                    ↑
    maven-compiler-plugin    spring-boot-maven-plugin
    (编译源代码)              (repackage 目标)
```

| 维度 | maven-compiler-plugin | spring-boot-maven-plugin |
|------|----------------------|--------------------------|
| **阶段** | 编译期 | 打包期 |
| **输入** | `.java` 文件 | `.class` 文件 + 依赖 jar |
| **输出** | `.class` 文件 | 可执行 `.jar` |
| **必需性** | 必需(所有 Java 项目) | Spring Boot 项目必需 |
| **独立性** | 可单独使用 | 依赖 compiler 的输出 |
| **产物大小** | 小(仅代码) | 大(包含所有依赖) |
| **默认绑定** | compile 阶段 | package 阶段(repackage 目标) |

## 四、两种实践方案

### 4.1 方案一: 继承 Parent (推荐,最省事)

```xml
<!-- 获得版本管理和插件配置 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <!-- 真正引入依赖,无需写版本号 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### 4.2 方案二: 自定义父工程 (当不能继承 Spring Boot Parent 时)

**⚠️ 缺失: 插件配置**

BOM Import 只引入版本管理,不包含插件配置。必须手动配置:

```xml
<dependencyManagement>
    <dependencies>
        <!-- 引入版本字典,不引入 jar 包 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 必须手动配置插件 -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
            </configuration>
        </plugin>
    </plugins>
</build>

<dependencies>
    <!-- 真正引入依赖,依然无需写版本号 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**方案对比:**

| 特性 | Parent 继承 | BOM Import |
|------|------------|------------|
| 依赖版本管理 | ✅ 自动 | ✅ 自动 |
| 插件版本管理 | ✅ 自动 | ❌ 需手动 |
| Java 编译配置 | ✅ 自动 | ❌ 需手动 |
| 资源编码配置 | ✅ 自动 | ❌ 需手动 |
| 继承灵活性 | ❌ 单继承 | ✅ 可导入多个 BOM |

## 五、核心结论

1. **Parent 提供双重管理** → 依赖版本 + 插件配置
2. **BOM 只管依赖版本** → 插件配置需手动补全
3. **dependencyManagement 只是菜单** → 不会导致项目臃肿,只有 dependencies 才真正引入
4. **Starter-Web 已包含 Starter** → 无需重复引入
5. **BOM + Import 破解单继承** → 代价是失去插件配置,需手动补充
6. **Compiler 编译代码** → 生成 .class,是构建的第一步
7. **Spring Boot Plugin 打包部署** → 生成可执行 jar,是构建的最后一步

## 参考资料

### Maven 基础机制
- [Maven Packaging Types – Maven打包类型](https://baeldung.xiaocaicai.com/maven-packaging-types/)
- [Maven的三种项目打包方式——pom,jar,war的区别](https://developer.aliyun.com/article/1637906)
- [Maven pom packaging 类型pom、jar、war 原创](https://blog.csdn.net/wei198621/article/details/120912233)

### BOM 与依赖管理
- [spring-boot-starter-parent 项目的作用](https://cloud.tencent.com/developer/article/2514183)
- [spring-boot-starter-parent和spring-boot-dependencies介绍](https://blog.csdn.net/Muscleheng/article/details/136407874)
- [Spring Boot中spring-boot-starter-parent的依赖管理与配置](https://comate.baidu.com/zh/page/n4ylu0vyl7i)
- [全面解析Maven BOM (Bill of Materials)](https://cloud.tencent.com/developer/article/2312938)

### Maven 插件
- [Maven中的dependencyManagement标签](https://blog.csdn.net/m0_70484213/article/details/144379749)
- [SpringBoot打包运行原理和加载机制原理](https://www.cnblogs.com/jingzh/p/18928781)
- [spring-boot-maven-plugin 将spring打包成单个jar的工作原理](https://blog.csdn.net/zfj321/article/details/147655516)
- [Spring Boot Maven插件repackage功能详解](https://comate.baidu.com/zh/page/2c1a786weoh)

### 官方文档
- [Maven Central Repository - spring-boot-dependencies](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-dependencies/3.2.0)
- [Sonatype Central - spring-boot-dependencies](https://central.sonatype.com/artifact/org.springframework.boot/spring-boot-dependencies/3.2.0)
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/3.2.0/reference/html/getting-started.html)
