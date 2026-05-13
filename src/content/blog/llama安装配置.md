---
title: 'llama.cpp Windows CUDA 安装配置'
description: '记录 Windows x64 和 NVIDIA 显卡环境下 llama.cpp CUDA 版本的下载、安装和测试方式'
date: 2026-05-13 00:00:00
tags: ['llama.cpp', 'AI', 'CUDA']
category: '技术'
mathjax: false
mermaid: false
draft: false
toc: true
donate: true
comment: true
---

## llama.cpp 下载和安装备注

这次主要是给 Windows 上的 NVIDIA 显卡装 llama.cpp，先把自己的环境记一下：

```text
Windows x64
RTX 3070
NVIDIA 显卡
8GB VRAM
```

下载 release 的时候，优先选这两个包：

```text
llama-bxxxx-bin-win-cuda-12.4-x64.zip
cudart-llama-bin-win-cuda-12.4-x64.zip
```

第一个是 llama.cpp 的程序本体，里面一般会有这些东西：

```text
llama-cli.exe
llama-server.exe
ggml-cuda.dll
ggml-base.dll
ggml-cpu-*.dll
```

第二个是 CUDA 版本运行时需要的 CUDA runtime DLL。有些电脑已经装了完整 CUDA Toolkit，可能用不到这个包，但是为了少折腾缺 DLL 的问题，还是一起下了比较省心。两个包解压到同一个目录就行。

不要下载这些：

```text
Source code
Windows arm64
Windows x64 CPU
Windows x64 Vulkan
Windows x64 SYCL
Windows x64 HIP
Linux / macOS
CUDA 13，除非 NVIDIA 驱动 >= 580
```

选择时其实就按这个判断：

```text
NVIDIA 显卡 → 选 CUDA
RTX 3070 → 优先 CUDA 12.4
Windows 普通电脑 → 选 x64，不选 arm64
想用 GPU 加速 → 不选 CPU 版
```

安装过程也不用搞复杂：

```text
1. 新建目录：D:\llama-new
2. 把两个 zip 解压到同一个目录
3. 不要混用旧版本 exe / dll
4. 模型文件可以继续放在 D:\llama\models
5. 先测试 llama-cli.exe 和 llama-server.exe 是否正常
```

如果 Windows 把下载文件锁住了，可以用 PowerShell 解除一下：

```powershell
Get-ChildItem D:\llama-new -Recurse -File | Unblock-File
```

然后先测版本，不要上来就直接跑模型：

```powershell
cd D:\llama-new
.\llama-cli.exe --version
.\llama-server.exe --version
```

能正常输出版本后，再跑模型：

```powershell
.\llama-server.exe -m D:\llama\models\Qwen3.5-35B-A3B-Q4_K_M.gguf --reasoning-budget 0
```

最后几个注意点记一下：

```text
同一个 release 的 llama zip 和 cudart zip 要配套使用。
不要把新版 exe 和旧版 ggml-cuda.dll 混在一起。
Latest 不是 LTS，只是最新版；出问题可以回退前一个 bxxxx 版本。
```
