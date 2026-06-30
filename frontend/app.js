const API = "http://localhost:5000";

// ── Navegação por abas ────────────────────────────────

function mostrarAba(nome) {
  document.querySelectorAll(".aba").forEach(el => el.classList.add("oculto"));
  document.querySelectorAll(".nav-btn").forEach(el => el.classList.remove("active"));

  document.getElementById("aba-" + nome).classList.remove("oculto");

  const btns = document.querySelectorAll(".nav-btn");
  const nomes = ["contas", "criar", "saque", "transferencia"];
  const idx = nomes.indexOf(nome);
  if (idx !== -1) btns[idx].classList.add("active");

  if (nome === "contas") listarContas();
}

// ── Helpers ──────────────────────────────────────────

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function exibirResultado(elementId, dados, sucesso) {
  const el = document.getElementById(elementId);
  el.className = "resultado " + (sucesso ? "sucesso" : "falha");

  if (!sucesso) {
    el.innerHTML = `<span>${dados.erro || "Erro desconhecido."}</span>`;
    return;
  }

  const camposTexto = ["origem", "destino", "titular", "tipo"];

  const linhas = Object.entries(dados)
    .filter(([chave]) => chave !== "mensagem")
    .map(([chave, valor]) => {
      const label = chave
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const exibir =
        typeof valor === "number" && !camposTexto.includes(chave)
          ? formatarMoeda(valor)
          : valor;
      return `<div class="res-linha">
        <span class="res-label">${label}</span>
        <span class="res-valor">${exibir}</span>
      </div>`;
    })
    .join("");

  const mensagemHtml = dados.mensagem
    ? `<div class="res-mensagem">${dados.mensagem}</div>`
    : "";

  el.innerHTML = linhas + mensagemHtml;
}

function limparResultado(elementId) {
  const el = document.getElementById(elementId);
  el.className = "resultado";
  el.innerHTML = "";
}

// ── Criar Conta ──────────────────────────────────────

async function criarConta() {
  limparResultado("resultado-criar");

  const titular = document.getElementById("titular").value.trim();
  const tipo = document.getElementById("tipo").value;
  const saldo_inicial =
    parseFloat(document.getElementById("saldo-inicial").value) || 0;

  if (!titular) {
    exibirResultado("resultado-criar", { erro: "Informe o nome do titular." }, false);
    return;
  }

  try {
    const res = await fetch(`${API}/contas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titular, tipo, saldo_inicial }),
    });
    const data = await res.json();

    if (!res.ok) {
      exibirResultado("resultado-criar", data, false);
      return;
    }

    exibirResultado(
      "resultado-criar",
      {
        mensagem: "Conta criada com sucesso!",
        id: data.id,
        titular: data.titular,
        tipo: data.tipo,
        saldo: data.saldo,
      },
      true
    );

    // Limpa os campos e redireciona para Contas
    document.getElementById("titular").value = "";
    document.getElementById("saldo-inicial").value = "";
    setTimeout(() => mostrarAba("contas"), 1200);
  } catch {
    exibirResultado(
      "resultado-criar",
      { erro: "Não foi possível conectar ao servidor. Verifique se o backend está rodando." },
      false
    );
  }
}

// ── Listar Contas ────────────────────────────────────

async function listarContas() {
  const container = document.getElementById("lista-contas");

  try {
    const res = await fetch(`${API}/contas`);
    const contas = await res.json();

    if (!contas.length) {
      container.innerHTML = '<p class="empty-state">Nenhuma conta criada ainda.</p>';
      return;
    }

    container.innerHTML = contas
      .map((c) => {
        const saldoClass =
          c.saldo < 0 ? "negativo" : c.saldo === 0 ? "zero" : "positivo";
        return `
          <div class="conta-item">
            <div class="conta-info">
              <span class="conta-titular">${c.titular}</span>
              <div class="conta-meta">
                <span class="tipo-badge ${c.tipo}">${
          c.tipo === "corrente" ? "Corrente" : "Poupança"
        }</span>
                <span>ID: <strong>${c.id}</strong></span>
              </div>
            </div>
            <span class="conta-saldo ${saldoClass}">${formatarMoeda(c.saldo)}</span>
          </div>`;
      })
      .join("");
  } catch {
    container.innerHTML =
      '<p class="empty-state">Erro ao carregar contas. Backend online?</p>';
  }
}

// ── Saque ─────────────────────────────────────────────

async function sacar() {
  limparResultado("resultado-saque");

  const id = document.getElementById("saque-id").value.trim();
  const valor = parseFloat(document.getElementById("saque-valor").value);

  if (!id) {
    exibirResultado("resultado-saque", { erro: "Informe o ID da conta." }, false);
    return;
  }
  if (!valor || valor <= 0) {
    exibirResultado("resultado-saque", { erro: "Informe um valor válido." }, false);
    return;
  }

  try {
    const res = await fetch(`${API}/contas/${id}/sacar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor }),
    });
    const data = await res.json();
    exibirResultado("resultado-saque", data, res.ok);
    if (res.ok) listarContas();
  } catch {
    exibirResultado(
      "resultado-saque",
      { erro: "Não foi possível conectar ao servidor." },
      false
    );
  }
}

// ── Transferência ─────────────────────────────────────

async function transferir() {
  limparResultado("resultado-transferencia");

  const origem_id = document.getElementById("trans-origem").value.trim();
  const destino_id = document.getElementById("trans-destino").value.trim();
  const valor = parseFloat(document.getElementById("trans-valor").value);

  if (!origem_id || !destino_id) {
    exibirResultado(
      "resultado-transferencia",
      { erro: "Informe os IDs de origem e destino." },
      false
    );
    return;
  }
  if (!valor || valor <= 0) {
    exibirResultado(
      "resultado-transferencia",
      { erro: "Informe um valor válido." },
      false
    );
    return;
  }

  try {
    const res = await fetch(`${API}/transferencias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem_id, destino_id, valor }),
    });
    const data = await res.json();
    exibirResultado("resultado-transferencia", data, res.ok);
    if (res.ok) listarContas();
  } catch {
    exibirResultado(
      "resultado-transferencia",
      { erro: "Não foi possível conectar ao servidor." },
      false
    );
  }
}