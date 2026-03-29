import easyocr
import numpy as np
import re
from PIL import ImageGrab, Image

# Inicializa o leitor
reader = easyocr.Reader(['pt', 'en'])

def capturar_e_ler_ocr():
    """Captura imagem do clipboard e retorna resultado detalhado."""
    try:
        img = ImageGrab.grabclipboard()
        if isinstance(img, Image.Image):
            img_np = np.array(img)
            resultado = reader.readtext(img_np, detail=1)
            return resultado, True
        else:
            return "Nenhuma imagem no clipboard.", False
    except Exception as e:
        return f"Erro OCR: {str(e)}", False

def processar_tabela_v6(resultado_ocr, modo_copa=False, img_width=None, img_height=None):
    """
    v8.20: Motor Definitivo (100% Permissivo).
    Não descarta times. Se encontrar um nome, a linha é mantida.
    """
    if not img_width: img_width = 1000
    resultado_ocr.sort(key=lambda x: x[0][0][1])
    
    linhas_brutas = []
    current_y = -1
    threshold = 6 
    linha_atual = []
    
    for bbox, text, prob in resultado_ocr:
        y = bbox[0][1]
        x = bbox[0][0]
        if current_y == -1 or abs(y - current_y) < threshold:
            linha_atual.append((x, text))
            current_y = y
        else:
            linha_atual.sort(key=lambda item: item[0])
            linhas_brutas.append(linha_atual)
            linha_atual = [(x, text)]
            current_y = y
    
    if linha_atual:
        linha_atual.sort(key=lambda item: item[0])
        linhas_brutas.append(linha_atual)

    processed_rows = []
    blacklist = ["CLASSIFICA", "TIME", "PTS", "SG", "GC", "GP", "JOGOS", "%", "POS", "VITORIA", "EMPATE", "DERROTA", "TABELA", "FINAL", "OPCIONAL"]
    
    for components in linhas_brutas:
        stats_start_x = img_width * 0.40 # v8.20: Mais relaxado
        nome_tokens = []
        stats_nums = []
        
        for x, text in components:
            raw_text = text.strip().upper()
            if any(w in raw_text for w in blacklist):
                continue
                
            # Extrair números
            found_nums = re.findall(r'\d+', text.replace('l', '1').replace('I', '1'))
            
            # Se for zona de nome ou não parecer número
            if x < stats_start_x and not re.match(r'^\d+$', text.strip()):
                if len(text.strip()) > 1:
                    nome_tokens.append(text.strip())
            else:
                stats_nums.extend(found_nums)

        if nome_tokens:
            nome_time = " ".join(nome_tokens).upper()
            # Limpeza do número de posição (ex: "1 CHELSEA" -> "CHELSEA")
            nome_time = re.sub(r'^\d+[\s.]+', '', nome_time)
            
            if modo_copa:
                if len(nome_time) > 2:
                    processed_rows.append(nome_time)
            else:
                # v8.20: 100% Permissivo - Preenche com 0 se o OCR falhar nos números
                def safe_get(idx): return stats_nums[idx] if idx < len(stats_nums) else "0"
                p, j, v, e, d, gp, gc, sg = safe_get(0), safe_get(1), safe_get(2), safe_get(3), safe_get(4), safe_get(5), safe_get(6), safe_get(7)
                processed_rows.append(f"{nome_time} {p} {j} {v} {e} {d} {gp} {gc} {sg}")
                
    return processed_rows

def unificar_tabelas(lista_de_listas):
    """Refinamento v8.9: Unificação baseada no nome do time."""
    visto = set()
    unificado = []
    for tabela in lista_de_listas:
        for linha in tabela:
            parts = linha.split(' ')
            nome_time_full = " ".join(parts[:-7]) if len(parts) > 7 else linha
            if nome_time_full.strip().upper() not in visto:
                unificado.append(linha)
                visto.add(nome_time_full.strip().upper())
    return "\n".join(unificado)
