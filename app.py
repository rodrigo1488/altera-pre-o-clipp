import sys
import threading
import requests
from flask import Flask, render_template, request, jsonify
import pystray
from pystray import MenuItem as item, Icon
from PIL import Image
from waitress import serve

from Routes.route_buscar_produto import Route_buscar_produto_bp
from Routes.route_salvar import Route_salvar_bp
from Routes.route_excluir import Route_excluir_bp
from Routes.route_editar import Route_editar_bp
from Routes.route_listar_contagem import Route_listar_contagem_bp
from Routes.buscar_descricao import Buscar_descricao_bp
from Routes.check_healt import CheckHealth_bp
from databases import Database_bp
from databases import inicializar_banco
from databases import conectar_firebird
from databases import DATABASE_CONFIG

SUPABASE_URL = "https://warcagsmsewuvioxebur.supabase.co"
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcmNhZ3Ntc2V3dXZpb3hlYnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzkyODIsImV4cCI6MjA1ODg1NTI4Mn0.KjArHtZ3FLDrJILLTQ8eL9mYJrgI-K35nawCpOrragY"

app = Flask(__name__)

# def obter_serial_firebird():
#     try:
#         con = conectar_firebird()
#         if con is None:
#             return None
#         cur = con.cursor()
#         cur.execute("SELECT NSE_CLIPP FROM RDB$SUP")
#         row = cur.fetchone()
#         con.close()
#         return row[0].strip() if row else None
#     except Exception as e:
#         print(f"Erro ao obter serial do Firebird: {e}")
#         return None

# def validar_serial(serial):
#     url = f"{SUPABASE_URL}/rest/v1/users?serial=eq.{serial}&select=status"
#     headers = {"apikey": SUPABASE_API_KEY, "Authorization": f"Bearer {SUPABASE_API_KEY}", "Content-Type": "application/json"}
#     response = requests.get(url, headers=headers)
#     if response.status_code == 200:
#         data = response.json()
#         if data and isinstance(data, list) and len(data) > 0:
#             return data[0].get("status") is True
#     return False

# @app.before_request
# def verificar_acesso():
#     try:
#         serial = obter_serial_firebird()
#         if not serial or not validar_serial(serial):
#             return jsonify({"erro": "Acesso negado. Serial invalido ou nao autorizado."}), 403
#     except Exception as e:
#         return jsonify({"erro": f"Erro interno ao verificar o acesso: {str(e)}"}), 500

@app.route("/")
def index():
    return render_template("index.html")
app.register_blueprint(CheckHealth_bp)
app.register_blueprint(Route_buscar_produto_bp)
app.register_blueprint(Route_excluir_bp)
app.register_blueprint(Route_listar_contagem_bp)
app.register_blueprint(Buscar_descricao_bp)
app.register_blueprint(Route_editar_bp)
app.register_blueprint(Route_salvar_bp)
app.register_blueprint(Database_bp)

inicializar_banco()

def run_flask():
    app.run(debug=True, host='0.0.0.0', port=5000)

##def run_flask():
    ##serve(app,debug=False, host='0.0.0.0', port=5000, use_reloader=False)

def load_icon():
    return Image.open("icon.ico")  # Certifique-se de ter um arquivo 'icon.ico' no diretório

def on_exit(icon, item):
    icon.stop()
    sys.exit()

def run_tray():
    icon = Icon("ServidorFlask", load_icon(), title="Servidor Flask", menu=(
        item('Reiniciar', lambda _: run_flask()),
        item('Sair', on_exit)
    ))    
    icon.run()

# if __name__ == "__main__":
#     flask_thread = threading.Thread(target=run_flask, daemon=True)
#     flask_thread.start()
#     run_tray()

if __name__ == "__main__":
    run_flask()