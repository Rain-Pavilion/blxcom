const url = require('url');
const path = require('path');
const {
  app,
  BrowserWindow
} = require('electron');
const serialport = require('serialport')


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