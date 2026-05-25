import Tesseract from 'tesseract.js';

class AcrService {
    constructor() {
        this.worker = null;
        this.isReady = false;
        // Templates de fábrica chumbados no código para a Tabela do PES 21
        this.templates = {
            'tabela_pes_21': [
              { x: 219, y: 197, w: 297, h: 495, name: 'time', type: 'text' },
              { x: 534, y: 197, w: 58, h: 495, name: 'pontos', type: 'number' },
              { x: 635, y: 197, w: 58, h: 495, name: 'vitoria', type: 'number' },
              { x: 720, y: 196, w: 75, h: 496, name: 'empate', type: 'number' },
              { x: 822, y: 197, w: 70, h: 495, name: 'derrota', type: 'number' },
              { x: 919, y: 196, w: 62, h: 496, name: 'gp', type: 'number' },
              { x: 1016, y: 197, w: 73, h: 495, name: 'gc', type: 'number' },
              { x: 1114, y: 197, w: 75, h: 495, name: 'sg', type: 'number' }
            ]
        };
    }

    /**
     * Liga o motor do OCR (Faz o download do idioma e prepara a IA)
     * Isso será chamado quando o usuário clicar em "Iniciar Captura ACR"
     */
    async initialize() {
        if (this.isReady) return;
        
        console.log("ACR: Inicializando motor Tesseract...");
        this.worker = await Tesseract.createWorker('por');
        this.isReady = true;
        console.log("ACR: Motor pronto para leitura!");
    }

    /**
     * Termina o motor do OCR
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isReady = false;
        }
    }

    /**
     * Pré-processamento bruto da imagem para otimizar leitura de tabela
     */
    async preprocessImage(imagePath, box) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = box.w;
                canvas.height = box.h;
                const ctx = canvas.getContext('2d');
                
                // Desenha apenas a área de interesse
                ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

                // Aplica filtro de Thresholding (Binarização para Preto e Branco)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // DETECTOR DE TEXTO BRANCO DO PES
                    // O texto do jogo é muito claro (RGB alto). O fundo dourado ou cinza é médio/escuro.
                    let brightness;
                    if (r > 170 && g > 170 && b > 170) { 
                        // É texto! Fica Preto para o Tesseract ler
                        brightness = 0;
                    } else {
                        // É fundo ou escudo colorido! Fica Branco
                        brightness = 255;
                    }
                    
                    data[i] = brightness;
                    data[i + 1] = brightness;
                    data[i + 2] = brightness;
                }
                ctx.putImageData(imageData, 0, 0);
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = `file://${imagePath}`;
        });
    }

    /**
     * Lê uma imagem baseado em um template salvo de colunas
     */
    async readScreen(imagePath, templateName) {
        if (!this.isReady) {
            throw new Error("ACR Motor não está inicializado. Chame initialize() primeiro.");
        }

        const boxes = this.templates[templateName];
        if (!boxes || boxes.length === 0) {
            throw new Error(`Template '${templateName}' não encontrado ou vazio.`);
        }

        console.log(`ACR: Iniciando leitura (Modo Colunas) usando template '${templateName}'...`);
        const results = {};

        for (const box of boxes) {
            // Whitelist brutal: se for número, só permite ler números (Impede O de virar 0, etc)
            const whitelist = box.type === 'number' ? '0123456789- ' : '';
            
            await this.worker.setParameters({
                tessedit_pageseg_mode: 6, // Bloco único de texto (Tesseract acha as linhas sozinho)
                tessedit_char_whitelist: whitelist,
            });

            const processedImgBase64 = await this.preprocessImage(imagePath, box);
            const ocrResult = await this.worker.recognize(processedImgBase64);
            
            // Quebra o texto lido em um array de linhas (ex: Array com os 16 times)
            const lines = ocrResult.data.text.trim().split('\n').map(line => line.trim()).filter(l => l);
            results[box.name] = lines;
        }

        console.log("ACR: Leitura Colunar concluída com sucesso!", results);
        return results;
    }

    // Gerenciamento de Templates (Será ligado ao banco de dados no futuro)
    saveTemplate(name, boxes) {
        this.templates[name] = boxes;
        // TODO: Salvar no LocalForage
    }
}

export default new AcrService();
