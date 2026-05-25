from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageOps
import numpy as np
import ocr
import threading

app = Flask(__name__)
CORS(app)

partes_memoria = []

@app.route('/ocr/image', methods=['POST'])
def process_image_file():
    if 'file' not in request.files:
        return jsonify({"sucesso": False, "erro": "Sem arquivo."})
    
    modo_copa = request.form.get('modo_copa') == 'true'
    
    from PIL import ImageOps, ImageEnhance
    
    file = request.files['file']
    img = Image.open(file.stream).convert('RGB')
    
    # v8.18: Alta Nitidez
    w, h = img.size
    img = img.resize((w*2, h*2), Image.Resampling.LANCZOS)
    img = ImageOps.autocontrast(img, cutoff=2)
    img = ImageEnhance.Contrast(img).enhance(1.5)
    img = ImageEnhance.Sharpness(img).enhance(2.0)
    
    new_w, new_h = img.size
    img_np = np.array(img)
    resultado_ocr = ocr.reader.readtext(img_np, detail=1)
    linhas = ocr.processar_tabela_v6(resultado_ocr, modo_copa=modo_copa, img_width=new_w, img_height=new_h)
    return jsonify({"sucesso": True, "linhas": linhas})

@app.route('/ocr/clear', methods=['GET'])
def clear_ocr_parts():
    global partes_memoria
    partes_memoria = []
    return jsonify({"sucesso": True, "mens": "Memória limpa."})

@app.route('/ocr/take_screenshot', methods=['GET'])
def take_screenshot():
    import time
    try:
        from PIL import ImageGrab
        import pygetwindow as gw
        
        # Procura a janela do PES
        windows = gw.getWindowsWithTitle('eFootball PES 2021')
        if not windows:
            windows = gw.getWindowsWithTitle('PES 2021')
            
        if windows:
            win = windows[0]
            left, top, width, height = win.left, win.top, win.width, win.height
            img = ImageGrab.grab(bbox=(left, top, left+width, top+height), all_screens=True).convert('RGB')
            print(f"Janela encontrada em: {left}, {top} ({width}x{height})")
        else:
            img = ImageGrab.grab(all_screens=True).convert('RGB')
            print("Janela do PES não encontrada, usando tela toda.")
            
        import os
        captures_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ocr_captures'))
        if not os.path.exists(captures_dir):
            os.makedirs(captures_dir)
            
        filename = f"acr_capture_{int(time.time() * 1000)}.png"
        filepath = os.path.join(captures_dir, filename)
        
        img.save(filepath)
        return jsonify({"sucesso": True, "filepath": filepath})
    except Exception as e:
        return jsonify({"sucesso": False, "erro": str(e)})

def run_server():
    print("AI Engine Server rodando na porta 5001...")
    app.run(port=5001, debug=False, use_reloader=False)

if __name__ == "__main__":
    run_server()
