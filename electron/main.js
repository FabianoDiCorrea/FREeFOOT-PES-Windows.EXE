import { app, BrowserWindow } from 'electron';
app.setName('FreeFoot-PES');
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pyProcess = null;

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
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
    startPythonEngine();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (pyProcess) pyProcess.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
