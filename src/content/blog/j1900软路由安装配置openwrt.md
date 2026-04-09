---
id: "unique-20250918-094414"
title: "j1900软路由安装配置openwrt"
description: ""
date: 2025-09-18 09:44:14
date_updated: 2025-09-18 09:44:14
tags: ["软路由", "openwrt", "j1900"]
category: "技术"
katex: false
pin: false
draft: false
---

### 背景

咸鱼入手了一个 j1900 小主机，打算替代现有的斐讯 n1 盒子，作为软路由。

当前斐讯 n1 作为旁路由，小巧方便，使用起来也可以正常满足我的需求。就是不知道是硬件还是固件的问题。网口速率从千兆掉到百兆。虽然重新插拔一下就能恢复。但是也想更新升级一下。购入了 j1900。

### 网络拓扑

我当前的网络拓扑是，光猫负责拨号，开启 dhcp，ip 是 192.168.1.1.

软路由作为主路由，ip 是 192.168.10.1。开启 dhcp。

硬路由开启 ap 模式，从软路由 lan 口连接到硬路由的 wan 口（wan 口和 lan 都可行。ap 模式下，硬路由类似交换机）。

开启 ap 模式后，硬路由的 ip 通过上级网关分配，当前模式中是软路由分配的。访问之前的静态 ip 是无法访问的。（可以设置一下 lan 口的静态 ip，需要设置跟软路由相同网段，不过要在设置 ap 模式之前）。

![img](https://raw.githubusercontent.com/lamcodes/images/main/img/20250916102334397.png)

### 关于 openwrt 系统的一些介绍。

oepnwrt 是官方系统，比较精简，immortalwrt 是面向中国大陆用户的 openwrt 分支，某些网络代理方面更方便。

我这里选择了 immortalwrt 分支。前往下载官方固件。

j1900 是 x86 64 位架构。选择对应架构，出现许多的版本。还可以自定义插件然后编译。

这里不做自定义编译处理。后面有需要在系统安装。

[ImmortalWrt Firmware Selector](https://firmware-selector.immortalwrt.org/)

在深入了解每个固件之前，先理解以下几个关键概念

> 1. **文件系统类型:**
>    - **`EXT4` (Fourth Extended Filesystem)**：Linux 系统中常用的日志文件系统，读写性能好，支持大容量存储。当 ImmortalWrt 固件使用 EXT4 作为根文件系统时，意味着整个系统是完全可读写的，所有配置和安装的软件包都直接写入到这个文件系统。这与 Flash 存储的路由器上常见的 SquashFS (只读) + JFFS2/UBI (可写叠加层) 机制不同。X86/64 平台通常有足够的存储空间，所以可以使用 EXT4。
>    - **`SQUASHFS` (Squashed Filesystem)**：一种高度压缩的只读文件系统。优点是占用空间小，并且系统文件不易损坏。通常与一个可写的 OverlayFS (如 JFFS2 或 F2FS) 结合使用，即核心系统文件是只读的 SquashFS，用户安装的软件包和配置文件则写入到 OverlayFS 中。当系统文件损坏时，可以恢复到初始的 SquashFS 状态。
> 2. **启动方式:**
>    - **`EFI` (Extensible Firmware Interface) / `UEFI` (Unified Extensible Firmware Interface)**：现代计算机替代 BIOS 的固件接口标准。它支持 GPT 分区表、启动大容量硬盘、更快的启动速度和更丰富的图形界面。对于 X86/64 平台，支持 EFI 启动的设备会使用带 EFI 标识的固件。
>    - **Legacy BIOS (非 EFI)**：传统的 BIOS 启动方式，通常用于较旧的 X86/64 设备。没有 EFI 标识的固件可能更适合非 EFI 的设备。
> 3. **镜像文件格式 (针对虚拟机和硬盘安装):**
>    - **`IMG.GZ` / `IMG`**: 原始磁盘镜像（通常是 MBR 或 GPT 分区的磁盘映像文件），`.GZ` 表示使用 GZIP 压缩。这种格式可以写入到物理硬盘、U 盘或作为虚拟机硬盘镜像使用。
>    - **`QCOW2` (QEMU Copy On Write 2)**：QEMU 虚拟机使用的磁盘映像格式。支持写时复制、快照、压缩等高级功能，非常适合在 KVM 或 QEMU 环境中运行虚拟机。
>    - **`VDI` (Virtual Disk Image)**：VirtualBox 虚拟机使用的磁盘映像格式。
>    - **`VHDX` (Virtual Hard Disk v2)**：Microsoft Hyper-V 虚拟机使用的磁盘映像格式。是 VHD 格式的增强版，支持更大的容量和更好的性能。
>    - **`VMDK` (Virtual Machine Disk)**：VMware Workstation 和 ESXi 等 VMware 产品使用的磁盘映像格式，也受 VirtualBox 等其他虚拟机软件支持。
> 4. **组合性:**
>    - **`COMBINED`**: 表示这个镜像文件是完整的，包含了引导程序（Bootloader）、内核（Kernel）、以及根文件系统（RootFS）等所有启动和运行操作系统所需的部分。可以直接刷写到磁盘或作为虚拟机硬盘使用。
>    - **`COMBINED-EFI`**: 特指支持 EFI 启动的 `COMBINED` 镜像。
> 5. **`ROOTFS` (Root File System)**: 根文件系统，包含操作系统运行所需的所有文件、库、应用程序等。这个列表中的 `ROOTFS (EXT4)` 是一个独立的根文件系统映像。
> 6. **`ISO` (International Organization for Standardization)**:
>    - 通常指 ISO 9660 光盘映像文件格式。它包含一个文件系统的完整快照，可以被刻录到光盘，或者作为虚拟光盘加载。
>    - 在 ImmortalWrt (OpenWrt) 中，`ISO` 文件通常用于**首次安装**。你可以用它制作启动 U 盘或作为虚拟机的光驱启动盘，引导系统进入安装环境，然后将 ImmortalWrt 刷写到硬盘。
> 7. **`SHA256sum`**: 一种加密哈希函数产生的校验和。下载固件后，你可以使用 `sha256sum` 命令计算下载文件的哈希值，然后与页面上提供的哈希值进行比较，以验证文件在下载过程中是否损坏或被篡改，确保完整性和安全性。

先判断启动方式，一般来说比较新的，是都可以支持 efi 启动方法的。

然后选择使用文件类型，ext4 还是 SQUASHFS。再然后选择文件类型。

制作启动 u 盘的话，下载 iso 文件是比较方便的
