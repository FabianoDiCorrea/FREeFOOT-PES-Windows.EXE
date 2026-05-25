import { app, BrowserWindow, globalShortcut, desktopCapturer, screen, ipcMain } from 'electron';
app.setName('FreeFoot-PES');
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pyProcess = null;
let mainWindow = null;

function startPythonEngine() {
    const pyScript = path.join(__dirname, '../ai-engine/server.py');
    // Em produção, o script pode estar no Resources. Por enquanto, roda o script direto.
    pyProcess = spawn('python', [pyScript]);

    pyProcess.stdout.on('data', (data) => {
        console.log(`AI Engine: ${data}`);
    });

    pyProcess.stderr.on('data', (data) => {
        console.error(`AI Engine Error: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

async function takeScreenshot() {
    try {
        console.log('ACR: Solicitando print via servidor Python...');
        
        http.get('http://127.0.0.1:5001/ocr/take_screenshot', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.sucesso && json.filepath) {
                        console.log('ACR: Screenshot salva pelo Python em', json.filepath);
                        if (mainWindow) {
                            mainWindow.webContents.send('acr-capture-saved', json.filepath);
                        }
                    } else {
                        console.error('ACR: Erro no Python:', json.erro);
                    }
                } catch(e) {
                    console.error('ACR: Falha ao parsear resposta do Python:', e);
                }
            });
        }).on('error', (err) => {
            console.error('ACR: Falha ao contactar servidor Python:', err.message);
        });
        
    } catch (err) {
        console.error('ACR: Falha geral ao pedir screenshot:', err);
    }
}

app.whenReady().then(() => {
    startPythonEngine();
    createWindow();

    // Registra o atalho global F10
    const ret = globalShortcut.register('F10', () => {
        console.log('ACR: F10 pressionado (Global Shortcut). Iniciando captura...');
        takeScreenshot();
    });
    
    // Escuta comando manual do botão de Delay do FreeFoot
    ipcMain.on('force-acr-capture', () => {
        console.log('ACR: Captura forçada pelo botão com Delay!');
        takeScreenshot();
    });

    if (!ret) {
        console.log('ACR: Falha ao registrar o atalho F10');
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('will-quit', () => {
    // Limpa os atalhos quando o app for fechar
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (pyProcess) pyProcess.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
