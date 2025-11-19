# PetLarDashboard

Para uso excluivo de desenvolvedores e Analistas do PetLar

## Como rodar o dashboard

1️⃣ Criar um ambiente virtual:

```bash
# Windows
py -m venv venv
venv\Scripts\activate

#ou

# Linux
python3 -m venv venv
source venv/bin/activate
```

2️⃣ Instalar as dependências:

```bash
pip install -r requirements.txt
```

3️⃣ Rodar o dashboard com o seguinte comando:

```bash
streamlit run app.py
```

4️⃣ O dashboard vai rodar em http://localhost:8501

## Para buildar o dashboard:

```bash
streamlit-desktop-app build app.py --name PetLarDashboard --pyinstaller-options --onefile --noconsole
```

- `--name`: nome do app
- `--pyinstaller-options`: opções para o pyinstaller
- `--noconsole`: sem console
- `--onefile`: um arquivo executável
