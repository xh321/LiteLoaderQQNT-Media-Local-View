var nowConfig = {};

export async function onSettingWindowCreated(view) {
    nowConfig = await window.media_local_view.getNowConfig();

    const new_navbar_item = `
    <body>
      <div class="config_view">
        <section class="path">
          <h1>主配置</h1>
          <div class="wrap">

            <div class="list">      
              <div class="vertical-list-item">
                <div style="width:90%;" >
                  <h2>是否使用本地查看器预览图片</h2>
                  <span class="secondary-text">打开图片相比自带预览器会有一点延迟。</span>
                </div>
                <div id="switchUseLocalPic" class="q-switch">
                  <span class="q-switch__handle"></span>
                </div>
              </div>

            <hr class="horizontal-dividing-line" />
              <div class="vertical-list-item">
                <div style="width:90%;" >
                  <h2>是否使用本地播放器播放视频</h2>
                  <span class="secondary-text">打开视频相比自带播放器会有一点延迟。</span>
                </div>
                <div id="switchUseLocalVideo" class="q-switch">
                  <span class="q-switch__handle"></span>
                </div>
              </div>

            <hr class="horizontal-dividing-line" />
              <div class="vertical-list-item">
                <div style="width:90%;" >
                  <h2>是否在macOS使用内置quicklook预览</h2>
                  <span class="secondary-text">访达中的空格快速预览，只对macOS有效</span>
                </div>
                <div id="switchUseMacOSBuiltinPreview" class="q-switch">
                  <span class="q-switch__handle"></span>
                </div>
              </div>


            </div>

          </div>
        </section>

        <style>
          .img-hidden {
            display:none;
          }

          .path-input {
            align-self: normal;
            flex: 1;
            border-radius: 4px;
            margin-right: 16px;
            transition: all 100ms ease-out;
          }
        
          .path-input:focus {
            padding-left: 4px;
          }
          
          .bq-icon {
            height:16px;
            width:16px;
          }
          
          /* 通用 */
          .config_view {
              margin: 20px;
          }
          
          .config_view h1 {
              color: var(--text_primary);
              font-weight: var(--font-bold);
              font-size: min(var(--font_size_3), 18px);
              line-height: min(var(--line_height_3), 24px);
              padding: 0px 16px;
              margin-bottom: 8px;
          }
          
          .config_view .wrap {
              /* Linux样式兼容：--fg_white */
              background-color: var(--fill_light_primary, var(--fg_white));
              border-radius: 8px;
              font-size: min(var(--font_size_3), 18px);
              line-height: min(var(--line_height_3), 24px);
              margin-bottom: 20px;
              overflow: hidden;
              padding: 0px 16px;
          }
          
          .config_view .vertical-list-item {
              margin: 12px 0px;
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          
          .config_view .horizontal-dividing-line {
              border: unset;
              margin: unset;
              height: 1px;
              background-color: rgba(127, 127, 127, 0.15);
          }
          
          .config_view .vertical-dividing-line {
              border: unset;
              margin: unset;
              width: 1px;
              background-color: rgba(127, 127, 127, 0.15);
          }
          
          .config_view .ops-btns {
              display: flex;
          }
          
          .config_view .hidden {
              display: none !important;
          }
          
          .config_view .disabled {
              pointer-events: none;
              opacity: 0.5;
          }
          
          .config_view .secondary-text {
              color: var(--text_secondary);
              font-size: min(var(--font_size_2), 16px);
              line-height: min(var(--line_height_2), 22px);
              margin-top: 4px;
          }
          
          .config_view .wrap .title {
              cursor: pointer;
              font-size: min(var(--font_size_3), 18px);
              line-height: min(var(--line_height_3), 24px);
          }
          
          .config_view .wrap .title svg {
              width: 1em;
              height: 1em;
              transform: rotate(-180deg);
              transition-duration: 0.2s;
              transition-timing-function: ease;
              transition-delay: 0s;
              transition-property: transform;
          }
          
          .config_view .wrap .title svg.is-fold {
              transform: rotate(0deg);
          }
          
          
          /* 模态框 */
          .config_view .modal-window {
              display: flex;
              justify-content: center;
              align-items: center;
              position: fixed;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              z-index: 999;
              background-color: rgba(0, 0, 0, 0.5);
          }
          
          .config_view .modal-dialog {
              width: 480px;
              border-radius: 8px;
              /* Linux样式兼容：--fg_white */
              background-color: var(--bg_bottom_standard, var(--fg_white));
          }
          
          .config_view .modal-dialog header {
              font-size: 12px;
              height: 30px;
              line-height: 30px;
              text-align: center;
          }
          
          .config_view .modal-dialog main {
              padding: 0px 16px;
          }
          
          .config_view .modal-dialog main p {
              margin: 8px 0px;
          }
          
          .config_view .modal-dialog footer {
              height: 30px;
              display: flex;
              justify-content: right;
              align-items: center;
          }
          
          .config_view .modal-dialog .q-icon {
              width: 22px;
              height: 22px;
              margin: 8px;
          }
          
          
          /* 版本号 */
          .config_view .versions .wrap {
              display: flex;
              justify-content: space-between;
              padding: 16px 0px;
          }
          
          .config_view .versions .wrap>div {
              flex: 1;
              margin: 0px 10px;
              border-radius: 8px;
              text-align: center;
          }
          
          
          /* 数据目录 */
          .config_view .path .path-input {
              align-self: normal;
              flex: 1;
              border-radius: 4px;
              margin-right: 16px;
              transition: all 100ms ease-out;
          }
          
          .config_view .path .path-input:focus {
              padding-left: 5px;
              background-color: rgba(127, 127, 127, 0.1);
          }
          
          /* 选择框容器 */
          .config_view .list-ctl .ops-selects {
              display: flex;
              gap: 8px;
          }
          

          @media (prefers-color-scheme: light) {
              .text_color {
                  color: black;
              }
          }
          
          @media (prefers-color-scheme: dark) {
              .text_color {
                  color: white;
              }
          }

        </style>
      </div>
    </body>
  `;

    const parser = new DOMParser();

    const doc2 = parser.parseFromString(new_navbar_item, "text/html");
    const node2 = doc2.querySelector("body > div");

    //本地图片开关
    var q_switch_localPic = node2.querySelector("#switchUseLocalPic");

    if (nowConfig.localPic == null || nowConfig.localPic == true) {
        q_switch_localPic.classList.toggle("is-active");
    }

    q_switch_localPic.addEventListener("click", async () => {
        if (q_switch_localPic.classList.contains("is-active")) {
            nowConfig.localPic = false;
        } else {
            nowConfig.localPic = true;
        }
        q_switch_localPic.classList.toggle("is-active");
        await window.media_local_view.saveConfig(nowConfig);
    });

    //本地视频开关
    var q_switch_localVideo = node2.querySelector("#switchUseLocalVideo");

    if (nowConfig.localVideo == null || nowConfig.localVideo == true) {
        q_switch_localVideo.classList.toggle("is-active");
    }

    q_switch_localVideo.addEventListener("click", async () => {
        if (q_switch_localVideo.classList.contains("is-active")) {
            nowConfig.localVideo = false;
        } else {
            nowConfig.localVideo = true;
        }
        q_switch_localVideo.classList.toggle("is-active");
        await window.media_local_view.saveConfig(nowConfig);
    });

    //macOS内置预览开关
    var q_switch_macOSBuiltinPreview = node2.querySelector("#switchUseMacOSBuiltinPreview");

    if (nowConfig.macOSBuiltinPreview == null || nowConfig.macOSBuiltinPreview == true) {
        q_switch_macOSBuiltinPreview.classList.toggle("is-active");
    }

    q_switch_macOSBuiltinPreview.addEventListener("click", async () => {
        if (q_switch_macOSBuiltinPreview.classList.contains("is-active")) {
            nowConfig.macOSBuiltinPreview = false;
        } else {
            nowConfig.macOSBuiltinPreview = true;
        }
        q_switch_macOSBuiltinPreview.classList.toggle("is-active");
        await window.media_local_view.saveConfig(nowConfig);
    });

    view.appendChild(node2);
}

onLoad();

async function onLoad() {
    var observerRendering = false;
    const observer = new MutationObserver(async (mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                if (observerRendering) continue;
                observerRendering = true;
                setTimeout(() => {
                    observerRendering = false;
                    render();
                }, 50);
            }
        }
    });

    var finder = setInterval(() => {
        if (document.querySelector(".ml-list.list")) {
            clearInterval(finder);
            console.log(
                "[Media-Local-View]",
                "检测到聊天区域，已在当前页面加载视频下载辅助"
            );
            const targetNode = document.querySelector(".ml-list.list");
            const config = {
                attributes: false,
                childList: true,
                subtree: true
            };
            observer.observe(targetNode, config);
        }
    }, 100);

    function render() {
        var elements = document
            .querySelector(".chat-msg-area__vlist")
            .querySelectorAll(".msg-preview--video");

        for (var video of elements) {
            let downloadBtn = video.querySelector(".file-progress");
            video.onclick = () => {
                downloadBtn.click();
            };
        }
    }
}
