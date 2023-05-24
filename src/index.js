const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");
const childProcess = require("child_process");

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "Pages", "Main", "index.html"));

  fs.readFile(path.join(__dirname, "Downloader", "config", "cookies.json"), { encoding: "utf-8" }, (err, data) => {
    if (err) { 
      return dialog.showErrorBox("Error", err.message);
    }
    const jsons = JSON.parse(data);

    if (jsons["csrftoken"] === "" || jsons["cf_clearance"] === "") {
      return dialog.showMessageBox({
        type: "question",
        title: "Empty cookies",
        message: "Would you like to set your cookies?",
        buttons: [
          "yes",
          "no"
        ]
      }).then((result) => {
        if (result.response === 0) {
          childProcess.exec(`"${path.join(__dirname, "Downloader", "config", "cookies.json")}"`, (err) => {
            if (err) {
              return dialog.showErrorBox("Error", err.message);
            }
          });
        } else {
          app.quit();
        }
      });
    }
  });

  ipcMain.on("open-cookies", (event) => {
    childProcess.exec(`"${path.join(__dirname, "Downloader", "config", "cookies.json")}"`, (err) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
    });
  });

  ipcMain.on("open-headers", (event) => {
    childProcess.exec(`"${path.join(__dirname, "Downloader", "config", "headers.json")}"`, (err) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
    });
  });

  const errorTxt = path.join(__dirname, "Downloader", "config", "error.txt");

  fs.writeFile(errorTxt, "", { encoding: "utf-8" }, (err) => {
    if (err) {
      return dialog.showErrorBox("Error", err.message);
    }
  });

  fs.watchFile(errorTxt, (curr, prev) => {
    fs.readFile(errorTxt, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }

      dialog.showErrorBox("Error", data);
    });
  });

  const isDownloadingTxt = path.join(__dirname, "Downloader", "config", "isDownloading.txt");

  fs.watchFile(isDownloadingTxt, (curr, prev) => {
    fs.readFile(isDownloadingTxt, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }

      if (data === "true") {
        mainWindow.webContents.send("downloading");
        console.log("Downloading!");
      } else if (data === "false") {
        mainWindow.webContents.send("notDownloading");
        console.log("Not downloading!");
      }
    });
  });

  fs.writeFile(isDownloadingTxt, "false", { encoding: "utf-8" }, (err) => {
    if (err) {
      return dialog.showErrorBox("Error", err.message);
    }
  });

  const downloadPathTxt = path.join(__dirname, "Downloader", "config", "download_path.txt");

  ipcMain.on("download-manga", (event, url) => {
    fs.writeFile(path.join(__dirname, "Downloader", "config", "url.txt"), url, { encoding: "utf-8" }, (err) => {
      if (err) {
        return console.log(err.message);
      }
    });

    fs.readFile(downloadPathTxt, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }

      if (data === "" || data === "None") {
        return dialog.showErrorBox("Error", "Please choose a folder");
      } else {
        childProcess.exec(`downloader.exe`, { cwd: path.join(__dirname, "Downloader") }, (err) => {
          if (err) {
            return dialog.showErrorBox("Error", err.message);
          }
        });
      }
    });
  });

  ipcMain.on("choose-downloadpath", (event) => {
    dialog.showOpenDialog({
      properties: [
        "openDirectory"
      ]
    }).then((result) => {
      if (result.canceled == false) {
        fs.writeFile(path.join(__dirname, "Downloader", "config", "download_path.txt"), result.filePaths[0], { encoding: "utf-8" }, (err) => {
          if (err) {
            return dialog.showErrorBox("Error", err.message);
          }
        });
      }
    });
  });

  fs.watchFile(downloadPathTxt, (curr, prev) => {
    fs.readFile(downloadPathTxt, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }

      if (data === "") {
        mainWindow.webContents.send("downloadPath", "None");
      } else {
        mainWindow.webContents.send("downloadPath", data);
      }
    });
  });

  fs.writeFile(downloadPathTxt, "None", { encoding: "utf-8" }, (err) => {
    if (err) {
      return dialog.showErrorBox("Error", err.message);
    }
  });

  fs.writeFile(path.join(__dirname, "Downloader", "config", "url.txt"), "", { encoding: "utf-8" }, (err) => {
    if (err) {
      return dialog.showErrorBox("Error", err.message);
    }
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});