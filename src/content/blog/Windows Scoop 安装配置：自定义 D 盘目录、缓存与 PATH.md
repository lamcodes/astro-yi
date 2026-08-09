---
title: 'Windows Scoop 安装配置：自定义 D 盘目录、缓存与 PATH'
description: '记录 Windows 下 Scoop 的默认目录、D 盘自定义安装、缓存与 PATH 配置，以及安装后验证和空间清理方式。'
date: 2026-08-09 00:00:00
tags: ['Scoop', 'Windows', 'PowerShell', '包管理器']
category: '技术'
mathjax: false
mermaid: false
draft: false
toc: true
donate: true
comment: true
---

## 先说结论

Scoop 是 Windows 下的命令行包管理器，当前官方没有提供常见的 MSI、EXE 图形安装向导。它主要通过 PowerShell 安装，安装脚本的 `-ScoopDir` 参数就相当于图形安装器里的“选择安装位置”。

默认情况下，Scoop 会安装到：

```text
C:\Users\你的用户名\scoop
```

以后通过 `scoop install` 安装的软件、下载缓存和持久数据，默认也会进入这套目录。软件装得越多，C 盘占用通常就越大。

如果准备长期使用 Scoop，可以在**第一次安装时**把根目录指定到 D 盘：

```text
D:\Scoop
```

这样以后执行：

```powershell
scoop install mise
scoop install git
scoop install 7zip
```

软件默认会进入 `D:\Scoop` 的目录体系，不再占用默认的 `C:\Users\用户名\scoop`。

## Scoop 默认为什么会占用 C 盘

默认根目录大致如下：

```text
C:\Users\你的用户名\scoop
├─ apps       # 已安装的软件
├─ cache      # 下载的 ZIP、安装包等缓存
├─ persist    # 软件升级后仍然保留的数据
├─ shims      # PATH 中的命令代理
└─ buckets    # 软件清单仓库
```

这些目录的作用可以简单理解为：

| 目录 | 作用 | 是否容易增长 |
| --- | --- | --- |
| `apps` | 软件当前版本和升级后暂时保留的旧版本 | 是，主要空间来源 |
| `cache` | Scoop 下载过的安装包 | 是，安装和升级越多越大 |
| `persist` | 软件升级、卸载时需要保留的数据 | 视软件而定 |
| `shims` | 加入 PATH 的命令代理 | 否，通常很小 |
| `buckets` | 软件安装清单仓库 | 会增长，但通常不是主要占用 |

真正容易占空间的是 `apps`、`cache` 和 `persist`，不是 Scoop 本体。

因此，如果默认安装在 C 盘，软件装得越多，`C:\Users\用户名\scoop` 的占用通常也会越来越大。

## 从零安装到 D 盘

### 1. 使用普通 PowerShell

Scoop 默认采用当前用户级安装，通常不需要管理员权限。建议打开普通 PowerShell，不要使用“以管理员身份运行”。

先查看当前用户的脚本执行策略：

```powershell
Get-ExecutionPolicy -Scope CurrentUser
```

如果已经是下面任意一种，通常不用重复设置：

```text
RemoteSigned
Unrestricted
Bypass
```

如果返回 `Undefined` 或 `Restricted`，可以只为当前用户设置：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

这条命令只调整当前 Windows 用户的 PowerShell 脚本执行策略，不会安装 Scoop，也不会修改其他账号。

### 2. 下载 Scoop 官方安装脚本

```powershell
irm get.scoop.sh -OutFile "$env:TEMP\install-scoop.ps1"
```

这里：

- `irm` 是 `Invoke-RestMethod` 的别名，用来访问 Scoop 官方地址。
- `-OutFile` 把返回内容保存成文件。
- `$env:TEMP` 是当前用户的系统临时目录。

执行完成后，只是多了一个临时安装脚本，Scoop 还没有开始安装。

如果想先查看安装器支持的参数：

```powershell
& "$env:TEMP\install-scoop.ps1" -?
```

### 3. 指定 Scoop 根目录和缓存目录

```powershell
& "$env:TEMP\install-scoop.ps1" `
    -ScoopDir "D:\Scoop" `
    -ScoopCacheDir "D:\Scoop\cache"
```

这段命令可以写成一行：

```powershell
& "$env:TEMP\install-scoop.ps1" -ScoopDir "D:\Scoop" -ScoopCacheDir "D:\Scoop\cache"
```

两种写法功能相同。多行版本中的反引号 `` ` `` 是 PowerShell 的续行符，表示下一行仍属于同一条命令。

参数含义是：

```text
-ScoopDir "D:\Scoop"
→ 把当前用户的 Scoop 根目录设为 D:\Scoop

-ScoopCacheDir "D:\Scoop\cache"
→ 把 Scoop 下载缓存设为 D:\Scoop\cache
```

如果只设置 `-ScoopDir`，缓存默认也会跟随 Scoop 根目录，放在 `D:\Scoop\cache`。这里把缓存参数明确写出来，主要是为了让目录关系更直观。

### 4. 删除临时安装脚本

安装完成后执行：

```powershell
Remove-Item "$env:TEMP\install-scoop.ps1"
```

这只会删除刚才下载的临时脚本，不会卸载 Scoop，也不会删除 `D:\Scoop`。

### 5. 完整命令汇总

可以按下面的顺序执行：

```powershell
# 当前用户执行策略不满足要求时再设置
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 下载官方安装器到临时目录
irm get.scoop.sh -OutFile "$env:TEMP\install-scoop.ps1"

# 安装到 D 盘
& "$env:TEMP\install-scoop.ps1" `
    -ScoopDir "D:\Scoop" `
    -ScoopCacheDir "D:\Scoop\cache"

# 删除临时安装器
Remove-Item "$env:TEMP\install-scoop.ps1"
```

## 安装后怎么确认

安装完成后，重新打开一个普通 PowerShell，再执行：

```powershell
scoop --version
where.exe scoop
scoop config
Get-ChildItem "D:\Scoop"
```

检查目标如下：

```text
scoop --version
→ 能输出 Scoop 版本信息

where.exe scoop
→ 命中 D:\Scoop\shims 下的 Scoop 命令入口

scoop config
→ 能看到 root_path、cache_path 等配置

Get-ChildItem "D:\Scoop"
→ 能看到 apps、buckets、shims 等目录
```

`cache` 和 `persist` 可能要在实际安装软件后才出现，不要求第一次安装结束时所有目录都已经存在。

### 检查用户 PATH

Scoop 安装器会把下面的目录加入当前用户 PATH：

```text
D:\Scoop\shims
```

可以执行：

```powershell
[Environment]::GetEnvironmentVariable("Path", "User") -split ";"
```

结果中应该包含：

```text
D:\Scoop\shims
```

以后执行 `git`、`mise`、`7z` 等命令时，Windows 会先在这个 shims 目录中找到 Scoop 创建的命令代理，再转到软件的真实目录。

### 为什么环境变量中不一定有 `SCOOP`

通过：

```powershell
-ScoopDir "D:\Scoop"
```

指定的非默认路径，当前 Scoop 安装器通常会保存到 Scoop 自己的配置文件：

```text
%USERPROFILE%\.config\scoop\config.json
```

其中可能包含类似：

```json
{
  "root_path": "D:\\Scoop",
  "cache_path": "D:\\Scoop\\cache"
}
```

所以 Windows 图形界面的“用户变量”中不一定会出现：

```text
SCOOP=D:\Scoop
```

这不代表安装失败。确认 Scoop 实际目录时，优先查看：

```powershell
scoop config
where.exe scoop
```

也可以直接读取配置文件：

```powershell
Get-Content "$env:USERPROFILE\.config\scoop\config.json"
```

## 安装软件和清理空间

### 1. 安装软件

例如：

```powershell
scoop install mise
scoop install git
scoop install 7zip
```

如果 Scoop 根目录是 `D:\Scoop`，这些软件默认会进入：

```text
D:\Scoop\apps\mise
D:\Scoop\apps\git
D:\Scoop\apps\7zip
```

对应的命令代理会进入：

```text
D:\Scoop\shims
```

下载过的安装包会进入：

```text
D:\Scoop\cache
```

### 2. 查看和更新软件

```powershell
scoop list
scoop status
scoop update
scoop update *
```

可以简单理解为：

```text
scoop list
→ 查看已经安装的软件

scoop status
→ 查看哪些软件需要更新或存在状态问题

scoop update
→ 更新 Scoop 自己和软件清单

scoop update *
→ 更新所有已安装的软件
```

### 3. 查看和清理下载缓存

先查看缓存：

```powershell
scoop cache show
```

清理全部下载缓存：

```powershell
scoop cache rm *
```

这会删除 `cache` 中下载过的安装包，不会卸载 `apps` 中已经安装的软件。以后重新安装相同版本时，可能需要重新下载。

### 4. 清理升级后留下的旧版本

```powershell
scoop cleanup *
```

这个命令清理所有 Scoop 应用升级后留下的旧版本目录，不会删除当前正在使用的版本。

清理前可以先看：

```powershell
scoop status
scoop list
scoop cache show
```

需要注意：

```text
scoop cache rm *
→ 清理下载缓存

scoop cleanup *
→ 清理 apps 中的旧版本
```

它们解决的是两个不同的空间占用来源。

## 已经安装在 C 盘怎么办

如果已经通过默认方式安装到了：

```text
C:\Users\你的用户名\scoop
```

重新运行：

```powershell
.\install.ps1 -ScoopDir "D:\Scoop"
```

不会自动把现有安装迁移到 D 盘。安装器发现系统中已经能找到 `scoop` 命令时，会提示 Scoop 已经安装。

也不要直接做下面这种操作：

```text
把 C:\Users\用户名\scoop 剪切到 D:\Scoop
然后只修改 PATH
```

这样可能导致：

- shims 仍然指向旧目录。
- 软件升级或卸载失败。
- `persist` 中的数据链接失效。
- PATH 同时保留新旧路径。
- Scoop 配置仍然记录旧根目录。

### 软件不多时，优先记录后重装

先查看已安装软件：

```powershell
scoop list
```

也可以导出应用、bucket 等信息：

```powershell
scoop export > "$env:USERPROFILE\scoop-packages.json"
```

然后：

1. 保存需要的 `persist` 数据和导出文件。
2. 按当前 Scoop 官方卸载流程清理旧安装。
3. 使用本文的 `-ScoopDir "D:\Scoop"` 参数重新安装 Scoop。
4. 根据列表或导出文件重新安装软件。
5. 检查新 PATH 和应用数据，再清理遗留目录。

这里不提供直接搬迁 `apps`、`persist` 和 shims 的脚本，因为不同软件的持久数据、目录链接和当前版本状态可能不同。软件不多时，重装通常比直接搬目录更稳妥。

## 常见问题

### 1. 必须用管理员 PowerShell 吗

不需要。Scoop 默认采用当前用户级安装，官方推荐在普通非管理员 PowerShell 中运行。

只有明确要做全局安装、面向整台电脑所有用户时，才需要考虑管理员模式和 `-ScoopGlobalDir`。普通个人开发环境没有必要使用管理员 PowerShell。

### 2. 有没有官方图形安装器

当前官方没有提供 ScoopSetup.exe、MSI 或带目录选择窗口的安装向导。

官方安装方式是 PowerShell 脚本，其中：

```powershell
-ScoopDir "D:\Scoop"
```

就相当于普通图形安装器里的“选择安装目录”。

### 3. 安装到 D 盘后，后续软件都会去 D 盘吗

普通用户级安装会进入 D 盘 Scoop 目录体系：

```powershell
scoop install git
```

默认进入：

```text
D:\Scoop\apps\git
```

下载缓存进入：

```text
D:\Scoop\cache
```

命令代理进入：

```text
D:\Scoop\shims
```

但软件自己的运行数据仍可能写入 Windows 的 `%APPDATA%`、`%LOCALAPPDATA%` 或用户文档目录，这取决于软件本身，不是 Scoop 能统一控制的。

### 4. Scoop 在 D 盘，mise 管理的 Node 和 JDK 也会自动去 D 盘吗

不会。

Scoop 管理的是：

```text
D:\Scoop\apps\mise
D:\Scoop\shims\mise.exe
```

mise 管理的 Node、Java、Python 使用 mise 自己的目录规则。如果还想把这些开发工具放到 D 盘，需要另外设置：

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_DATA_DIR",
    "D:\dev\mise\data",
    "User"
)
```

这两个目录解决的是不同问题：

```text
D:\Scoop
→ Scoop 本体和 Scoop 安装的软件

D:\dev\mise\data
→ mise 管理的 Node、Java、Python、Go 等工具
```

## 参考资料

- [Scoop 官方安装器](https://github.com/ScoopInstaller/Install)
- [Scoop Folder Layout](https://github.com/ScoopInstaller/Scoop/wiki/Scoop-Folder-Layout)

> Scoop 安装器参数和目录行为可能随版本变化。本文整理于 2026 年 8 月，实际安装时应以官方链接中的当前说明为准。
