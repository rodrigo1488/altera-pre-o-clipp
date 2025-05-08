from flask import Flask, request, jsonify, render_template, Blueprint
import fdb
import sqlite3
import os
import datetime

Database_bp = Blueprint('Database_bp', __name__)


# Configuração do Firebird
DATABASE_CONFIG = {
    "host": "localhost",  # Ou IP do servidor Firebird
    "database": r"C:\Program Files (x86)\CompuFour\Clipp\Base\CLIPP.FDB",
    "user": "SYSDBA",
    "password": "masterkey",
    "charset": "UTF8"
}

# Caminho do arquivo de contagem
datetime.datetime.now().strftime("%d-%m-%Y %H:%M")

diretorio = "C:/contagem_estoque"
if not os.path.exists(diretorio):
    os.makedirs(diretorio)

CAMINHO_ARQUIVO = os.path.join(diretorio, f"contagem_estoque_{datetime.datetime.now().strftime("%d-%m-%Y %H:%M")}.txt")


# Caminho do banco local
CAMINHO_DB_LOCAL = "contagem_estoque.db"


# Criar banco e tabela, se não existirem
def inicializar_banco():
    conn = sqlite3.connect(CAMINHO_DB_LOCAL)
    cur = conn.cursor()
    cur.execute("""
            CREATE TABLE IF NOT EXISTS contagem_estoque (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT,
            codigo_barras TEXT UNIQUE,
            quantidade INTEGER,
            preco REAL,
            qnt_sist INTERGER,
            nome_user TEXT,
            data_hora timestamp
                
        
        )
    """)
    conn.commit()
    conn.close()

# Conectar ao banco Firebird
def conectar_firebird():
    try:
        conn = fdb.connect(
            host=DATABASE_CONFIG["host"],
            database=DATABASE_CONFIG["database"],
            user=DATABASE_CONFIG["user"],
            password=DATABASE_CONFIG["password"],
            charset=DATABASE_CONFIG["charset"]
        )
        
        return conn
    except Exception as e:
        
        return None
