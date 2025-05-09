from flask import Blueprint, request, jsonify
import sqlite3
import datetime

from Routes.buscar_descricao import buscar_descricao_firebird
from Routes.route_buscar_produto import buscar_produto
from databases import CAMINHO_DB_LOCAL
from databases import conectar_firebird

Route_salvar_bp = Blueprint('Route_salvar_bp', __name__)

@Route_salvar_bp.route('/salvar', methods=['POST'])
@Route_salvar_bp.route('/salvar/<nome_usuario>', methods=['POST'])
def salvar_estoque(nome_usuario=None):
    try:
        data = request.get_json()
        if not data or "codigo_barras" not in data or "quantidade" not in data :
            return jsonify({"message": "Dados inválidos"}), 400

        codigo_barras = data["codigo_barras"].strip()
        quantidade = float(data["quantidade"])
        nome_usuario = nome_usuario.strip() if nome_usuario else "Desconhecido"
        preco = data.get("preco", 0.0)
        ID_ESTOQUE = data.get("id")
        print(ID_ESTOQUE)


        # Buscar a descrição e quantidade no Firebird
        produto = buscar_descricao_firebird(ID_ESTOQUE)

        if not produto:
            return jsonify({"message": "Produto não encontrado no Firebird"}), 404
        descricao = produto["descricao"]
        quantidade_sist = float(produto["quantidade_sist"])
        # Salvar no banco SQLite
        conn = sqlite3.connect(CAMINHO_DB_LOCAL)
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO contagem_estoque (descricao, codigo_barras, quantidade, qnt_sist, nome_user,preco, data_hora)
                VALUES (?, ?, ?, ?, ?, ?,?)
                ON CONFLICT(codigo_barras) DO UPDATE
                SET quantidade = quantidade + excluded.quantidade,
                    qnt_sist = excluded.qnt_sist,
                    nome_user = excluded.nome_user,
                    preco = excluded.preco,
                    data_hora = excluded.data_hora
            """, (descricao, codigo_barras, quantidade, quantidade_sist, nome_usuario,preco, datetime.datetime.now().strftime("%d-%m-%Y %H:%M")))
            conn.commit()

        
            
            return jsonify({"message": "Salvo com sucesso"}), 200

        except sqlite3.Error as e:
            return jsonify({"message": "Erro ao salvar no banco", "error": str(e)}), 500
        finally:
            update_firebird(ID_ESTOQUE,preco,quantidade)
            conn.close()
    except Exception as e:
        print(f"Erro no servidor: {e}")
        return jsonify({"message": "Erro no servidor", "error": str(e)}), 500
    

def update_firebird(ID_ESTOQUE, preco, quantidade):
    try:
        conn = conectar_firebird()
        cur = conn.cursor()

        # Atualiza o preço na tabela TB_ESTOQUE
        query_preco = "UPDATE TB_ESTOQUE SET PRC_VENDA = ? WHERE ID_ESTOQUE = ?"
        cur.execute(query_preco, (preco, ID_ESTOQUE))

        # Atualiza a quantidade na tabela TB_EST_PRODUTO
        query_quantidade = "UPDATE TB_EST_PRODUTO SET QTD_ATUAL = ? WHERE ID_IDENTIFICADOR = ?"
        cur.execute(query_quantidade, (quantidade, ID_ESTOQUE))

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Erro ao atualizar no Firebird: {e}")
        return False
