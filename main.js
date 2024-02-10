const fs = require("fs");
const path = require("path");
const { shell, dialog, ipcMain } = require("electron");

var configFilePath = "";

var pluginDataDir = path.join(LiteLoader.path.data, "media_local_view");

var sampleConfig = {
  localVideo: true,
  localPic: true,
  macOSBuiltinPreview: true,
};

var nowConfig = {};

function initConfig() {
  fs.writeFileSync(
    configFilePath,
    JSON.stringify(sampleConfig, null, 2),
    "utf-8"
  );
}

function loadConfig() {
  if (!fs.existsSync(configFilePath)) {
    initConfig();
    return sampleConfig;
  } else {
    return JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
  }
}

onLoad();

function onLoad() {
  ipcMain.handle(
    "LiteLoader.media_local_view.getNowConfig",
    async (event, message) => {
      return nowConfig;
    }
  );

  ipcMain.handle(
    "LiteLoader.media_local_view.saveConfig",
    async (event, config) => {
      nowConfig = config;
      fs.writeFileSync(
        configFilePath,
        JSON.stringify(config, null, 2),
        "utf-8"
      );
    }
  );

  if (!fs.existsSync(pluginDataDir)) {
    fs.mkdirSync(pluginDataDir, { recursive: true });
  }
  configFilePath = path.join(pluginDataDir, "config.json");
  nowConfig = loadConfig();

  if (nowConfig.localVideo == null) {
    nowConfig.localVideo = true;
  }
  if (nowConfig.localPic == null) {
    nowConfig.localPic = true;
  }
  if (nowConfig.localPic == null) {
    nowConfig.macOSBuiltinPreview = true;
  }

  fs.writeFileSync(configFilePath, JSON.stringify(nowConfig, null, 2), "utf-8");
}

var mainWindowObjs = [];
function onBrowserWindowCreated(window) {
  window.webContents.on("did-stop-loading", () => {
    //只针对主界面和独立聊天界面生效
    if (
      window.webContents.getURL().indexOf("#/main/message") != -1 ||
      window.webContents.getURL().indexOf("#/chat") != -1 ||
      window.webContents.getURL().indexOf("#/forward") != -1 ||
      window.webContents.getURL().indexOf("#/record") != -1
    ) {
      mainWindowObjs.push(window);

      const ipc_message_proxy =
        window.webContents._events["-ipc-message"]?.[0] ||
        window.webContents._events["-ipc-message"];

      const proxyEvents = new Proxy(ipc_message_proxy, {
        // 拦截函数调用
        apply(target, thisArg, argumentsList) {
          ipc_message(...argumentsList);
          return target.apply(thisArg, argumentsList);
        },
      });
      if (window.webContents._events["-ipc-message"][0]) {
        window.webContents._events["-ipc-message"][0] = proxyEvents;
      } else {
        window.webContents._events["-ipc-message"] = proxyEvents;
      }

      function ipc_message(_, status, name, ...args) {
        try {
          console.log(JSON.stringify(args));
          if (args != null) {
            if (
              args.length == 1 &&
              args[0] != null &&
              args[0].length == 2 &&
              args[0][1] != null &&
              args[0][1].length == 2 &&
              args[0][1][0] == "openMediaViewer" &&
              args[0][1][1] != null
            ) {
              var mediaList = args[0][1][1].mediaList;
              var openedPicIndex = args[0][1][1].index;
              if (mediaList != null && mediaList.length > 0) {
                var picPath = mediaList[openedPicIndex]?.context?.sourcePath;
                if (picPath != null && nowConfig.localPic == true) {
                  localOpen(picPath);
                  args[0].pop();
                }
                var videoPath = mediaList[openedPicIndex]?.context?.video?.path;
                if (videoPath != null && nowConfig.localVideo == true) {
                  localOpen(videoPath);
                  args[0].pop();
                }
              }
            }
          }
        } catch (e) {
          output(
            "NTQQ Image-Local-View Error: ",
            e,
            "Please report this to https://github.com/xh321/LiteLoaderQQNT-Image-Local-View/issues, thank you"
          );
        }
      }

      async function localOpen(path) {
        var openOrPreview = async (path) => {
          if (
            nowConfig.macOSBuiltinPreview == true &&
            process.platform == "darwin"
          ) {
            window.previewFile(path);
          } else {
            var ret = await shell.openPath(path);
            if (ret != "") {
              dialog.showMessageBox({
                type: "error",
                title: "错误",
                message: "打开图片错误，错误原因：" + ret,
                buttons: ["确定"],
              });
            }
          }
        };
        try {
          if (fs.existsSync(path)) {
            await openOrPreview(path);
          } else {
            var interval = setInterval(async () => {
              if (fs.existsSync(path)) {
                clearInterval(interval);
                await openOrPreview(path);
              }
            }, 100);
          }
        } catch (e) {
          output(
            "NTQQ Image-Local-View Error: ",
            e,
            "Please report this to https://github.com/xh321/LiteLoaderQQNT-Image-Local-View/issues, thank you"
          );
        }
      }

      output(
        "NTQQ Image-Local-View for window: " + window.webContents.getURL()
      );
    }
  });
}

function output(...args) {
  console.log("\x1b[32m%s\x1b[0m", "Image-Local-View:", ...args);
}

module.exports = {
  onBrowserWindowCreated,
};
