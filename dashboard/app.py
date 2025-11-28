import streamlit as st
import pandas as pd
from pandasql import sqldf
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
import requests
import os

# -------------------------------------------------------
# ⚙️ Configuração da página
# -------------------------------------------------------
st.set_page_config(page_title="🐾 Painel Completo - PetHost", layout="wide")
st.title("🐾 Dashboard Completo do Sistema PetHost")

API_BASE_URL = os.getenv("API_BASE_URL")
print(f"API_BASE_URL: {API_BASE_URL}")

# -------------------------------------------------------
# 🔌 Função de conexão e carregamento
# -------------------------------------------------------


@st.cache_data
def carregar_tabela(nome_tabela):
    endpoints = {
        "usuarios": f"{API_BASE_URL}/usuarios",
        "anfitrioes": f"{API_BASE_URL}/anfitrioes",
        "pets": f"{API_BASE_URL}/pets",
        "reservas": f"{API_BASE_URL}/reservas",
        "avaliacoes": f"{API_BASE_URL}/avaliacoes",
    }

    try:
        url = endpoints.get(nome_tabela)
        if not url:
            raise ValueError("Tabela não possui endpoint configurado.")

        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return pd.DataFrame(data)

    except Exception as e:
        st.warning(
            f"⚠️ Erro ao conectar à API ({nome_tabela}): {e}. Usando dados simulados.")
        # --- Dados simulados ---
        if nome_tabela == "usuarios":
            return pd.DataFrame({
                "id_usuario": [1, 2, 3],
                "nome": ["Ana", "Bruno", "Clara"],
                "email": ["ana@mail.com", "bruno@mail.com", "clara@mail.com"],
                "tipo": ["tutor", "anfitriao", "tutor"],
                "data_cadastro": pd.to_datetime(["2024-01-01", "2024-02-15", "2024-02-20"])
            })
        elif nome_tabela == "pets":
            return pd.DataFrame({
                "id_pet": [1, 2, 3, 4, 5],
                "id_tutor": [1, 2, 3, 1, 2],
                "nome": ["Rex", "Mimi", "Louro", "Bolt", "Nina"],
                "especie": ["Cachorro", "Gato", "Silvestre", "Cachorro", "Gato"],
                "raca": ["Labrador", "Siamês", "Papagaio", "Vira-lata", "Persa"],
                "idade": [3, 2, 5, 1, 4],
            })
        elif nome_tabela == "reservas":
            return pd.DataFrame({
                "id_reserva": [1, 2, 3],
                "id_tutor": [1, 3, 2],
                "id_anfitriao": [2, 2, 3],
                "status": ["pendente", "confirmada", "concluida"]
            })
        elif nome_tabela == "avaliacoes":
            return pd.DataFrame({
                "id_avaliacao": [1, 2, 3],
                "id_reserva": [1, 2, 3],
                "nota": [5, 4, 3],
                "comentario": ["Ótimo serviço", "Bom atendimento", "Razoável"]
            })
        elif nome_tabela == "anfitrioes":
            return pd.DataFrame({
                "id_anfitriao": [2, 3],
                "descricao": ["Casa grande com quintal", "Apartamento pet friendly"],
                "capacidade_maxima": [3, 2],
                "status": ["ativo", "pendente"]
            })
        else:
            return pd.DataFrame()


# -------------------------------------------------------
# 🧩 Sidebar - seleção da tabela
# -------------------------------------------------------
st.sidebar.header("📋 Selecione a Tabela")
tabela_escolhida = st.sidebar.selectbox(
    "Escolha uma tabela para visualizar:",
    ["usuarios", "anfitrioes", "pets", "reservas", "avaliacoes"]
)

# -------------------------------------------------------
# 📦 Carrega os dados da tabela escolhida
# -------------------------------------------------------
df = carregar_tabela(tabela_escolhida)

# -------------------------------------------------------
# 📈 Gráficos com Matplotlib
# -------------------------------------------------------
if tabela_escolhida == "pets" and not df.empty:
    st.markdown("## 🐾 Análise de Dados - Pets")

    # =====================================================
    # 🔧 Pré-processamento
    # =====================================================
    df["especie"] = df["especie"].astype(
        str).str.title().fillna("Não Informado")
    df["raca"] = df["raca"].astype(str).str.title().fillna("Não Informado")

    # =====================================================
    # 📈 Estatísticas Gerais
    # =====================================================
    st.markdown("### 📊 Estatísticas Gerais")

    total_pets = len(df)
    especies_unicas = df["especie"].nunique()
    racas_unicas = df["raca"].nunique()

    # Mostra as métricas em cards, um do lado do outro
    col1, col2, col3 = st.columns(3)
    col1.metric("🐾 Total de Pets", total_pets, border=True)
    col2.metric("🌿 Espécies Únicas", especies_unicas, border=True)
    col3.metric("🏷️ Raças Únicas", racas_unicas, border=True)

    # =====================================================
    # 🐕 Distribuição por Espécie
    # =====================================================
    st.markdown("### 🐶 Distribuição por Espécie")

    especies_count = df["especie"].value_counts()

    if len(especies_count) > 1:
        fig, ax = plt.subplots(figsize=(6, 6))
        colors = plt.cm.Pastel1.colors
        ax.pie(
            especies_count,
            labels=especies_count.index,
            autopct='%1.1f%%',
            startangle=90,
            colors=colors,
            textprops={'color': 'black'}
        )
        ax.set_title("Distribuição por Espécie", fontsize=13, weight="bold")
        ax.axis("equal")
        st.pyplot(fig)
    else:
        especie_unica = especies_count.index[0]
        st.info(
            f"🔹 Apenas **{especie_unica}** registrado(a) — gráfico de pizza não exibido.")


elif tabela_escolhida == "avaliacoes" and not df.empty:
    st.markdown("### 📊 Avaliações - Distribuição de Notas")

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(df["nota"], bins=range(1, 7), color='orange',
            edgecolor='black', rwidth=0.8)
    ax.set_title("Distribuição de Notas")
    ax.set_xlabel("Nota")
    ax.set_ylabel("Frequência")
    st.pyplot(fig)

elif tabela_escolhida == "reservas" and not df.empty:
    st.markdown("### 📊 Reservas - Status")

    status_count = df["status"].value_counts()
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(status_count.index, status_count.values,
           color=['#ff9999', '#66b3ff', '#99ff99'])
    ax.set_title("Quantidade de Reservas por Status")
    ax.set_xlabel("Status")
    ax.set_ylabel("Quantidade")
    st.pyplot(fig)

elif tabela_escolhida == "usuarios" and not df.empty:
    st.markdown("## 👥 Análise de Usuários")

    st.divider()

    # ======================================================
    # 1️⃣ Evolução dos cadastros por dia (gráfico de linha)
    # ======================================================
    st.markdown("### 📊 Usuários - Quantidade de Usuários por Dia de Cadastro")

    # --- Consulta SQL (sem acumular usuários distintos)
    df_sql = sqldf("""
        SELECT 
            DATE(data_cadastro) AS DIA,
            COUNT(id_usuario) AS usuarios
        FROM df
        WHERE data_cadastro IS NOT NULL
        GROUP BY 1
        ORDER BY DIA
    """)

    # Converter para datetime
    df_sql['DIA'] = pd.to_datetime(df_sql['DIA'])

    # --- Gráfico de Linhas ---
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(df_sql['DIA'], df_sql['usuarios'], marker='o',
            linewidth=2, markersize=8, color='steelblue')

    # Adiciona os valores arredondados sobre os pontos
    for x, y in zip(df_sql['DIA'], df_sql['usuarios']):
        ax.text(x, y + 0.1, str(int(round(y))), ha='center',
                va='bottom', fontsize=10, fontweight='bold')

    # Títulos e rótulos
    ax.set_xlabel('Data', fontsize=10)
    ax.set_ylabel('Quantidade de Usuários', fontsize=12)
    ax.set_title('Quantidade de Usuários por Dia',
                 fontsize=12, fontweight='bold', pad=24)

    # Força eixo Y inteiro
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))

    st.pyplot(fig)

    st.divider()

    # ======================================================
    # 2️⃣ Distribuição por tipo (Tutor x Anfitrião)
    # ======================================================
    st.markdown("### 🧩 Distribuição por Tipo de Usuário")

    tipo_count = df["tipo"].value_counts(dropna=True)
    fig, ax = plt.subplots(figsize=(4, 4))
    ax.pie(
        tipo_count,
        labels=tipo_count.index,
        autopct="%1.1f%%",
        startangle=90,
        colors=["#6fa8dc", "#93c47d"]
    )
    ax.set_title("Distribuição de Tipos de Usuário")
    st.pyplot(fig)

    st.divider()

    # ======================================================
    # 3️⃣ Distribuição por estado (UF)
    # ======================================================
    if "uf" in df.columns and df["uf"].notna().any():
        st.markdown("### 🗺️ Distribuição por Estado")

        # 🔤 Padroniza os valores de UF (corrige variações como 'rs', 'Rs', etc.)
        df["uf"] = df["uf"].astype(str).str.strip().str.upper()

        # Conta e plota os 10 estados mais frequentes
        uf_count = df["uf"].value_counts().head(10)

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.bar(uf_count.index, uf_count.values, color='teal')
        ax.set_xlabel("Estado (UF)")
        ax.set_ylabel("Quantidade de Usuários")
        ax.set_title("Usuários por Estado (Top 10)")
        st.pyplot(fig)
    else:
        st.info("Nenhum dado de UF disponível.")
