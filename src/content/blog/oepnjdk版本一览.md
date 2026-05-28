---
id: 'unique-20250922-000149'
title: 'oepnjdk版本一览'
description: ''
date: 2025-09-22 00:01:49
date_updated: 2025-09-22 00:01:49
tags: ['openjdk', 'java', 'jdk']
category: '技术'
katex: false
pin: false
draft: false
---


### OpenJDK 版本与发行版速查指南

OpenJDK 的版本规则、主流发行版以及下载地址。

#### 1. Java (OpenJDK) 版本一览表

自 Java 9 起，Java 每六个月发布一个新功能版本，每两年发布一个**长期支持 (LTS) 版本**。生产环境强烈建议使用 LTS 版本。

| Java 版本   | 发布日期  | LTS 版本? | 主要特性/说明                                               |
| :---------- | :-------- | :-------- | :---------------------------------------------------------- |
| **Java 8**  | 2014年3月 | ✅ **是**  | 经典的 LTS 版本，至今仍被广泛使用。                         |
| **Java 11** | 2018年9月 | ✅ **是**  | 第一个 LTS 版本的重大改进，引入 `var` 等特性。              |
| **Java 17** | 2021年9月 | ✅ **是**  | 引入了密封类 (Sealed Classes)、更强大的 `switch` 表达式等。 |
| **Java 21** | 2023年9月 | ✅ **是**  | 带来了虚拟线程、记录模式等重要功能。                        |
| Java 22     | 2024年3月 | 否        | 过渡性的功能版本。                                          |
| Java 23     | 2024年9月 | 否        | 过渡性的功能版本。                                          |
| Java 25     | 2025年9月 | ✅ **是**  | 当前最新的 LTS 版本                                         |

#### 2. 为什么会有发行版？

要理解各大厂商发行版存在的意义，先要搞清楚 OpenJDK 的维护机制：

- **OpenJDK** 是 Java SE 的开源参考实现，主要产出**源代码**，本身不直接面向终端用户。
- Oracle 会在 [jdk.java.net](https://jdk.java.net/) 上发布基于 OpenJDK 源码的免费社区构建包，但**只维护当前版本，不支持旧版本**。比如 JDK 22 发布后，JDK 21 的社区包就不再更新。
- 对于 **LTS 版本**（8、11、17、21），Oracle 不再持续发布免费二进制包，但上游源码的安全补丁和 bug fix 仍在 OpenJDK 社区中产生——其中 **Red Hat 接管了多个 LTS 版本的社区维护主导权**。
- 各厂商（Eclipse、Amazon、Microsoft、Azul 等）拿到持续更新的开源源码后，各自编译、打包并附加不同的支持承诺，就形成了各种**发行版 (Distribution)**。

简单说：**社区源码持续更新，但官方免费二进制包不持续——这个缺口由发行版填补。**

#### 3. 主流发行版及选择建议

| 发行版                         | 维护者           | 核心优势与建议                                               |
| :----------------------------- | :--------------- | :----------------------------------------------------------- |
| **Eclipse Temurin**            | Eclipse 基金会   | **通用首选**。完全免费，社区驱动，质量有保障。适合绝大多数开发者和项目。 |
| **Amazon Corretto**            | 亚马逊 (Amazon)  | **AWS 用户首选**。免费，经过亚马逊大规模内部验证，稳定可靠。 |
| **Microsoft Build of OpenJDK** | 微软 (Microsoft) | **Azure 用户或微软生态首选**。免费，由微软官方构建并用于其云服务。 |
| **Oracle OpenJDK**             | 甲骨文 (Oracle)  | 想体验最新功能可选。但非 LTS 版本的支持周期极短，不建议用于生产。 |
| **Azul Zulu**                  | Azul Systems     | 需要商业支持或对旧版本有需求时可选。提供非常广泛的 Java 版本支持。 |
| **Alibaba Dragonwell**         | 阿里巴巴         | 针对大规模、高并发的互联网场景进行了深度优化，包含一些独有特性。 |

#### 4. 下载地址汇总

*   **Eclipse Temurin (Adoptium)**:
    *   `https://adoptium.net/`

*   **Amazon Corretto**:
    *   `https://aws.amazon.com/corretto/`

*   **Microsoft Build of OpenJDK**:
    *   `https://www.microsoft.com/openjdk`

*   **Oracle OpenJDK**:
    *   `https://jdk.java.net/` (最新版本)

*   **Azul Zulu**:
    *   `https://www.azul.com/downloads/`

*   **BellSoft Liberica JDK**:
    *   `https://bell-sw.com/`

*   **Alibaba Dragonwell**:
    *   `https://github.com/alibaba/dragonwell`