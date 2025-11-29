import os
import json
import requests
import matplotlib.pyplot as plt
import streamlit as st
import pandas as pd
from pandasql import sqldf
from matplotlib.ticker import MaxNLocator
from dotenv import load_dotenv

# =====================================================================
# ⚙️ Configurações Iniciais
# =====================================================================
load_dotenv()
st.set_page_config(page_title="🐾 Painel Completo - PetHost", layout="wide")
st.title("🐾 Dashboard Completo do Sistema PetHost")

API_BASE_URL = os.getenv("API_BASE_URL")


# =====================================================================
# 🔧 Função de carregamento de tabela via API
# =====================================================================
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
        return pd.DataFrame(response.json())

    except Exception as e:
        st.warning(
            f"⚠️ Erro ao conectar à API ({nome_tabela}): {e}. Usando dados simulados.")

        if nome_tabela == "usuarios":
            return pd.DataFrame({
                "id_usuario": [1, 2, 3],
                "nome": ["Ana", "Bruno", "Clara"],
                "email": ["ana@mail.com", "bruno@mail.com", "clara@mail.com"],
                "tipo": ["tutor", "anfitriao", "tutor"],
                "data_cadastro": pd.to_datetime(["2024-01-01", "2024-02-15", "2024-02-20"])
            })

        if nome_tabela == "pets":
            return pd.DataFrame({
                "id_pet": [1, 2, 3, 4, 5],
                "id_tutor": [1, 2, 3, 1, 2],
                "nome": ["Rex", "Mimi", "Louro", "Bolt", "Nina"],
                "especie": ["Cachorro", "Gato", "Silvestre", "Cachorro", "Gato"],
                "raca": ["Labrador", "Siamês", "Papagaio", "Vira-lata", "Persa"],
                "idade": [3, 2, 5, 1, 4],
            })

        if nome_tabela == "reservas":
            return pd.DataFrame({
                "id_reserva": [1, 2, 3],
                "id_tutor": [1, 3, 2],
                "id_anfitriao": [2, 2, 3],
                "status": ["pendente", "confirmada", "concluida"]
            })

        if nome_tabela == "avaliacoes":
            return pd.DataFrame({
                "id_avaliacao": [1, 2, 3],
                "id_reserva": [1, 2, 3],
                "nota": [5, 4, 3],
                "comentario": ["Ótimo serviço", "Bom atendimento", "Razoável"]
            })

        if nome_tabela == "anfitrioes":
            return pd.DataFrame({
                "id_anfitriao": [2, 3],
                "descricao": ["Casa grande com quintal", "Apartamento pet friendly"],
                "capacidade_maxima": [3, 2],
                "status": ["ativo", "pendente"]
            })

        return pd.DataFrame()


# =====================================================================
# 🧹 Limpeza automática para evitar erro do SQLite
# =====================================================================
def preparar_dataframe(df):
    df = df.copy()
    for col in df.columns:
        if df[col].apply(lambda x: isinstance(x, list)).any():
            df[col] = df[col].apply(lambda x: json.dumps(
                x) if isinstance(x, list) else x)
    return df


# =====================================================================
# 🧩 Sidebar
# =====================================================================
st.sidebar.header("📋 Selecione a Tabela")
tabela_escolhida = st.sidebar.selectbox(
    "Escolha uma tabela para visualizar:",
    ["usuarios", "anfitrioes", "pets", "reservas", "avaliacoes"]
)


# =====================================================================
# 📦 Carrega e prepara os dados
# =====================================================================
df = carregar_tabela(tabela_escolhida)
df = preparar_dataframe(df)


# =====================================================================
# 📊 Análises por tabela
# =====================================================================

# ---------------------------------------------------------------------
# PETS
# ---------------------------------------------------------------------
if tabela_escolhida == "pets" and not df.empty:
    st.markdown("## 🐾 Análise de Dados - Pets")

    df["especie"] = df["especie"].astype(str).str.title()
    df["raca"] = df["raca"].astype(str).str.title()

    col1, col2, col3 = st.columns(3)
    col1.metric("🐾 Total de Pets", len(df))
    col2.metric("🌿 Espécies Únicas", df["especie"].nunique())
    col3.metric("🏷️ Raças Únicas", df["raca"].nunique())

    especies_count = df["especie"].value_counts()

    if len(especies_count) > 1:
        fig, ax = plt.subplots(figsize=(6, 6))
        ax.pie(especies_count, labels=especies_count.index,
               autopct='%1.1f%%', startangle=90,
               colors=plt.cm.Pastel1.colors)
        ax.set_title("Distribuição por Espécie")
        ax.axis("equal")
        st.pyplot(fig)
    else:
        st.info(f"Apenas a espécie {especies_count.index[0]} está registrada.")


# ---------------------------------------------------------------------
# AVALIAÇÕES
# ---------------------------------------------------------------------
elif tabela_escolhida == "avaliacoes" and not df.empty:
    st.markdown("### 📊 Avaliações - Distribuição de Notas")

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(df["nota"], bins=range(1, 7), color="orange", edgecolor="black")
    ax.set_title("Distribuição de Notas")
    st.pyplot(fig)


# ---------------------------------------------------------------------
# RESERVAS
# ---------------------------------------------------------------------
elif tabela_escolhida == "reservas" and not df.empty:
    st.markdown("### 📊 Reservas - Status")

    status_count = df["status"].value_counts()
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(status_count.index, status_count.values,
           color=["#ff9999", "#66b3ff", "#99ff99"])
    ax.set_title("Quantidade de Reservas por Status")
    st.pyplot(fig)


# ---------------------------------------------------------------------
# USUÁRIOS
# ---------------------------------------------------------------------
elif tabela_escolhida == "usuarios" and not df.empty:

    st.markdown("## 👥 Análise de Usuários")
    st.divider()

    # 1️⃣ Evolução dos cadastros
    st.markdown("### 📅 Cadastros por Mês")

    df_sql = sqldf("""
        SELECT
            CAST(strftime('%m', data_cadastro) AS INTEGER) AS MES,
            COUNT(id_usuario) AS usuarios
        FROM df
        WHERE data_cadastro IS NOT NULL
        GROUP BY MES
        ORDER BY MES
    """)

    df_sql["MES"] = df_sql["MES"].astype(int)

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(df_sql["MES"], df_sql["usuarios"],
            marker="o", linewidth=2, color="steelblue")

    ax.set_xlabel("Mês")
    ax.set_ylabel("Usuários")
    ax.set_title("Quantidade de Usuários por Mês")
    ax.set_xticks(df_sql["MES"])
    st.pyplot(fig)

    st.divider()

    # 2️⃣ Distribuição por Tipo
    st.markdown("### 🧩 Tipos de Usuário")

    tipo_count = df["tipo"].value_counts()

    fig, ax = plt.subplots(figsize=(4, 4))
    ax.pie(tipo_count, labels=tipo_count.index,
           autopct="%1.1f%%", startangle=90)
    ax.set_title("Distribuição por Tipo de Usuário")
    st.pyplot(fig)

    st.divider()

    # 3️⃣ Distribuição por Estado
    st.markdown("### 🗺️ Usuários por Estado")

    if "uf" in df.columns:
        df["uf"] = df["uf"].astype(str).str.strip().str.upper()
        uf_count = df["uf"].value_counts().head(10)

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.bar(uf_count.index, uf_count.values, color="teal")
        ax.set_title("Usuários por Estado (Top 10)")
        st.pyplot(fig)

    else:
        st.info("Nenhum dado de UF disponível.")
