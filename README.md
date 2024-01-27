# LiteLoaderQQNT - media-local-view

LiteLoaderQQNT插件，用于绕过QQ自带的媒体预览，直接用默认图片查看器或视频播放器查看图片或视频
使用前需要安装[LiteLoaderQQNT](https://github.com/mo-jinran/LiteLoaderQQNT)，并在QQNT新版上使用。

## 使用方法

*建议从`LiteLoaderQQNT`应用商店中直接下载安装，方便快捷。*（新版本1.0`LiteLoaderQQNT`没有插件商店了，请遵循下面的手动安装方法）

**手动安装**：请前往[版本发布页面](https://github.com/xh321/LiteLoaderQQNT-Media-Local-View/releases)下载最新版压缩包（`media-local-view.zip`），在`LiteLoaderQQNT数据目录/plugins/`下面新建文件夹（名称任意，建议为插件名称），蒋插件压缩包里的内容解压进去，重启QQNT即可。

**版本不兼容提示**：从0.1.3起，插件已适配1.0版本以上`LiteLoaderQQNT`框架，同时不再兼容旧版框架，请遵循[安装方法](https://liteloaderqqnt.github.io/guide/install.html)更新框架。

**版本提示**：从0.1.6起，配置文件移动了位置（之前的位置是错误的），请在更新本版本后重新配置插件。



直接克隆源码的话，需要手动进行`npm install`。

安装后默认用本地播放器与预览器打开视频与图片。你可以前往QQ的设置界面，对插件进行配置，灵活开启图片与视频的拦截（可以分别设置），设置后即时生效。

注意：方便起见，本插件会修改视频默认打开方式，变为点击一次视频背景就打开视频（而不是双击），好处就是无论是否下载均可点一次就打开。如果你只想要这个功能，而**不需要本地播放器播放**，则去插件设置里把两个选项开关全关闭即可。



## 协议及免责

MIT | 禁止用于任何非法用途，插件开发属学习与研究目的，仅自用，未提供给任何第三方使用。任何不当使用导致的任何侵权问题责任自负。
