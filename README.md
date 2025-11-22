# Rodando com Docker (Ambiente Recomendado)

Esta é a forma mais simples e rápida de ter todo o ambiente (backend, frontend e banco de dados) rodando de forma isolada e consistente.

## 1. Clone o Repositório

```bash
git clone https://github.com/VitorMarvulle/petlar.git
cd LarDocePet
```

## 2. Construa e Inicie os Contêineres

Este comando único irá construir as imagens e iniciar todos os serviços. O hot-reloading estará ativado por padrão.

```bash
docker-compose up --build -d
```

## 3. Acesse as Aplicações

- **Frontend (React):** [http://localhost:3000](http://localhost:3000)
- **Backend (Python API):** [http://localhost:8000](http://localhost:8000)
- **Dashboard (Streamlit):** [http://localhost:8501](http://localhost:8501)
- **Mobile:** [http://localhost:8081](http://localhost:8081)

## 4. Para Parar os Contêineres

Pressione `CTRL + C` no terminal onde os contêineres estão rodando e depois execute:

```bash
docker-compose down
```

---

# Rodando Localmente (Sem Docker)

Execute o backend e o frontend em terminais separados.

## Backend (Python/FastAPI)

1. Navegue até a pasta do backend

   ```bash
   cd backend
   ```

2. Crie e ative o ambiente virtual (venv)

   ```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Instale as dependências

   ```bash
   pip install -r requirements.txt
   ```

4. Inicie o servidor com hot-reloading
   ```bash
   uvicorn main:app --reload
   ```

O backend estará disponível em [http://localhost:8000](http://localhost:8000).

## Frontend (React)

1. Navegue até a pasta do frontend

   ```bash
   cd frontend
   ```

2. Instale as dependências

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento
   ```bash
   npm start
   ```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## Dashboard (Python/Streamlit)

1. Navegue até a pasta do dashboard

   ```bash
   cd dashboard
   ```

2. Crie e ative o ambiente virtual (venv)

   ```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Instale as dependências

   ```bash
   pip install -r requirements.txt
   ```

4. Inicie o servidor com hot-reloading
   ```bash
   streamlit run app.py
   ```

O dashboard estará disponível em [http://localhost:8501](http://localhost:8501).

---

## Mobile (React Native)

1. Navegue até a pasta do mobile

   ```bash
   cd AppPet
   ```

2. Instale as dependências

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento
   ```bash
   npx expo start
   ```

O mobile estará disponível em [http://localhost:8081](http://localhost:8081).

---

# Estrutura do Projeto

O projeto utiliza uma arquitetura de monorepo para organizar os diferentes serviços:

- `/backend`: Contém a API em Python (FastAPI).
- `/frontend`: Contém a aplicação web em React.
- `/AppPet`: Contém a aplicação mobile em React Native.
- `/dashboard`: Contém a aplicação desktop dashboard em Python (Streamlit).