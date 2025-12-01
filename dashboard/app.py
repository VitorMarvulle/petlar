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
    ["usuarios", "anfitrioes", "pets"]
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
# USUÁRIOS
# ---------------------------------------------------------------------
elif tabela_escolhida == "usuarios" and not df.empty:
    st.markdown("## 👥 Análise de Usuários")

    st.divider()

    # ======================================================
    # 1️⃣ Evolução dos cadastros por mês (gráfico de linha)
    # ======================================================
    st.markdown("### 📊 Usuários - Quantidade de Usuários (Últimos 3 Meses)")

    # --- Consulta SQL: filtrar pelos últimos 3 meses mantendo o dia
    df_sql = sqldf("""
        SELECT 
            strftime('%Y-%m', data_cadastro) AS MES_ANO,
            COUNT(id_usuario) AS usuarios
        FROM df
        WHERE data_cadastro IS NOT NULL
        AND DATE(data_cadastro) >= DATE((SELECT MAX(data_cadastro) FROM df), '-3 months')
        GROUP BY MES_ANO
        ORDER BY MES_ANO
    """)

    # Converter MES_ANO para datetime (primeiro dia do mês)
    df_sql['MES_ANO'] = pd.to_datetime(df_sql['MES_ANO'], format='%Y-%m')

    # --- Gráfico de Linhas ---
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(df_sql['MES_ANO'], df_sql['usuarios'], marker='o',
            linewidth=2, markersize=8, color='steelblue')

    # Adiciona valores sobre os pontos
    for x, y in zip(df_sql['MES_ANO'], df_sql['usuarios']):
        ax.text(x, y + 0.5, str(int(y)), ha='center',
                va='bottom', fontsize=10, fontweight='bold')

    # Formatar eixo X
    import matplotlib.dates as mdates
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%Y'))
    plt.xticks(rotation=45)

    # Títulos e rótulos
    ax.set_xlabel('Data (Mês/Ano)', fontsize=8)
    ax.set_ylabel('Quantidade de Usuários', fontsize=10)
    ax.set_title('Quantidade de Usuários por Mês – Últimos 4 Meses',
                 fontsize=12, fontweight='bold', pad=16)

    # Forçar números inteiros no eixo Y
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

# ---------------------------------------------------------------------
# ANFITRIÕES
# ---------------------------------------------------------------------
elif tabela_escolhida == "anfitrioes" and not df.empty:
    st.markdown("## 🏠 Análise de Anfitriões")

    # ----------------------------
    # 1️⃣ Distribuição por status
    # ----------------------------
    status_count = df["status"].value_counts()
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.pie(
        status_count,
        labels=status_count.index,
        autopct='%1.1f%%',
        startangle=90,
        colors=plt.cm.Pastel2.colors,
        textprops=dict(color="black", fontsize=12, weight='bold')
    )
    ax.set_title("Distribuição por Status do Anfitrião",
                 fontsize=16, weight='bold', pad=20)
    ax.axis("equal")
    st.pyplot(fig)
    st.divider()

    # --------------------------------
    # 2️⃣ Capacidade máxima (histograma)
    # --------------------------------
    fig, ax = plt.subplots(figsize=(8, 5))
    df['capacidade_maxima'].dropna().plot(
        kind='hist',
        bins=range(1, int(df['capacidade_maxima'].max()) + 2),
        color='steelblue',
        edgecolor='black',
        ax=ax
    )
    ax.set_xlabel('Capacidade Máxima', fontsize=12)
    ax.set_ylabel('Quantidade de Anfitriões', fontsize=12)
    ax.set_title('Distribuição da Capacidade Máxima dos Anfitriões',
                 fontsize=16, weight='bold', pad=20)
    st.pyplot(fig)
    st.divider()

    # --------------------------------
    # 3️⃣ Distribuição por tamanho de pet
    # --------------------------------
    tamanho_count = df['tamanho_pet'].value_counts()
    fig, ax = plt.subplots(figsize=(8, 5))
    tamanho_count.plot(kind='bar', color='coral', ax=ax)
    ax.set_xlabel('Tamanho do Pet', fontsize=12)
    ax.set_ylabel('Quantidade de Anfitriões', fontsize=12)
    ax.set_title('Distribuição por Tamanho de Pet Aceito',
                 fontsize=16, weight='bold', pad=20)
    ax.bar_label(ax.containers[0], padding=4, fontsize=11, weight='bold')
    st.pyplot(fig)
    st.divider()

    # --------------------------------
    # 4️⃣ Distribuição por espécie
    # --------------------------------
    especies = df['especie'].dropna().explode()
    especie_count = especies.value_counts()
    fig, ax = plt.subplots(figsize=(8, 5))
    especie_count.plot(kind='bar', color='mediumseagreen', ax=ax)
    ax.set_xlabel('Espécie', fontsize=12)
    ax.set_ylabel('Quantidade de Anfitriões', fontsize=12)
    ax.set_title('Distribuição por Espécie Aceita',
                 fontsize=16, weight='bold', pad=20)
    ax.bar_label(ax.containers[0], padding=4, fontsize=11, weight='bold')
    st.pyplot(fig)
    st.divider()

    # --------------------------------
    # 5️⃣ Preço médio por status
    # --------------------------------
    preco_medio = df.groupby('status')['preco'].mean().dropna()
    fig, ax = plt.subplots(figsize=(8, 5))
    preco_medio.plot(kind='bar', color='mediumpurple', ax=ax)
    ax.set_xlabel('Status', fontsize=12)
    ax.set_ylabel('Preço Médio', fontsize=12)
    ax.set_title('Preço Médio dos Anfitriões por Status',
                 fontsize=16, weight='bold', pad=20)
    ax.bar_label(ax.containers[0], padding=4, fontsize=11, weight='bold')
    st.pyplot(fig)
    st.divider()

    # --------------------------------
    # 6️⃣ Análises relacionadas a reservas
    # --------------------------------
    if 'reservas' in globals() and not reservas.empty:
        st.markdown("### 📅 Análises de Reservas")

        # Reservas por status
        reservas_status = reservas.groupby('id_anfitriao')[
            'status'].value_counts().unstack(fill_value=0)
        st.markdown("**Reservas por Status:**")
        st.dataframe(reservas_status)

        # Valor médio de reservas por anfitrião
        valor_medio = reservas.groupby('id_anfitriao')[
            'valor_total_reserva'].mean()
        st.markdown("**Valor médio das reservas por anfitrião:**")
        st.dataframe(valor_medio)
        st.divider()

    # --------------------------------
    # 7️⃣ Análises relacionadas a avaliações
    # --------------------------------
    if 'avaliacoes' in globals() and not avaliacoes.empty:
        st.markdown("### ⭐ Análises de Avaliações")

        # Nota média por anfitrião
        nota_media = avaliacoes.groupby('id_avaliado')['nota'].mean()
        st.markdown("**Nota média por anfitrião:**")
        st.dataframe(nota_media)

        # Contagem de avaliações por nota
        nota_count = avaliacoes['nota'].value_counts().sort_index()
        fig, ax = plt.subplots(figsize=(8, 5))
        nota_count.plot(kind='bar', color='gold', ax=ax)
        ax.set_xlabel('Nota', fontsize=12)
        ax.set_ylabel('Quantidade de Avaliações', fontsize=12)
        ax.set_title('Distribuição de Avaliações por Nota',
                     fontsize=16, weight='bold', pad=20)
        ax.bar_label(ax.containers[0], padding=4, fontsize=11, weight='bold')
        st.pyplot(fig)
        st.divider()

    # --------------------------------
    # 8️⃣ Perguntas enviadas
    # --------------------------------
    if 'perguntas' in globals() and not perguntas.empty:
        st.markdown("### ❓ Perguntas Enviadas aos Anfitriões")
        perguntas_count = perguntas.groupby(
            'id_anfitriao')['id_pergunta'].count()
        st.dataframe(perguntas_count.rename("Quantidade de Perguntas"))
