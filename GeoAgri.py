# GeoAgri.py
# Script principal do projeto GeoAgri
# pip install -r requirements.txt

import requests
import rasterio
from rasterio.io import MemoryFile
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from PIL import Image

def carregar_imagem(caminho):
    if caminho.startswith("http"):
        print(f"[INFO] Carregando imagem da web: {caminho}")
        response = requests.get(caminho)
        if response.status_code != 200:
            raise Exception(f"Erro ao baixar a imagem: {response.status_code}")
        with MemoryFile(response.content) as memfile:
            with memfile.open() as src:
                imagem = src.read(1)
                perfil = src.profile
    else:
        print(f"[INFO] Carregando imagem local: {caminho}")
        with rasterio.open(caminho) as src:
            imagem = src.read(1)
            perfil = src.profile
    return imagem, perfil

def redimensionar_para_mesmo_tamanho(img_array, shape_alvo):
    img_pil = Image.fromarray(img_array)
    img_pil = img_pil.resize((shape_alvo[1], shape_alvo[0]))
    return np.array(img_pil)

def detectar_desmatamento(imagem_antes, imagem_depois, threshold=50):
    diferenca = np.abs(imagem_depois - imagem_antes)
    desmatamento = diferenca > threshold
    return desmatamento

def gerar_relatorio_esg(desmatamento, riscos_climaticos):
    area_total = desmatamento.size
    area_desmatada = np.sum(desmatamento)
    area_risco_alto = np.sum(riscos_climaticos == 2)
    percentual_desmatado = (area_desmatada / area_total) * 100
    percentual_risco_alto = (area_risco_alto / area_total) * 100

    print("\n📊 Relatório ESG para financiamento agronegócio:")
    print(f"🌳 Percentual de áreas desmatadas: {percentual_desmatado:.2f}%")
    print(f"⚠️ Percentual de áreas em alto risco climático: {percentual_risco_alto:.2f}%")

# URLs ou arquivos locais
url_imagem_antes = "https://github.com/mapbox/rasterio/raw/main/tests/data/RGB.byte.tif"
url_imagem_depois = "https://github.com/mapbox/rasterio/raw/main/tests/data/shade.tif"

# Carregamento e ajustes
imagem_antes, _ = carregar_imagem(url_imagem_antes)
imagem_depois, _ = carregar_imagem(url_imagem_depois)

if imagem_antes.shape != imagem_depois.shape:
    print(f"[INFO] Ajustando imagem de {imagem_depois.shape} para {imagem_antes.shape}")
    imagem_depois = redimensionar_para_mesmo_tamanho(imagem_depois, imagem_antes.shape)

# Exibição e salvamento
plt.imshow(imagem_antes, cmap='gray'); plt.title('Imagem Antes'); plt.savefig("resultados/Imagem_Antes.png"); plt.show()
plt.imshow(imagem_depois, cmap='gray'); plt.title('Imagem Depois'); plt.savefig("resultados/Imagem_Depois.png"); plt.show()

# Detecção de desmatamento
desmatamento = detectar_desmatamento(imagem_antes, imagem_depois)
plt.imshow(desmatamento, cmap='Reds'); plt.title('Áreas de Desmatamento'); plt.colorbar(label='Intensidade'); plt.savefig("resultados/Mapa_Desmatamento.png"); plt.show()

# Simulação de risco climático
temperatura = np.random.uniform(20, 40, size=(100, 100))
precipitacao = np.random.uniform(0, 200, size=(100, 100))
dados_climaticos = np.dstack((temperatura, precipitacao)).reshape(-1, 2)
kmeans = KMeans(n_clusters=3, random_state=42).fit(dados_climaticos)
riscos_climaticos = kmeans.labels_.reshape(100, 100)
plt.imshow(riscos_climaticos, cmap='coolwarm'); plt.title('Mapa de Risco Climático'); plt.colorbar(label='Risco'); plt.savefig("resultados/Mapa_Risco_Climatico.png"); plt.show()

# Relatório ESG
gerar_relatorio_esg(desmatamento, riscos_climaticos)
