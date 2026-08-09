---
title: 'Windows 上配置 mise：安装目录、shims 与 PowerShell 环境'
description: '记录 Windows 下 mise 的 Scoop、WinGet、Chocolatey 和手动安装方式，解释默认目录、自定义 D 盘、环境变量、shims、PATH 与 PowerShell 项目环境。'
date: 2026-08-06 00:00:00
tags: ['mise', 'Windows', 'PowerShell', '开发环境']
category: '技术'
mathjax: false
mermaid: false
draft: false
toc: true
donate: true
comment: true
---

## 先说我的推荐方案

在 Windows 上安装 mise，首先要分清两层“安装目录”：

1. **`mise.exe` 本体放在哪里**，由 Scoop、WinGet、Chocolatey 或手动安装方式决定。
2. **mise 管理的 Node、Java、Python、Go 等工具放在哪里**，由 `MISE_DATA_DIR` 等环境变量决定。

这两层互不冲突。完全可以让 Scoop 把 `mise.exe` 留在 C 盘，同时让 mise 把以后安装的开发工具全部放到 D 盘。

对普通 Windows 用户，我更推荐下面这套组合：

```text
Scoop 管理 mise.exe 的安装和升级
        +
MISE_DATA_DIR 指向 D:\dev\mise\data
        +
D:\dev\mise\data\shims 放到用户 PATH 前面
```

这样做的好处是：

- mise 本体继续由包管理器维护，安装、升级和卸载都比较省心。
- Node、Java、Python、Go 这些真正占空间的工具放到 D 盘。
- `installs`、`plugins` 和 `shims` 仍然在同一个 data 目录里，不容易分散。
- 不需要为了移动 mise 的工具目录，把整个 Scoop 或 WinGet 一起折腾到 D 盘。

如果要求连 `mise.exe` 本体也必须放到 D 盘，我更建议直接下载 GitHub Release 手动安装。它对目录的控制最直接，只是后续升级和 PATH 都要自己维护。

## 一、Windows 中有哪几种安装方式

mise 官方安装文档目前列出了四种 Windows 安装方式：

- Scoop
- WinGet
- Chocolatey
- 手动下载 GitHub Release

它们安装的是同一个 mise，但本体目录、PATH 管理和升级方式不一样。

| 安装方式 | `mise.exe` 由谁管理 | PATH 处理 | 自定义本体目录 | 推荐场景 |
| --- | --- | --- | --- | --- |
| Scoop | Scoop | Scoop 通过自己的 shim 暴露 `mise` 命令 | 需要在安装 Scoop 时决定 Scoop 根目录 | Windows 首选 |
| WinGet | WinGet portable 包 | 当前 manifest 注册 `mise` 和 `mise-shim` 命令别名 | `--location` 只有受支持时才生效 | 已经统一使用 WinGet |
| Chocolatey | Chocolatey | 取决于 Chocolatey 包 | 取决于包行为 | 不建议新装，官方提示包可能过时 |
| GitHub Release | 自己 | 自己把目录加入 PATH | 最自由 | 必须精确控制 D 盘目录 |

> 这里的安装方式只决定 mise 本体怎么安装，不会自动决定 Node、Java 等工具以后放在哪里。

### 1. 使用 Scoop 安装：普通用户首选

如果电脑已经安装 Scoop，直接执行：

```powershell
scoop install mise
```

安装后验证：

```powershell
mise --version
Get-Command mise | Select-Object Source
where.exe mise
```

mise 官方把 Scoop 作为 Windows 的推荐安装方式。Scoop 会把 `mise` 命令注册到它自己的 shim 目录中，所以一般不需要手动给 `mise.exe` 配 PATH。

常见结果可能类似：

```text
C:\Users\你的用户名\scoop\shims\mise.exe
```

这里的 `scoop\shims\mise.exe` 是 **Scoop 的 shim**，作用是让 Windows 找到 mise 本体。它和后面要讲的 `MISE_DATA_DIR\shims\node.exe` 不是一回事。

当前 Scoop 的 mise manifest 主要负责下载、校验和注册 `mise.exe`，不会替我们设置 `MISE_DATA_DIR`、`MISE_CACHE_DIR` 等 mise 数据目录变量。所以即使使用 Scoop 安装，仍然可以单独把 mise 管理的工具放到 D 盘。

Scoop 安装的 mise，升级和卸载也交给 Scoop：

```powershell
scoop update mise
scoop uninstall mise
```

#### 如果电脑还没有 Scoop

Scoop 官方安装器默认安装到：

```text
C:\Users\你的用户名\scoop
```

通常在非管理员 PowerShell 中安装：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

然后再安装 mise：

```powershell
scoop install mise
```

#### 如果希望 Scoop 本身也装到 D 盘

这个决定最好在**第一次安装 Scoop 之前**完成。为了只影响 Scoop 安装过程，可以按 Scoop 官方安装器的参数方式指定目录：

```powershell
irm get.scoop.sh -OutFile "install.ps1"
.\install.ps1 -ScoopDir "D:\Scoop"
scoop install mise
Remove-Item ".\install.ps1"
```

也可以在运行安装器的当前 PowerShell 会话中设置 `SCOOP`：

```powershell
$env:SCOOP = "D:\Scoop"
irm get.scoop.sh | iex
scoop install mise
```

第二种写法中的 `$env:SCOOP` 只是在当前 PowerShell 会话里给安装器传入目录；实际 Scoop 安装结果仍应通过 `scoop config` 和 `where.exe scoop` 检查。

需要注意，这会改变整个 Scoop 的根目录，不只是 mise。以后 Scoop 管理的其他软件也会受到影响。

如果 Scoop 已经安装并管理了很多软件，不建议只为了移动 mise 本体，临时去迁移整个 Scoop。更简单的做法还是：Scoop 留在原位置，只通过 `MISE_DATA_DIR` 把 mise 管理的开发工具放到 D 盘。

### 2. 使用 WinGet 安装

Windows 10/11 通常已经带有 WinGet，可以执行：

```powershell
winget install --id jdx.mise -e
```

`-e` 表示精确匹配包 ID，避免命中名字相近的其他包。

安装后同样要检查：

```powershell
mise --version
Get-Command mise | Select-Object Source
where.exe mise
```

当前 WinGet 的 `jdx.mise` manifest 使用官方 Windows ZIP，类型是 portable，并注册了下面两个命令别名：

```text
mise
mise-shim
```

所以 WinGet 管理的是 mise 本体和命令别名，而不是 `MISE_DATA_DIR` 里的工具数据。

升级和卸载可以继续使用 WinGet：

```powershell
winget upgrade --id jdx.mise -e
winget uninstall --id jdx.mise -e
```

#### WinGet 能不能直接指定 D 盘

WinGet 提供了 `--location` 参数：

```powershell
winget install --id jdx.mise -e --location "D:\dev\mise-bin"
```

但 Microsoft 文档对这个参数的说明是“如果安装器支持”。也就是说，不能只看到命令执行完成，就认定 mise 一定安装到了指定目录。

执行后必须检查实际结果：

```powershell
Get-Command mise | Select-Object Source
where.exe mise
```

如果最关心的是本体目录必须百分之百可控，手动下载 Release 会比依赖 `--location` 更直接。

### 3. 使用 Chocolatey 安装

命令是：

```powershell
choco install mise
```

不过，mise 官方安装页明确提醒 Chocolatey 包可能过时，所以这里知道有这种方式就行，不建议把它作为新安装的首选。

如果公司环境只允许 Chocolatey，安装后一定要先检查实际版本：

```powershell
mise --version
```

### 4. 手动下载 GitHub Release

手动安装最适合下面这种需求：

```text
我明确要求 mise.exe 本体也放在 D 盘
我不想让 Scoop 或 WinGet 决定它的位置
我可以接受自己维护升级和 PATH
```

先到 mise 官方 GitHub Releases，下载与系统架构对应的 Windows 包：

```text
mise-v<版本号>-windows-x64.zip
mise-v<版本号>-windows-arm64.zip
```

普通 Intel、AMD Windows 电脑通常选 `x64`，Windows on ARM 设备才选 `arm64`。

当前 Release ZIP 中的 Windows 可执行文件位于类似下面的目录结构中：

```text
mise
└─ bin
   ├─ mise.exe
   └─ mise-shim.exe
```

可以把整个目录解压到：

```text
D:\dev\mise-bin
```

假设最终的可执行文件目录是：

```text
D:\dev\mise-bin\mise\bin
```

就把这个 `bin` 目录加入用户 PATH，而不是只记住 ZIP 解压目录。

如果 Windows 把下载的文件标记为来自网络，可以解除阻止：

```powershell
Get-ChildItem "D:\dev\mise-bin" -Recurse -File | Unblock-File
```

然后验证：

```powershell
mise --version
Get-Command mise | Select-Object Source
where.exe mise
```

手动安装的版本可以按官方安装页的说明尝试：

```powershell
mise self-update
```

也可以重新下载新版 Release，替换原来的文件。

手动安装最容易出现的问题是电脑里同时留着 Scoop、WinGet 和手动版 mise。每次升级前后都应该执行：

```powershell
where.exe mise
```

如果出现多个路径，排在第一位的才是当前真正执行的版本。

## 二、安装后先分清这些目录

刚安装完 mise 时，最容易把下面几个位置混在一起：

- `mise.exe` 本体目录
- mise 的 data 目录
- 工具实际安装目录 `installs`
- 命令代理目录 `shims`
- cache、config 和 state 目录

它们的关系可以先记成：

```text
包管理器或手动目录
└─ mise.exe                  # mise 本体

MISE_DATA_DIR
├─ installs                  # Node、Java、Python、Go 等真实工具
├─ shims                     # node.exe、npm.exe 等命令代理
└─ 其他 mise 数据            # 内部结构可能随版本变化

MISE_CACHE_DIR                # 可以重新生成的缓存
MISE_CONFIG_DIR               # 全局配置
MISE_STATE_DIR                # mise 自己维护的状态
```

### 1. 查看 mise 本体路径

```powershell
Get-Command mise | Select-Object Source
where.exe mise
```

这里查到的是 PATH 中的 mise 命令入口，不是 Node、Java 等工具的安装位置。

如果 `where.exe mise` 返回多个结果，Windows 会优先使用排在最前面的那个。

### 2. Windows 下的默认目录

按照 mise 当前源码中的目录解析规则，在没有显式设置相关环境变量时，Windows 常见默认值如下：

| 内容 | 默认路径 | 可直接覆盖的变量 |
| --- | --- | --- |
| data 数据目录 | `%LOCALAPPDATA%\mise` | `MISE_DATA_DIR` |
| cache 缓存目录 | `%TEMP%\mise` | `MISE_CACHE_DIR` |
| config 配置目录 | `$HOME\.config\mise` | `MISE_CONFIG_DIR` |
| state 状态目录 | `$HOME\.local\state\mise` | `MISE_STATE_DIR` |
| 工具安装目录 | `MISE_DATA_DIR\installs` | `MISE_INSTALLS_DIR` |
| shims 目录 | `MISE_DATA_DIR\shims` | `MISE_SHIMS_DIR` |

假设用户名是 `demo`，常见路径可能是：

```text
C:\Users\demo\AppData\Local\mise
C:\Users\demo\AppData\Local\Temp\mise
C:\Users\demo\.config\mise
C:\Users\demo\.local\state\mise
```

这里还有一层 XDG 环境变量的回退规则：

- `XDG_DATA_HOME` 会影响默认 data 目录。
- `XDG_CACHE_HOME` 会影响默认 cache 目录。
- `XDG_CONFIG_HOME` 会影响默认 config 目录。
- `XDG_STATE_HOME` 会影响默认 state 目录。

一般 Windows 用户没有单独配置 XDG，可以先按上面的常见默认路径理解。如果已经设置过 XDG，mise 的实际目录可能会不同。

### 3. 为什么 `$env:MISE_DATA_DIR` 可能是空的

执行：

```powershell
$env:MISE_DATA_DIR
$env:MISE_CACHE_DIR
$env:MISE_CONFIG_DIR
$env:MISE_STATE_DIR
```

没有输出，只能说明自己没有显式设置这些变量，**不代表 mise 没有默认目录**。

mise 会按内部回退规则计算最终路径。例如 `MISE_DATA_DIR` 没有设置时，通常仍然会使用：

```text
%LOCALAPPDATA%\mise
```

所以不能用“环境变量输出为空”来判断 mise 没有数据目录。

可以结合这些命令检查：

```powershell
mise doctor
mise cache path
mise config ls
```

安装过某个工具后，还可以直接查看工具实际位置：

```powershell
mise where node
mise which node
```

`mise where node` 更偏向工具安装目录，`mise which node` 显示当前上下文最终会执行的二进制文件。

## 三、这些环境变量分别有什么作用

### 1. `MISE_DATA_DIR`：最重要的数据根目录

它决定 mise 管理数据的主位置，最重要的两个派生目录是：

```text
MISE_DATA_DIR
├─ installs
└─ shims
```

例如：

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_DATA_DIR",
    "D:\dev\mise\data",
    "User"
)
```

那么默认关系就会变成：

```text
工具安装目录：D:\dev\mise\data\installs
shims 目录：D:\dev\mise\data\shims
```

如果目标只是把 Node、Java、Python、Go 这些工具挪到 D 盘，优先设置这个变量就行。

### 2. `MISE_INSTALLS_DIR`：单独覆盖工具安装目录

默认情况下：

```text
MISE_INSTALLS_DIR = MISE_DATA_DIR\installs
```

也可以单独设置：

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_INSTALLS_DIR",
    "D:\dev\mise\installs",
    "User"
)
```

但普通配置不建议同时自定义 `MISE_DATA_DIR` 和 `MISE_INSTALLS_DIR`。这样会让工具和 shims 分散到不同位置，后面排查时反而麻烦。

除非有明确的磁盘布局要求，否则让 `installs` 从 `MISE_DATA_DIR` 自动派生更简单。

### 3. `MISE_SHIMS_DIR`：单独覆盖 shims 目录

默认情况下：

```text
MISE_SHIMS_DIR = MISE_DATA_DIR\shims
```

它同样可以单独覆盖，但通常没有必要。只要设置好 `MISE_DATA_DIR`，再把派生出来的 `data\shims` 放到 PATH 即可。

### 4. `MISE_CACHE_DIR`：可重新生成的缓存

缓存可能包含下载缓存、元数据和临时解析结果：

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_CACHE_DIR",
    "D:\dev\mise\cache",
    "User"
)
```

官方说明中提到，这个目录在 mise 没有运行时可以删除，让 mise 重新生成。

它不等于工具安装目录。删除 cache 不应该被当成卸载 Node、Java 等工具的方式。

### 5. `MISE_CONFIG_DIR`：全局配置目录

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_CONFIG_DIR",
    "D:\dev\mise\config",
    "User"
)
```

全局配置文件通常会在类似下面的位置：

```text
D:\dev\mise\config\config.toml
```

这里保存的是配置规则，不是工具本体。

### 6. `MISE_STATE_DIR`：mise 的内部状态目录

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_STATE_DIR",
    "D:\dev\mise\state",
    "User"
)
```

这个目录由 mise 自己维护，一般不需要手动编辑里面的内容。

可以把几个目录简单记成：

```text
data    = 工具、插件、shims 等主要数据
installs= 真实工具
shims   = 命令代理
cache   = 可重新生成的缓存
config  = 自己写的全局配置
state   = mise 自己维护的状态
```

## 四、推荐的 D 盘配置：只迁移 mise 数据

这是我更推荐的做法：

```text
mise.exe 继续交给 Scoop 或 WinGet
Node、Java、Python、Go 等工具放到 D 盘
```

### 1. 规划目录

可以使用下面的结构：

```text
D:\dev\mise
├─ data
│  ├─ installs
│  └─ shims
├─ cache
├─ config
└─ state
```

其中 `installs` 和 `shims` 不需要提前创建，mise 使用时会在 data 目录下面生成。这里只需要先创建根目录：

```powershell
New-Item -ItemType Directory -Force "D:\dev\mise\data"
New-Item -ItemType Directory -Force "D:\dev\mise\cache"
New-Item -ItemType Directory -Force "D:\dev\mise\config"
New-Item -ItemType Directory -Force "D:\dev\mise\state"
```

`D:\Dev` 和 `D:\dev` 在默认 NTFS 文件系统中通常指向同一个目录，因为 Windows 路径一般不区分大小写，但会保留输入时的大小写。

我习惯统一使用小写 `D:\dev`，主要是为了和 Linux、macOS、WSL 中的开发目录风格接近，脚本里也不容易一会儿写 `Dev`、一会儿写 `dev`。

### 2. 最小配置：只设置 data 和 cache

普通用户可以先只设置：

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_DATA_DIR",
    "D:\dev\mise\data",
    "User"
)

[Environment]::SetEnvironmentVariable(
    "MISE_CACHE_DIR",
    "D:\dev\mise\cache",
    "User"
)
```

这样真正占空间的工具、插件、shims 和缓存都会离开默认目录。

config 和 state 文件通常不会像多版本 JDK、Node 那样占很多空间。如果只是为了节省 C 盘，没有必要为了“看起来都在一起”，强行把所有目录都改掉。

### 3. 完整配置：config 和 state 也放 D 盘

如果希望 mise 相关目录全部集中管理，再补充：

```powershell
[Environment]::SetEnvironmentVariable(
    "MISE_CONFIG_DIR",
    "D:\dev\mise\config",
    "User"
)

[Environment]::SetEnvironmentVariable(
    "MISE_STATE_DIR",
    "D:\dev\mise\state",
    "User"
)
```

完整配置就是：

```powershell
[Environment]::SetEnvironmentVariable("MISE_DATA_DIR", "D:\dev\mise\data", "User")
[Environment]::SetEnvironmentVariable("MISE_CACHE_DIR", "D:\dev\mise\cache", "User")
[Environment]::SetEnvironmentVariable("MISE_CONFIG_DIR", "D:\dev\mise\config", "User")
[Environment]::SetEnvironmentVariable("MISE_STATE_DIR", "D:\dev\mise\state", "User")
```

这里使用的是 `User`，代表当前用户级环境变量，不需要为了这个配置去改整台电脑的系统变量。

除非所有 Windows 用户都要共用这套 mise，否则不建议改成 `Machine`。系统级变量需要管理员权限，也更容易影响其他账号。

### 4. 为什么默认不设置 `MISE_INSTALLS_DIR` 和 `MISE_SHIMS_DIR`

设置 `MISE_DATA_DIR` 后，mise 默认会自动得到：

```text
MISE_INSTALLS_DIR = D:\dev\mise\data\installs
MISE_SHIMS_DIR    = D:\dev\mise\data\shims
```

这样工具、插件和命令入口都放在同一个 data 目录下面，结构最容易理解。

如果又把 `MISE_INSTALLS_DIR` 指到别处、把 `MISE_SHIMS_DIR` 指到第三个位置，后面查看目录、迁移数据和排查 PATH 时都更麻烦。

### 5. 把新的 shims 目录放到用户 PATH 前面

修改 `MISE_DATA_DIR` 后，shims 路径也跟着变成：

```text
D:\dev\mise\data\shims
```

可以使用下面的 PowerShell 配置用户 PATH。这段代码会先移除完全相同的旧条目，再把 shims 放到最前面，重复执行也不会一直新增相同路径：

```powershell
$shim = "D:\dev\mise\data\shims"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

$entries = @(
    $userPath -split ";" |
    Where-Object {
        -not [string]::IsNullOrWhiteSpace($_) -and $_ -ine $shim
    }
)

$newUserPath = (@($shim) + $entries) -join ";"
[Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
```

只把 `shims` 放进 PATH，不要把下面这个真实工具目录直接放进去：

```text
D:\dev\mise\data\installs
```

真实工具目录里会同时存在多个版本，直接加入 PATH 会绕开 mise 的版本选择机制。

### 6. 重新打开所有终端和 IDE

`[Environment]::SetEnvironmentVariable(..., "User")` 修改的是以后启动的新进程环境，当前 PowerShell 不会自动刷新。

配置完成后，需要重新打开：

- PowerShell
- Windows Terminal
- VS Code
- IntelliJ IDEA
- 其他会调用 Node、Java、Python 的终端或 IDE

如果只关闭当前标签页，外层程序仍然是旧进程，也可能继续拿到旧 PATH。最稳妥的方式是把终端和 IDE 完全退出后重新启动。

### 7. 安装一个工具验证

重新打开 PowerShell 后，先检查：

```powershell
$env:MISE_DATA_DIR
$env:MISE_CACHE_DIR
where.exe mise
mise doctor
```

然后以 Node 22 为例：

```powershell
mise use -g node@22
```

再检查：

```powershell
where.exe node
mise which node
mise where node
node -v
```

理想关系应该是：

```text
where.exe node
→ D:\dev\mise\data\shims\node.exe

mise which node
→ D:\dev\mise\data\installs\node\22.x.x\node.exe

mise where node
→ D:\dev\mise\data\installs\node\22.x.x
```

具体版本号会随安装时间变化，但入口和真实工具的目录层次应该保持这个关系。

## 五、如果 `mise.exe` 本体也必须放到 D 盘

### 方案 1：手动安装 Release，目录最可控

可以规划成：

```text
D:\dev\mise-bin\mise\bin\mise.exe
D:\dev\mise-bin\mise\bin\mise-shim.exe
D:\dev\mise\data\installs
D:\dev\mise\data\shims
```

其中：

- `D:\dev\mise-bin\mise\bin` 加入 PATH，用来找到 mise 本体。
- `D:\dev\mise\data\shims` 也加入 PATH，并放在旧 Node、Java 等路径前面。
- `MISE_DATA_DIR` 指向 `D:\dev\mise\data`。

这两个 PATH 项的职责不同：

```text
mise-bin\...\bin 负责找到 mise.exe
mise\data\shims 负责找到 node.exe、java.exe、python.exe 等代理命令
```

手动方式的优点是路径完全由自己决定，缺点是升级和文件维护也完全由自己负责。

### 方案 2：把整个 Scoop 根目录放到 D 盘

如果还没有安装 Scoop，可以在第一次安装时直接使用 Scoop 安装器的目录参数：

```powershell
irm get.scoop.sh -OutFile "install.ps1"
.\install.ps1 -ScoopDir "D:\Scoop"
scoop install mise
Remove-Item ".\install.ps1"
```

也可以只在当前 PowerShell 会话中设置 `$env:SCOOP`，再运行安装器：

```powershell
$env:SCOOP = "D:\Scoop"
irm get.scoop.sh | iex
scoop install mise
```

最后可能形成类似：

```text
D:\Scoop\apps\mise\...
D:\Scoop\shims\mise.exe
```

但这不是“只把 mise 放 D 盘”，而是“把整个 Scoop 生态放 D 盘”。以后 Scoop 安装的其他软件也会放在这个根目录里。

### 方案 3：WinGet 的 `--location`

可以尝试：

```powershell
winget install --id jdx.mise -e --location "D:\dev\mise-bin"
```

但它是否使用指定位置，取决于 WinGet 和当前 manifest 对 portable 包的处理。执行完一定要检查：

```powershell
Get-Command mise | Select-Object Source
where.exe mise
```

如果结果不在预期目录，不要继续凭感觉配置，应该以实际命中路径为准。

## 六、已经用默认目录装过工具，怎么迁移到 D 盘

这里最重要的一点是：

> 设置新的 `MISE_DATA_DIR`，不会自动把旧 `%LOCALAPPDATA%\mise` 里的工具搬到 D 盘。

修改变量并重新打开 PowerShell 后，mise 会开始使用新的 data 目录。原来安装的 Node、Java、Python 还在旧目录中，所以新环境下可能会显示“没有安装”。

### 推荐做法：记录版本后重新安装

在修改目录前先记录当前工具：

```powershell
mise ls
mise ls --current
```

再完成 D 盘环境变量和 PATH 配置，重新打开 PowerShell，根据记录重新安装需要的工具。

这种方式虽然会重新下载，但结构最干净，也不容易把旧缓存、旧 shim 或内部状态一起搬过去。

### 如果确实要复制旧 data 目录

复制前至少做到：

1. 完全退出正在使用 mise 工具的终端和 IDE。
2. 备份旧的 `%LOCALAPPDATA%\mise`。
3. 把旧 data 内容复制到新的 `D:\dev\mise\data`。
4. 重新打开 PowerShell。
5. 执行 `mise reshim` 刷新 shims。
6. 逐项验证 `mise ls`、`mise where`、`mise which` 和 `mise doctor`。
7. 确认工具都能正常使用后，再考虑清理旧目录。

不建议一开始就直接删除旧目录。开发工具版本很多时，先保留一段时间会更稳妥。

## 七、shims 到底是什么

### 1. shims 是命令代理，不是工具本体

假设 mise 管理了 Node，它可能在 shims 目录里生成：

```text
D:\dev\mise\data\shims\node.exe
D:\dev\mise\data\shims\npm.exe
D:\dev\mise\data\shims\npx.exe
```

这些不是完整的 Node 或 npm，而是很小的命令代理。真正的 Node 会在：

```text
D:\dev\mise\data\installs\node\22.x.x\node.exe
```

### 2. 执行 `node -v` 时发生了什么

```text
PowerShell 收到 node -v
        ↓
Windows 按 PATH 顺序寻找 node.exe
        ↓
先找到 D:\dev\mise\data\shims\node.exe
        ↓
shim 把请求交给 mise
        ↓
mise 读取当前目录及上级目录的配置
        ↓
mise 判断应该使用哪个 Node 版本
        ↓
mise 调用 installs 目录中的真实 node.exe
```

对外一直是同一个 `node` 命令，真正执行哪个版本，则由 mise 根据当前上下文决定。

### 3. Scoop shim 和 mise tool shim 不要混淆

这两个路径名字里都有 `shims`，但职责不同：

| 路径示例 | 谁创建 | 作用 |
| --- | --- | --- |
| `C:\Users\demo\scoop\shims\mise.exe` | Scoop | 让 Windows 找到 mise 本体 |
| `D:\dev\mise\data\shims\node.exe` | mise | 让 mise 为 Node 选择版本 |
| `D:\dev\mise\data\installs\node\22.x.x\node.exe` | mise 安装工具时创建 | 真正执行的 Node |

所以 `where.exe mise` 和 `where.exe node` 查的是两种不同入口。

### 4. 为什么 shims 要放到 PATH 前面

假设系统里以前还装过 Node：

```text
D:\Program Files\nodejs\node.exe
```

如果这个路径排在 mise shims 前面，执行 `node` 时 Windows 会先找到旧 Node，mise 根本没有机会参与版本选择。

检查顺序：

```powershell
where.exe node
```

理想情况下，第一项应该是：

```text
D:\dev\mise\data\shims\node.exe
```

后面即使还有旧 Node 路径，第一项仍然决定了普通命令优先使用哪个版本。不过为了避免误操作，确认 mise 运行稳定后，也可以清理不再需要的旧 Node PATH。

### 5. `where.exe`、`mise which` 和 `mise where` 的区别

```powershell
where.exe node
```

查看 Windows 按 PATH 能找到哪些 `node.exe`，通常首先看到 shim。

```powershell
mise which node
```

查看 mise 根据当前目录最终选择的真实 `node.exe`。

```powershell
mise where node
```

查看当前 Node 工具版本的安装目录。

工具安装、升级或删除后，mise 通常会自动刷新 shims。如果发现 shim 不完整，可以手动执行：

```powershell
mise reshim
```

## 八、全局版本和项目版本怎么切换

先设置全局 Node 版本：

```powershell
mise use -g node@22
```

再进入某个项目，设置项目版本：

```powershell
cd D:\workspace\demo
mise use node@20
```

可能同时存在两个真实 Node：

```text
D:\dev\mise\data\installs\node\22.x.x\node.exe
D:\dev\mise\data\installs\node\20.x.x\node.exe
```

但 PATH 中只需要一个统一入口：

```text
D:\dev\mise\data\shims\node.exe
```

在普通目录执行 `node -v`，mise 可能选择全局 Node 22；进入带有项目 `mise.toml` 的目录后，再执行同一个命令，mise 会选择项目要求的 Node 20。

这就是 shims 最重要的意义：

```text
命令名不变
PATH 不用跟着每个项目反复修改
真正使用的版本由当前目录配置决定
```

## 九、PowerShell 中需要配置 `mise activate` 吗

### 1. 只管理工具版本，先用 shims

在 native Windows 上，如果需求只是管理 Node、Java、Python、Go 等工具版本，正确配置 shims PATH 通常就够了。

```text
mise.toml 中的 [tools]
        ↓
shim 读取当前项目上下文
        ↓
选择对应的真实工具版本
```

这条路径不要求把 `mise activate pwsh` 当成安装后的必做步骤。

### 2. `mise.toml` 还可以配置项目环境变量

例如：

```toml
[tools]
node = "22"

[env]
APP_ENV = "dev"
API_BASE_URL = "http://localhost:8080"
JAVA_OPTS = "-Xmx2g"
```

这里分成两类：

```text
[tools] = 这个项目要使用什么工具版本
[env]   = 执行项目命令时需要什么环境变量
```

只配置 shims 后，下面的命令可以根据项目选择 Node：

```powershell
cd D:\workspace\demo
node -v
```

但不能据此认定 `[env]` 已经自动写进当前 PowerShell：

```powershell
$env:APP_ENV
$env:API_BASE_URL
```

它们可能仍然是空的。

### 3. native Windows 下使用 `mise x` 或 `mise run`

截至本文整理时间，mise 官方 FAQ 对 native Windows 的说明是：Windows 主要依赖 shims，`mise.toml` 中的环境变量不会自动进入当前 shell，需要通过 `mise x` 或 `mise run` 使用。

例如，让一个新的 PowerShell 子进程读取项目变量：

```powershell
mise x -- powershell -NoProfile -Command '$env:APP_ENV'
```

预期输出：

```text
dev
```

也可以让项目任务在 mise 准备好的工具和环境变量中运行：

```powershell
mise run <任务名>
```

要注意，这两种方式是在**子进程或任务环境**中提供变量，不是修改当前这个 PowerShell 进程的 `$env:`。

### 4. 为什么不把 `mise activate pwsh` 作为本文主方案

mise 的 getting started 文档列出了 PowerShell activation 形式：

```powershell
(&mise activate pwsh) | Out-String | Invoke-Expression
```

通常会把它放进 `$PROFILE`。不过，官方 FAQ 同时保留了 native Windows 目前主要依赖 shims、PowerShell 支持仍有限的说明，这两处文档的表述并不完全一致，而且行为可能继续随版本变化。

所以本文采用更稳妥的边界：

- 工具版本：使用 shims。
- 项目 `[env]`：使用 `mise x` 或 `mise run`。
- `mise activate pwsh`：如果当前安装版本支持，并且 `mise doctor` 或官方最新文档明确建议，再作为可选 shell 集成测试，不把它当成 D 盘目录配置或 `[env]` 注入的保证。

无论是否使用 activate，它都不会替你修改 `MISE_DATA_DIR`，也不会把 `mise.exe` 自动搬到 D 盘。

## 十、按需求选择最简单的方案

| 需求 | 推荐做法 |
| --- | --- |
| 只想在 Windows 安装并使用 mise | Scoop |
| 已经统一使用 WinGet 管理软件 | WinGet，安装后检查实际命中路径 |
| 公司只能使用 Chocolatey | 可以安装，但先检查包版本 |
| 必须精确控制 `mise.exe` 的 D 盘路径 | 手动下载 GitHub Release |
| 只想把 Node、Java 等工具放到 D 盘 | 保留包管理器安装的 mise，设置 `MISE_DATA_DIR` |
| 还想把缓存放到 D 盘 | 再设置 `MISE_CACHE_DIR` |
| 想把所有 mise 配置集中在 D 盘 | 再设置 `MISE_CONFIG_DIR` 和 `MISE_STATE_DIR` |
| 想让项目自动选择工具版本 | 把 mise shims 放到 PATH 前面 |
| 想在某条命令中使用项目 `[env]` | `mise x -- <命令>` |
| 想让项目任务使用 `[env]` | `mise run <任务名>` |
| 想把 Scoop 管理的 mise 本体也放 D 盘 | 安装 Scoop 前设置 Scoop 根目录，注意会影响所有 Scoop 应用 |

一句话记忆：

```text
安装方式决定 mise.exe 在哪里
MISE_* 决定 mise 数据、缓存、配置和状态在哪里
MISE_DATA_DIR\shims 决定工具命令如何进入 PATH
mise.toml [tools] 通过 shims 参与版本选择
mise.toml [env] 在 native Windows 下优先通过 mise x 或 mise run 使用
```

## 十一、从零开始的完整推荐流程

如果电脑已经装好 Scoop，可以按下面的顺序做：

### 第一步：安装 mise 本体

```powershell
scoop install mise
mise --version
where.exe mise
```

### 第二步：创建 D 盘目录

```powershell
New-Item -ItemType Directory -Force "D:\dev\mise\data"
New-Item -ItemType Directory -Force "D:\dev\mise\cache"
```

### 第三步：设置用户级目录变量

```powershell
[Environment]::SetEnvironmentVariable("MISE_DATA_DIR", "D:\dev\mise\data", "User")
[Environment]::SetEnvironmentVariable("MISE_CACHE_DIR", "D:\dev\mise\cache", "User")
```

### 第四步：把新的 shims 放到用户 PATH 前面

为了让node，java，python等优先进入 mise 的 shim，再由 mise 根据全局或项目配置选择真正的软件版本

```powershell
$shim = "D:\dev\mise\data\shims"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

$entries = @(
    $userPath -split ";" |
    Where-Object {
        -not [string]::IsNullOrWhiteSpace($_) -and $_ -ine $shim
    }
)

$newUserPath = (@($shim) + $entries) -join ";"
[Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
```

### 第五步：完全退出并重新打开 PowerShell

新窗口中检查：

```powershell
$env:MISE_DATA_DIR
$env:MISE_CACHE_DIR
mise --version
mise doctor
```

### 第六步：安装工具并验证目录

```powershell
mise use -g node@22
where.exe node
mise which node
mise where node
node -v
```

如果结果符合下面的关系，基本就配置好了：

```text
mise.exe        → Scoop 或 WinGet 管理的位置
node.exe 入口   → D:\dev\mise\data\shims\node.exe
真实 Node       → D:\dev\mise\data\installs\node\...
cache           → D:\dev\mise\cache
```

## 十二、常见问题排查

### 1. 安装后提示找不到 `mise`

先执行：

```powershell
where.exe mise
Get-Command mise -ErrorAction SilentlyContinue
```

如果都没有结果，说明 mise 本体目录或包管理器 shim 没有进入 PATH。重新打开终端后仍然无效，再按安装方式检查 Scoop、WinGet 或手动目录。

### 2. `where.exe mise` 出现多个路径

说明电脑里存在多个安装来源，例如 Scoop、WinGet 和手动版本同时存在。

排在第一位的版本会被优先执行。保留一种主要安装方式，会比每次升级后猜到底用了哪个版本更省心。

### 3. `where.exe node` 第一项不是 mise shim

检查用户 PATH 中是否有：

```text
D:\dev\mise\data\shims
```

并确认它排在旧 Node 路径前面。修改 PATH 后要重新打开终端和 IDE。

### 4. 修改 `MISE_DATA_DIR` 后，原来的工具都不见了

这是正常现象。环境变量只改变 mise 接下来使用的数据根目录，不会自动搬运旧工具。

可以根据修改前的 `mise ls` 记录重新安装，也可以备份并复制旧 data，然后执行：

```powershell
mise reshim
mise doctor
```

### 5. `$env:MISE_DATA_DIR` 还是旧值

当前 PowerShell 是在修改用户变量之前启动的。完全关闭当前终端程序，再打开新进程。

如果是 VS Code 或 IDEA 内置终端，需要把整个 IDE 退出后重新打开。

### 6. `mise.toml` 中的 `[env]` 在当前 PowerShell 里为空

native Windows 下不要只依赖 shims 或假定 activate 一定注入当前 shell，直接使用：

```powershell
mise x -- powershell -NoProfile -Command '$env:APP_ENV'
```

或者把操作定义成 mise task，再使用：

```powershell
mise run <任务名>
```

### 7. cache 有问题或占用过大

先关闭使用 mise 的进程，再查看缓存目录：

```powershell
mise cache path
```

cache 可以重新生成，但不要把 data、installs 或 config 当成缓存一起删除。

## 十三、最后的检查清单

```powershell
# mise 本体版本和命中路径
mise --version
Get-Command mise | Select-Object Source
where.exe mise

# 当前会话显式设置的目录变量
$env:MISE_DATA_DIR
$env:MISE_INSTALLS_DIR
$env:MISE_SHIMS_DIR
$env:MISE_CACHE_DIR
$env:MISE_CONFIG_DIR
$env:MISE_STATE_DIR

# 缓存和配置
mise cache path
mise config ls

# Node 的 PATH 入口、真实二进制和安装目录
where.exe node
mise which node
mise where node

# 刷新 shims 和检查整体环境
mise reshim
mise doctor
```

最重要的判断关系只有四条：

1. `mise.exe` 放在哪里，由 Scoop、WinGet、Chocolatey 或手动安装方式决定。
2. 工具本体放在哪里，默认由 `MISE_DATA_DIR\installs` 决定。
3. Windows 执行 `node`、`java`、`python` 时是否先经过 mise，由 shims 在 PATH 中的顺序决定。
4. native Windows 下要使用项目 `[env]`，优先通过 `mise x` 或 `mise run` 给子进程准备环境。

如果只是想把开发工具从 C 盘移到 D 盘，真的不用把事情弄得太复杂：让包管理器继续管 `mise.exe`，自己只管好 `MISE_DATA_DIR` 和 shims PATH，通常已经足够了。

## 补充说明：为什么不同软件里都有 shim

“shim”不是 mise 独有的东西，而是一种通用的软件设计方式。

shim 原本有“垫片、薄垫层”的意思，放到软件里，可以理解成夹在调用者和真实程序之间的一层很薄的代理：

```text
你输入的命令
    ↓
shim 代理
    ↓
真正的程序
```

shim 本身可以是一个很小的 `.exe`、脚本、符号链接或者包装程序。它不负责完成真正的业务，主要负责找到正确的目标，再把参数和执行请求转交过去。

### 为什么不同软件都需要 shim

很多软件都会遇到类似的问题：

- 真实程序的安装路径比较深。
- 软件升级后，真实目录可能变化。
- 同一个工具可能同时安装多个版本。
- 不希望把每个软件的真实目录都塞进 `PATH`。
- 希望用户始终使用一个稳定的命令。

shim 正好可以提供一个固定入口。可以把它想成一个总机：自己只需要拨打固定号码，总机再决定把请求转给谁。

所以 Scoop、mise、pyenv、rbenv、asdf 这些工具都会使用类似机制，只是它们转发命令时解决的问题不同。

### Scoop 的 shim 解决什么问题

Scoop 安装的软件通常放在自己的应用目录里。例如，mise 的真实程序可能位于类似下面的位置：

```text
C:\Users\demo\scoop\apps\mise\current\mise\bin\mise.exe
```

如果每安装一个软件，都把它的真实目录加入 `PATH`，PATH 很快就会变得十分混乱。

所以 Scoop 只需要把一个公共目录加入 PATH：

```text
C:\Users\demo\scoop\shims
```

然后在里面为不同软件生成稳定入口：

```text
C:\Users\demo\scoop\shims\mise.exe
C:\Users\demo\scoop\shims\git.exe
C:\Users\demo\scoop\shims\curl.exe
```

执行：

```powershell
mise --version
```

大致过程是：

```text
PowerShell 执行 mise
        ↓
Windows 在 PATH 中找到 scoop\shims\mise.exe
        ↓
Scoop shim 转发到 apps\mise\current\...\mise.exe
        ↓
真正的 mise 开始执行
```

Scoop 升级 mise 后，真实版本目录可能发生变化，但外面的入口仍然是：

```text
scoop\shims\mise.exe
```

所以用户不用反复修改 PATH。

### mise 的 shim 解决什么问题

mise 面临的是另一个问题：同一个开发工具可能安装了多个版本。

例如：

```text
D:\dev\mise\data\installs\node\20.x.x\node.exe
D:\dev\mise\data\installs\node\22.x.x\node.exe
```

mise 不会把这两个目录都加进 PATH，而是提供一个固定入口：

```text
D:\dev\mise\data\shims\node.exe
```

执行：

```powershell
node -v
```

大致过程是：

```text
PowerShell 执行 node
        ↓
Windows 找到 mise\data\shims\node.exe
        ↓
这个 shim 把请求交给 mise
        ↓
mise 检查当前目录中的 mise.toml
        ↓
决定使用 Node 20 或 Node 22
        ↓
调用 installs 目录中的真实 node.exe
```

所以 mise 的 shim 不只是转发到一个固定位置，它还会根据当前项目动态选择目标版本。

### Scoop shim 和 mise shim 的区别

| 对比项 | Scoop shim | mise shim |
| --- | --- | --- |
| 创建者 | Scoop | mise |
| 示例 | `scoop\shims\mise.exe` | `mise\data\shims\node.exe` |
| 解决的问题 | 找到 Scoop 安装的软件 | 为当前项目选择工具版本 |
| 转发目标 | 通常是当前版本的软件本体 | 可能是多个工具版本中的一个 |
| 是否读取项目配置 | 不读取 | 会根据 `mise.toml` 等配置选择版本 |
| 主要作用 | 隐藏 Scoop 的真实安装目录 | 隐藏工具的真实版本目录 |

可以用一句话记住：

```text
Scoop shim：帮 Windows 找到 mise
mise shim：帮 mise 找到正确版本的 Node、Java、Python
```

### 两层 shim 可以同时存在

使用 Scoop 安装 mise，再让 mise 管理 Node 时，系统中就会同时存在两层 shim：

```text
PowerShell
├─ 执行 mise
│  └─ Scoop shim
│     └─ 真正的 mise.exe
│
└─ 执行 node
   └─ mise shim
      └─ 真正的 Node 20 或 Node 22
```

对应路径可能是：

```text
# 第一层：Scoop 管理 mise 本体
C:\Users\demo\scoop\shims\mise.exe

# 第二层：mise 管理开发工具
D:\dev\mise\data\shims\node.exe

# 最后一层：真正的 Node
D:\dev\mise\data\installs\node\22.x.x\node.exe
```

### shim 和快捷方式有什么区别

可以把 shim 粗略理解成“更聪明的快捷方式”，但它不一定等同于 Windows 的 `.lnk` 快捷方式。

普通快捷方式通常只是固定指向某个文件：

```text
快捷方式 → 固定的程序路径
```

shim 则可以在转发前执行一些逻辑：

```text
shim
├─ 接收命令行参数
├─ 查找配置
├─ 判断当前目录
├─ 选择程序版本
├─ 设置运行环境
└─ 调用真实程序
```

特别是 mise、pyenv 这类版本管理器，它们的 shim 不是简单的固定跳转，而是一个动态分发入口。

### 怎么判断看到的是 shim 还是真实程序

查看 Windows 从 PATH 找到的入口：

```powershell
where.exe mise
where.exe node
```

可能得到：

```text
C:\Users\demo\scoop\shims\mise.exe
D:\dev\mise\data\shims\node.exe
```

这两个都是入口。

查看 mise 最终选择的真实 Node：

```powershell
mise which node
```

可能得到：

```text
D:\dev\mise\data\installs\node\22.x.x\node.exe
```

查看整个工具安装目录：

```powershell
mise where node
```

可能得到：

```text
D:\dev\mise\data\installs\node\22.x.x
```

所以可以这样理解：

```text
where.exe node   → Windows 首先找到了谁
mise which node  → mise 最终执行了谁
mise where node  → 这个工具实际安装在哪里
```

最简洁的定义就是：

> **shim 是一个稳定的命令代理入口，用来隐藏真实程序的位置，必要时还可以根据配置动态选择真正要执行的程序。**

## 参考资料

- [mise 官方安装文档](https://mise.jdx.dev/installing-mise.html)
- [mise Configuration](https://mise.jdx.dev/configuration.html)
- [mise Shims](https://mise.jdx.dev/dev-tools/shims.html)
- [mise FAQ：Windows support](https://mise.jdx.dev/faq.html)
- [mise CLI 文档](https://mise.jdx.dev/cli/)
- [mise 目录默认值源码：src/env.rs](https://github.com/jdx/mise/blob/main/src/env.rs)
- [mise GitHub Releases](https://github.com/jdx/mise/releases)
- [Scoop 的 mise manifest](https://github.com/ScoopInstaller/Main/blob/master/bucket/mise.json)
- [Scoop 官方安装器与自定义目录](https://github.com/ScoopInstaller/Install)
- [WinGet 的 jdx.mise manifests](https://github.com/microsoft/winget-pkgs/tree/master/manifests/j/jdx/mise)
- [Microsoft WinGet install 命令文档](https://learn.microsoft.com/windows/package-manager/winget/install)

> 安装包 manifest、Chocolatey 包状态和 native Windows shell 支持都可能随 mise 版本变化。本文整理于 2026 年 8 月，实际安装时应以官方链接中的当前说明为准。
