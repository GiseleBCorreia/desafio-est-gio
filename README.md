# Minha Solução - Banco Lux

## Stack

- **Backend:** Python 3.10+ (Flask)
- **Frontend:** HTML/CSS/JS puro (vanilla)

## Pré-requisitos / dependências

- Python 3.10 ou superior instalado
- pip
- Navegador moderno (Chrome, Firefox, Edge)

Para instalar as dependências do backend:
```
cd backend
pip install -r requirements.txt
```

Não há dependências no frontend — é HTML/CSS/JS puro, sem necessidade de instalação.

## Como executar

### Backend (API)

```
cd backend
pip install -r requirements.txt
py app.py
```

A API sobe em **http://localhost:5000**.

### Frontend

```
# Basta abrir o arquivo no navegador:
frontend/index.html
```

Não é necessário nenhum servidor adicional pode ser aberto diretamente clicando duas vezes no arquivo, ou com a extensão "Live Server" do VS Code.

⚠️ **Importante:** o backend precisa estar rodando antes de usar o frontend, já que o frontend consome a API em `http://localhost:5000`.

## Exemplo de uso

1. Com o backend rodando, abra o `frontend/index.html` no navegador.
2. Na aba **Nova Conta**, crie uma conta corrente com titular "Ana Lima" e saldo inicial de R$ 100,00.
3. A aba **Contas** mostra a conta criada com seu ID.
4. Na aba **Saque**, informe o ID da conta e um valor (ex.: R$ 50,00). O sistema cobra a tarifa de R$ 1,00 (regra da conta corrente) e retorna o saldo atualizado.
5. Na aba **Transferência** *(diferencial)*, informe o ID de duas contas e um valor — a operação debita da origem (com tarifa, se for corrente) e credita o valor na conta destino, retornando os nomes dos titulares envolvidos, o valor transferido, a tarifa e o valor total debitado.

## Observações

- Os dados são armazenados em memória (sem banco de dados), conforme escopo do desafio, reiniciar o backend limpa as contas criadas.
- Regras de negócio implementadas e testadas:
  - **R1 — Conta Corrente:** tarifa de R$ 1,00 por saque/transferência; saldo pode ficar negativo até o limite de R$ 500,00 (valor + tarifa não podem ultrapassar esse limite).
  - **R2 — Conta Poupança:** sem tarifa; saldo nunca pode ficar negativo.
- A transferência foi implementada e retorna o nome dos titulares de origem/destino..
- A lógica de negócio está isolada em `backend/models.py` (classe `Conta`), separada das rotas HTTP em `backend/app.py`, para manter responsabilidades bem definidas.
