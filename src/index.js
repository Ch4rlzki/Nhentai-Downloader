const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require("fs");
const childProcess = require("child_process");
const axios = require("axios").default;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    title: "Nhentai Downloader by Charlzk",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "Pages", "Main", "index.html"));

  const cookiesJson = path.join(__dirname, "Downloader", "config", "cookies.json");
  const headersJson = path.join(__dirname, "Downloader", "config", "headers.json");

  var cookies;
  var headers;

  fs.readFile(cookiesJson, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      return dialog.showErrorBox("Error", err.message);
    }
  
    const jsons = JSON.parse(data);
  
    cookies = {
      "csrftoken": jsons["csrftoken"],
      "cf_clearance": jsons["cf_clearance"]
    };
  });

  fs.readFile(headersJson, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      return dialog.showErrorBox("Error", err.message);
    }
  
    const jsons = JSON.parse(data);
  
    headers = {
      "user-agent": jsons["user-agent"]
    };
  });

  fs.readFile(path.join(__dirname, "Downloader", "config", "cookies.json"), { encoding: "utf-8" }, (err, data) => {
    if (err) { 
      return dialog.showErrorBox("Error", err.message);
    }
    const jsons = JSON.parse(data);

    if (jsons["csrftoken"] === "" || jsons["cf_clearance"] === "") {
      dialog.showMessageBox({
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
          childProcess.exec(`"${path.join(__dirname, "How to get your cookies.pdf")}"`, (err) => {
            if (err) {
              return dialog.showErrorBox("Error", err.message);
            }
          });
        }
      });
    }
    
    fs.readFile(headersJson, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
  
      const jsons = JSON.parse(data);
  
      if (jsons["user-agent"] === "") {
        dialog.showMessageBox({
          type: "question",
          title: "Empty headers",
          message: "Would you like to set your headers?",
          buttons: [
            "yes",
            "no"
          ]
        }).then((result) => {
          if (result.response === 0) {
            childProcess.exec(`"${path.join(__dirname, "Downloader", "config", "headers.json")}"`, (err) => {
              if (err) {
                return dialog.showErrorBox("Error", err.message);
              }
            });
            childProcess.exec(`"${path.join(__dirname, "How to get your headers.pdf")}"`, (err) => {
              if (err) {
                return dialog.showErrorBox("Error", err.message);
              }
            });
          }
        });
      }
    });
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

      if (!data === "") {
        dialog.showErrorBox("Error", data);
      }
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
        mainWindow.webContents.send("not-downloading");
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
    fs.readFile(path.join(__dirname, "Downloader", "config", "cookies.json"), { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
      const jsons = JSON.parse(data);

      if (jsons["csrftoken"] === "" || jsons["cf_clearance"] === "") {
        return dialog.showErrorBox("Error", "No cookies were given");
      }
    });

    fs.readFile(path.join(__dirname, "Downloader", "config", "headers.json"), { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
      const jsons = JSON.parse(data);

      if (jsons["user-agent"] === "") {
        return dialog.showErrorBox("Error", "No headers were given");
      }
    });

    fs.writeFile(path.join(__dirname, "Downloader", "config", "url.txt"), url, { encoding: "utf-8" }, (err) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
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

  fs.watchFile(cookiesJson, (curr, prev) => {
    fs.readFile(cookiesJson, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
    
      const jsons = JSON.parse(data);
    
      cookies = {
        "csrftoken": jsons["csrftoken"],
        "cf_clearance": jsons["cf_clearance"]
      };

      console.log("Cookies.json has been edited");
      dialog.showMessageBox({
        type: "info",
        title: "Cookies.json",
        message: "Cookies.json has been edited"
      });
    });
  });

  fs.watchFile(headersJson, (curr, prev) => {
    fs.readFile(headersJson, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
    
      const jsons = JSON.parse(data);
    
      headers = {
        "user-agent": jsons["user-agent"]
      };

      console.log("Headers.json has been edited");
      dialog.showMessageBox({
        type: "info",
        title: "Headers.json",
        message: "Headers.json has been edited"
      });
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

  ipcMain.on("test-request", (event) => {
    if (cookies["csrftoken"] === "" || cookies["cf_clearance"] === "") {
      return dialog.showErrorBox("Error", "No cookies were given");
    } else if (headers["user-agent"] === "") {
      return dialog.showErrorBox("Error", "No headers were given");
    }

    axios({
      method: "get",
      url: "https://nhentai.net/",
      headers: {
        Cookie: `csrftoken=${cookies["csrftoken"]}; cf_clearance=${cookies["cf_clearance"]}`,
        "User-Agent": headers["user-agent"]
      }
    }).then((res) => {
      if (res.status === 200) {
        return dialog.showMessageBox({
          type: "info",
          title: "Test Result",
          message: "Working! Status Code: 200"
        });
      } else {
        return dialog.showMessageBox({
          type: "info",
          title: "Test Result",
          message: `Working! Status Code: ${res.status}`
        });
      }
    }).catch((err) => {
      return dialog.showErrorBox("Error", err.message);
    });
  });

  ipcMain.on("open-link", (event, link) => {
    shell.openExternal(link);
  });

  function clearCookies() {
    const clearedCookies = {
      "csrftoken": "",
      "cf_clearance": ""
    };

    fs.writeFile(cookiesJson, JSON.stringify(clearedCookies, null, 4), { encoding: "utf-8" }, (err) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
    });
  }

  function clearHeaders() {
    const clearedHeaders = {
      "user-agent": ""
    };

    fs.writeFile(headersJson, JSON.stringify(clearedHeaders, null, 4), { encoding: "utf-8" }, (err) => {
      if (err) {
        return dialog.showErrorBox("Error", err.message);
      }
    });
  }

  ipcMain.on("clear-cookies", (event) => {
    return dialog.showMessageBox({
      type: "warning",
      title: "Clear cookies",
      message: "Are you sure you want to clear your cookies?",
      buttons: [
        "yes",
        "no"
      ]
    }).then((result) => {
      if (result.response === 0) {
        clearCookies();
      }
    });
  });

  ipcMain.on("clear-headers", (event) => {
    return dialog.showMessageBox({
      type: "warning",
      title: "Clear headers",
      message: "Are you sure you want to clear your headers?",
      buttons: [
        "yes",
        "no"
      ]
    }).then((result) => {
      if (result.response === 0) {
        clearHeaders();
      }
    });
  });

  ipcMain.on("clear-cookiesnheaders", (event) => {
    return dialog.showMessageBox({
      type: "warning",
      title: "Clear cookies and headers",
      message: "Are you sure you want to clear your cookies and headers?",
      buttons: [
        "yes",
        "no"
      ]
    }).then((result) => {
      if (result.response === 0) {
        clearCookies();
        clearHeaders();
      }
    });
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