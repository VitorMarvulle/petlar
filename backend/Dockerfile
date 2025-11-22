# 1. Imagem base: Usamos uma imagem oficial do Python, leve e otimizada.
FROM python:3.11-slim

# 2. Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copia o arquivo de dependências e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copia todo o código do backend para dentro do contêiner
COPY . .

# 5. Expõe a porta que a sua API vai usar (ex: 8000 para FastAPI)
EXPOSE 8000

# 6. Comando para iniciar a aplicação quando o contêiner rodar
# Este comando pode variar dependendo do seu framework (FastAPI/Django)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]