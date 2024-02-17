const fs = require("fs");
const path = require("path");
const net = require("net");
const os = require("os");
const exec = require("child_process").exec;
const { shell, dialog, ipcMain, app } = require("electron");

var configFilePath = "";
var pipePath = null;
var pluginDataDir = path.join(LiteLoader.path.data, "media_local_view");

var sampleConfig = {
  localVideo: true,
  localPic: true,
  macOSBuiltinPreview: true,
  windowsQuickLook: false,
};

var nowConfig = {};

function initConfig() {
  if (!fs.existsSync(pluginDataDir)) {
    fs.mkdirSync(pluginDataDir, { recursive: true });
  }
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

function saveConfig() {
  if (!fs.existsSync(configFilePath)) {
    initConfig();
  }
  fs.writeFileSync(configFilePath, JSON.stringify(nowConfig, null, 2), "utf-8");
}

async function useWindowsQuickLookInner(url) {
  return new Promise(async (accept, reject) => {
    //适配Windows QuickLook
    try {
      pipePath =
        process.platform === "win32"
          ? path.join(
              "\\\\.\\pipe\\",
              `QuickLook.App.Pipe.${await getUserSid()}`
            )
          : null;

      if (pipePath != null) {
        pipeClient = net.createConnection(pipePath, () => {
          pipeClient.write(`QuickLook.App.PipeMessages.Toggle|${url}`);
        });
        pipeClient.on("connect", () => {
          output("Windows QuickLook pipe connected");
          accept();
        });
        pipeClient.on("error", (err) => {
          output("Windows QuickLook pipe error occured", err);
          reject(
            "连接 Windows QuickLook 出现错误，请确保它已经在后台运行：" +
              JSON.stringify(err)
          );
        });
        pipeClient.on("close", () => {
          output("Windows QuickLook pipe disconnected");
        });
      } else {
        pipeClient = null;
        nowConfig.windowsQuickLook = false;
        saveConfig();
        reject("仅支持Windows系统");
      }
    } catch (err) {
      output("Windows QuickLook pipe error occured", err);
      pipeClient = null;
      nowConfig.windowsQuickLook = false;
      saveConfig();
      reject(
        "连接 Windows QuickLook 出现错误，请确保它已经在后台运行：" +
          JSON.stringify(err)
      );
    }
  });
}

async function useWindowsQuickLook(url) {
  try {
    await useWindowsQuickLookInner(url);
  } catch (err) {
    app.whenReady().then(() => {
      dialog.showMessageBox({
        type: "error",
        title: "错误",
        message:
          err +
          "。因为出错，已自动关闭 Windows QuickLook 支持，请检查环境后手动重新开启。",
        buttons: ["确定"],
      });
    });
  }
}

async function getUserSid() {
  return new Promise((accept) => {
    exec("whoami /user", (error, stdout, stderr) => {
      accept(stdout.match(/S-\d-\d+-(\d+-){1,14}\d+/)[0]);
    });
  });
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
      saveConfig();
    }
  );

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
          } else if (
            nowConfig.windowsQuickLook == true &&
            process.platform == "win32"
          ) {
            await useWindowsQuickLook(path);
          } else {
            var ret = await shell.openPath(path);
            if (ret != "") {
              dialog.showMessageBox({
                type: "error",
                title: "错误",
                message: "打开图片或视频错误，错误原因：" + ret,
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
