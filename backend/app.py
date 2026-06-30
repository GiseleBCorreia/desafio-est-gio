from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Conta

app = Flask(__name__)
app.json.sort_keys = False
CORS(app)

# Armazenamento em memória
contas: dict[str, Conta] = {}


def erro(mensagem: str, status: int):
    return jsonify({"erro": mensagem}), status


# ──────────────────────────────────────────
# Rotas
# ──────────────────────────────────────────

@app.route("/contas", methods=["POST"])
def criar_conta():
    data = request.get_json(silent=True) or {}
    titular = data.get("titular", "").strip()
    tipo = data.get("tipo", "").strip().lower()
    saldo_inicial = data.get("saldo_inicial", 0)

    if not titular:
        return erro("O campo 'titular' é obrigatório.", 400)
    if tipo not in ("corrente", "poupanca"):
        return erro("O campo 'tipo' deve ser 'corrente' ou 'poupanca'.", 400)
    if not isinstance(saldo_inicial, (int, float)) or saldo_inicial < 0:
        return erro("O saldo inicial deve ser um número não negativo.", 400)

    conta = Conta(tipo=tipo, titular=titular, saldo=float(saldo_inicial))
    contas[conta.id] = conta
    return jsonify(conta.to_dict()), 201


@app.route("/contas", methods=["GET"])
def listar_contas():
    return jsonify([c.to_dict() for c in contas.values()])


@app.route("/contas/<conta_id>", methods=["GET"])
def buscar_conta(conta_id):
    conta = contas.get(conta_id)
    if not conta:
        return erro("Conta não encontrada.", 404)
    return jsonify(conta.to_dict())


@app.route("/contas/<conta_id>/sacar", methods=["POST"])
def sacar(conta_id):
    conta = contas.get(conta_id)
    if not conta:
        return erro("Conta não encontrada.", 404)

    data = request.get_json(silent=True) or {}
    valor = data.get("valor")

    if valor is None:
        return erro("O campo 'valor' é obrigatório.", 400)
    if not isinstance(valor, (int, float)) or valor <= 0:
        return erro("O valor deve ser um número positivo.", 400)

    try:
        resultado = conta.sacar(float(valor))
        return jsonify(resultado)
    except ValueError as e:
        return erro(str(e), 422)


@app.route("/transferencias", methods=["POST"])
def transferir():
    data = request.get_json(silent=True) or {}
    origem_id = data.get("origem_id", "").strip()
    destino_id = data.get("destino_id", "").strip()
    valor = data.get("valor")

    if not origem_id or not destino_id:
        return erro("Os campos 'origem_id' e 'destino_id' são obrigatórios.", 400)
    if valor is None:
        return erro("O campo 'valor' é obrigatório.", 400)
    if not isinstance(valor, (int, float)) or valor <= 0:
        return erro("O valor deve ser um número positivo.", 400)
    if origem_id == destino_id:
        return erro("Conta de origem e destino não podem ser a mesma.", 400)

    origem = contas.get(origem_id)
    destino = contas.get(destino_id)

    if not origem:
        return erro("Conta de origem não encontrada.", 404)
    if not destino:
        return erro("Conta de destino não encontrada.", 404)

    try:
        resultado = origem.transferir_para(destino, float(valor))
        return jsonify(resultado)
    except ValueError as e:
        return erro(str(e), 422)


if __name__ == "__main__":
    app.run(debug=True, port=5000)