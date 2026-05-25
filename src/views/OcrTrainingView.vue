<template>
  <div class="ocr-training container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="text-warning m-0"><i class="bi bi-bounding-box-circles"></i> ACR - Escola de Leitura</h2>
      <button class="btn btn-outline-light" @click="$router.push('/')">Voltar ao Início</button>
    </div>
    
    <div class="row">
      <!-- Painel Lateral: Configurações e Áreas -->
      <div class="col-md-3">
        <div class="card bg-dark text-light border-secondary mb-3 shadow">
          <div class="card-header border-secondary fw-bold">Configuração da Captura</div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label text-muted small">Selecione o Print</label>
              <select v-model="selectedImage" class="form-select bg-dark text-light border-secondary">
                <option value="/teste_ocr1.png">Print 1 (Times 1 ao 16)</option>
                <option value="/teste_ocr2.png">Print 2 (Times 17 ao 20)</option>
              </select>
            </div>
            <p class="small text-muted mb-3">
              Clique e arraste sobre a imagem ao lado para mapear as colunas (ex: Posição, Nome, Pontos).
            </p>
            <button class="btn btn-outline-danger w-100 mb-2" @click="clearBoxes">
              <i class="bi bi-trash"></i> Limpar Tudo
            </button>
            <button class="btn btn-warning w-100 fw-bold" @click="saveTemplate">
              <i class="bi bi-save"></i> Salvar Template
            </button>
          </div>
        </div>

        <div class="card bg-dark text-light border-secondary shadow">
          <div class="card-header border-secondary fw-bold">Áreas Desenhadas ({{ boxes.length }})</div>
          <div class="card-body p-0" style="max-height: 400px; overflow-y: auto;">
            <ul class="list-group list-group-flush">
              <li v-for="(box, index) in boxes" :key="index" class="list-group-item bg-dark text-light border-secondary p-2">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <input v-model="box.name" class="form-control form-control-sm bg-dark text-warning border-secondary" placeholder="Nome da Coluna">
                  <select v-model="box.type" class="form-select form-select-sm bg-dark text-info border-secondary" style="width: 100px;">
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                  </select>
                  <button class="btn btn-sm btn-danger" @click="boxes.splice(index, 1)"><i class="bi bi-x"></i></button>
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  X: {{ Math.round(box.x) }} | Y: {{ Math.round(box.y) }} | L: {{ Math.round(box.w) }} | A: {{ Math.round(box.h) }}
                </div>
              </li>
            </ul>
            <div v-if="boxes.length === 0" class="p-4 text-muted text-center">
              <i class="bi bi-vector-pen fs-3 d-block mb-2"></i>
              Nenhuma área mapeada ainda.
            </div>
          </div>
        </div>

        <!-- Resultados do OCR -->
        <div class="card bg-dark text-light border-success shadow mt-3">
          <div class="card-header border-success text-success fw-bold">Teste de Leitura (OCR)</div>
          <div class="card-body">
            <button class="btn btn-success w-100 mb-3 fw-bold" @click="testOCR" :disabled="isReading || boxes.length === 0">
              <span v-if="isReading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-robot me-2"></i>
              {{ isReading ? 'Lendo a tela...' : 'Testar Leitura Agora' }}
            </button>
            
            <div v-if="ocrResults.length > 0" style="max-height: 400px; overflow-y: auto;">
              <div v-for="(res, idx) in ocrResults" :key="idx" class="mb-4 border-bottom border-secondary pb-3">
                <strong class="text-info d-block mb-2">{{ res.name }}</strong>
                <!-- Imagem Processada que o Tesseract viu -->
                <div class="mb-2">
                  <small class="text-muted d-block mb-1">Como o robô enxergou:</small>
                  <img :src="res.processedImage" class="img-thumbnail bg-white border-0" style="max-height: 80px;" />
                </div>
                <!-- Resultado em Texto -->
                <pre class="bg-black p-2 mt-1 rounded text-light mb-0" style="font-size: 0.85rem; white-space: pre-wrap;">{{ res.text }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área da Imagem -->
      <div class="col-md-9">
        <div class="card bg-dark border-secondary shadow">
          <div class="card-body text-center overflow-auto" style="max-height: 80vh;">
            <div class="image-container" ref="imgContainer" @mousedown="startDraw" @mousemove="onDraw" @mouseup="endDraw" @mouseleave="endDraw">
              <!-- A imagem base recebe um ref para pegarmos seu elemento DOM nativo -->
              <img ref="baseImageEl" :src="selectedImage" class="img-fluid ocr-image" draggable="false" crossorigin="anonymous" />
              
              <!-- Caixas já desenhadas -->
              <div v-for="(box, i) in boxes" :key="'box'+i" class="drawn-box" :style="{ left: box.x + 'px', top: box.y + 'px', width: box.w + 'px', height: box.h + 'px' }">
                 <span class="box-label">{{ box.name || 'Sem nome' }}</span>
              </div>

              <!-- Caixa desenhando agora -->
              <div v-if="isDrawing" class="drawing-box" :style="{ left: currentBox.x + 'px', top: currentBox.y + 'px', width: currentBox.w + 'px', height: currentBox.h + 'px' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Tesseract from 'tesseract.js';

const selectedImage = ref('/teste_ocr1.png');
const imgContainer = ref(null);
const baseImageEl = ref(null);
const boxes = ref([]);

const isDrawing = ref(false);
let startX = 0;
let startY = 0;

const currentBox = ref({ x: 0, y: 0, w: 0, h: 0 });

const isReading = ref(false);
const ocrResults = ref([]);

function startDraw(e) {
  if (e.button !== 0) return; // só aceita click do botão esquerdo do mouse
  isDrawing.value = true;
  const rect = imgContainer.value.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  
  currentBox.value = { x: startX, y: startY, w: 0, h: 0 };
}

function onDraw(e) {
  if (!isDrawing.value) return;
  const rect = imgContainer.value.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  currentBox.value.x = Math.min(startX, currentX);
  currentBox.value.y = Math.min(startY, currentY);
  currentBox.value.w = Math.abs(currentX - startX);
  currentBox.value.h = Math.abs(currentY - startY);
}

function endDraw() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  
  // Só salva se o quadrado desenhado for maior que 10x10 pixels (evita cliques acidentais)
  if (currentBox.value.w > 10 && currentBox.value.h > 10) {
    // Por padrão chuta "number" (número) já que a maioria das colunas é pontuação
    boxes.value.push({ ...currentBox.value, name: '', type: 'number' });
  }
}

function clearBoxes() {
  if(confirm('Tem certeza que deseja apagar todos os recortes?')) {
    boxes.value = [];
    ocrResults.value = [];
  }
}

function saveTemplate() {
  if (boxes.value.length === 0) {
    alert('Desenhe pelo menos uma área antes de salvar!');
    return;
  }
  
  const templateJSON = JSON.stringify(boxes.value, null, 2);
  
  // Copia pro Ctrl+C do usuário automaticamente
  navigator.clipboard.writeText(templateJSON).then(() => {
    alert('✅ Sucesso! O código foi copiado. \n\nVenha aqui no nosso chat e dê um Ctrl+V (Colar)!');
  }).catch(err => {
    // Fallback se o clipboard falhar
    console.log(templateJSON);
    alert('Não consegui copiar. Aperte Ctrl + Shift + I para abrir o console e copie de lá!');
  });
}

// Magia Negra do OCR: Transforma a imagem crua do jogo em Preto e Branco de alto contraste
function preprocessImage(imgEl, box) {
  // Pegamos a escala real da imagem caso o CSS tenha diminuído ela
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;

  const realX = box.x * scaleX;
  const realY = box.y * scaleY;
  const realW = box.w * scaleX;
  const realH = box.h * scaleY;

  // Criamos um canvas virtual e aumentamos o tamanho x2 para melhorar a precisão da leitura
  const zoom = 2;
  const canvas = document.createElement('canvas');
  canvas.width = realW * zoom;
  canvas.height = realH * zoom;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  // Desenha só o pedaço da imagem que a gente recortou
  ctx.drawImage(imgEl, realX, realY, realW, realH, 0, 0, canvas.width, canvas.height);
  
  // Filtro de Contraste Binarizado (Tudo vira ou 100% Preto ou 100% Branco)
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Brilho do pixel
    let brightness = (r + g + b) / 3;
    
    // Como os textos no PES geralmente são claros (branco/amarelo) num fundo escuro:
    // Se o pixel for claro, pintamos de PRETO (letra). Se for escuro, pintamos de BRANCO (fundo).
    if (brightness > 130) { 
      brightness = 0;   // Texto Preto
    } else {
      brightness = 255; // Fundo Branco
    }
    
    data[i] = data[i+1] = data[i+2] = brightness;
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png'); // Devolve a imagem tratada em base64
}

async function testOCR() {
  if (boxes.value.length === 0) {
    alert("Nenhuma área desenhada!");
    return;
  }

  isReading.value = true;
  ocrResults.value = [];

  try {
    const worker = await Tesseract.createWorker('por');
    
    for (const box of boxes.value) {
      // Configura restrição de caracteres dependendo do tipo de caixa (Número ou Texto)
      // Se for número, proíbe o Tesseract de tentar achar letras como O, l, fo), &
      const whitelist = box.type === 'number' ? '0123456789- ' : '';
      
      await worker.setParameters({
        tessedit_pageseg_mode: 6, // Lê como uma lista de linhas
        tessedit_char_whitelist: whitelist,
      });

      // Passa nossa imagem pelo filtro de tratamento pesado
      const processedImageBase64 = preprocessImage(baseImageEl.value, box);
      
      // Manda a imagem já em P&B pro Tesseract
      const result = await worker.recognize(processedImageBase64);
      
      ocrResults.value.push({
        name: box.name || 'Área sem nome',
        text: result.data.text.trim(),
        processedImage: processedImageBase64
      });
    }
    
    await worker.terminate();
  } catch (error) {
    console.error("Erro no OCR:", error);
    alert("Falha na leitura: " + error.message);
  } finally {
    isReading.value = false;
  }
}

import { onMounted, onUnmounted } from 'vue';

// Magia: Escutar o F10 Oficial para carregar a foto na hora no Laboratório
function handleRealScreenshot(e) {
  const filePath = e.detail.filePath;
  // O Electron precisa do prefixo file:// para carregar caminhos absolutos do HD
  selectedImage.value = `file://${filePath.replace(/\\/g, '/')}`;
  
  // Limpa as caixas velhas pois a resolução da foto nova (F10) deve ser diferente
  boxes.value = [];
  ocrResults.value = [];
  
  console.log("LAB ACR: Imagem Oficial F10 Carregada com sucesso!", selectedImage.value);
}

onMounted(() => {
  window.addEventListener('acr-screenshot', handleRealScreenshot);
});

onUnmounted(() => {
  window.removeEventListener('acr-screenshot', handleRealScreenshot);
});
</script>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
  user-select: none;
  cursor: crosshair;
  border: 1px solid #333;
}

.ocr-image {
  display: block;
  max-width: 100%;
}

.drawn-box {
  position: absolute;
  border: 2px solid #ffc107;
  background-color: rgba(255, 193, 7, 0.15);
  pointer-events: none;
}

.box-label {
  position: absolute;
  top: -22px;
  left: -2px;
  background: #ffc107;
  color: #000;
  font-size: 11px;
  padding: 2px 6px;
  font-weight: bold;
  white-space: nowrap;
  border-radius: 4px 4px 0 0;
}

.drawing-box {
  position: absolute;
  border: 2px dashed #0dcaf0;
  background-color: rgba(13, 202, 240, 0.15);
  pointer-events: none;
}

/* Scrollbar customizada para a div lateral */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #212529; 
}
::-webkit-scrollbar-thumb {
  background: #495057; 
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #6c757d; 
}
</style>
