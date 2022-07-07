const url = require('url');
const path = require('path');
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain
} = require('electron');
const serialport = require('serialport')

const { autoUpdater } = require('electron-updater');

// 开发环境

let isDev = false;

//  isDev = true;

 // 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win = null;

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 900,
    height: 600,
    show: false, //白屏先隐藏
    webPreferences: {
      // 使用 preload 预加载模块, 可以把 nodeIntegration 禁用掉, 在 preload 阶段是可以访问 node 的,
      // 这样做是因为即使启用了 node, webpack 在进行打包的时候也不会识别 node 模块和 electron 模块,
      // 使用 proload 预加载注入的模块, 参看下方的 preload.js 文件
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: true,

    },
  });

  // 删除菜单
  if(!isDev){
    win.removeMenu();
  }


  console.log(isDev ? 'http://localhost:3000' : url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, 'index.html'),
  }))
  // 加载index.html文件
  win.loadURL(isDev ? 'http://localhost:3000' : url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, 'index.html'),
  }));

  win.on('ready-to-show', () => {
    win.show() //初始化完成后才显示
  })


  // 打开开发者工具
  isDev && win.webContents.openDevTools();



  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null;
  });
}

// 定义返回给渲染层的相关提示文案
const message = {
  error: '检查更新出错',
  checking: '正在检查更新……',
  updateAva: '检测到新版本，正在下载……',
  updateNotAva: '现在使用的就是最新版本，不用更新',
};

// 这里是为了在本地做应用升级测试使用
if (isDev) {
  autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
}

// 主进程跟渲染进程通信
const sendUpdateMessage = (text) => {
  // 发送消息给渲染进程
  win.webContents.send('message', text);
};

// 设置自动下载为false，也就是说不开始自动下载
autoUpdater.autoDownload = false;
// 检测下载错误
autoUpdater.on('error', (error) => {
  sendUpdateMessage(`${message.error}:${error}`);
});
// 检测是否需要更新
autoUpdater.on('checking-for-update', () => {
  sendUpdateMessage(message.checking);
});
// 检测到可以更新时
autoUpdater.on('update-available', () => {
  // 这里我们可以做一个提示，让用户自己选择是否进行更新
  dialog.showMessageBox({
      type: 'info',
      title: '应用有新的更新',
      message: '发现新版本，是否现在更新？',
      buttons: ['是', '否']
  },(response, checkboxChecked) => {
    console.log("update-available",response,checkboxChecked)
    if (response === 0) {
      // 下载更新
      autoUpdater.downloadUpdate();
      sendUpdateMessage(message.updateAva);
    }
  })
  
  // 也可以默认直接更新，二选一即可
  // autoUpdater.downloadUpdate();
  // sendUpdateMessage(message.updateAva);
});
// 检测到不需要更新时
autoUpdater.on('update-not-available', () => {
  // 这里可以做静默处理，不给渲染进程发通知，或者通知渲染进程当前已是最新版本，不需要更新
  sendUpdateMessage(message.updateNotAva);
});
// 更新下载进度
autoUpdater.on('download-progress', (Progress) => {
  // 直接把当前的下载进度发送给渲染进程即可，有渲染层自己选择如何做展示
  win.webContents.send('downloadProgress', Progress);
});
// 当需要更新的内容下载完成后
autoUpdater.on('update-downloaded', () => {
  // 给用户一个提示，然后重启应用；或者直接重启也可以，只是这样会显得很突兀
  dialog.showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
  },(response, checkboxChecked) => {
      console.log("update-downloaded",response,checkboxChecked)
    
      // 退出并安装应用
      setImmediate(() => autoUpdater.quitAndInstall());
  })
});
// 我们需要主动触发一次更新检查
ipcMain.on('checkForUpdate', () => {
  // 当我们收到渲染进程传来的消息，主进程就就进行一次更新检查
  autoUpdater.checkForUpdates();
});
// 当前引用的版本告知给渲染层
// ipcMain.handle('checkAppVersion', async (event, someArgument) => {
//   const result = await doSomeWork(someArgument)
//   return result
// })
ipcMain.on('checkAppVersion', () => {
  console.log('version', app.getVersion())
  win.webContents.send('version', app.getVersion());
});






// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);


// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow();
  }
});