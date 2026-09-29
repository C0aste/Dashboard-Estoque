let dadosGrupos = [];
let historicosMovimentacoes = [];
let buscaTimeout;
let tipoSelecionado = "MATERIAL";
let modoVisualizacao = "TABELA";
let graficos = {};

$(document).ready(function () {
    inicializar();
});

function inicializar() {
    atualizarInterface();
    atualizarFiltroVisual();
    carregarDados();

    $("#buscaItem").on("input", function () {
        const busca = $(this).val().trim();
        clearTimeout(buscaTimeout);
        buscaTimeout = setTimeout(() => carregarDados(busca), 300);
    });

    $(".tipo-filtro").on("click", function () {
        tipoSelecionado = $(this).data("tipo");
        atualizarInterface();
        atualizarFiltroVisual();
        carregarDados($("#buscaItem").val().trim());
    });

    $("#btnDashboard").on("click", alternarDashboard);
    $("#btnHistoricos").on("click", abrirModalHistoricos);
    $("#fecharHistoricos").on("click", fecharModalHistoricos);
    $("#fecharHistorico").on("click", fecharModalHistorico);

    $("#modalHistoricos, #modalHistorico").on("click", function (event) {
        if (event.target === this) $(this).removeClass("flex").addClass("hidden");
    });

    $("#btnConsultarHistoricos").on("click", carregarHistoricos);
    $("#buscaHistoricos").on("input", renderizarHistoricosFiltrados);
}

function carregarDados(busca = "") {
    mostrarLoadingPagina();
    mostrarCarregando();

    let grupos = [];

    if (tipoSelecionado === "TODOS") {
        grupos = [
            ...normalizarMateriais(DADOS_MOCK.MATERIAL),
            ...normalizarEpi(DADOS_MOCK.EPI),
            ...normalizarAtivos(DADOS_MOCK.ATIVO)
        ];
    } else if (tipoSelecionado === "MATERIAL") {
        grupos = normalizarMateriais(DADOS_MOCK.MATERIAL);
    } else if (tipoSelecionado === "EPI") {
        grupos = normalizarEpi(DADOS_MOCK.EPI);
    } else {
        grupos = normalizarAtivos(DADOS_MOCK.ATIVO);
    }

    if (busca) {
        const termo = busca.toLowerCase();
        grupos = grupos.map(grupo => ({
            ...grupo,
            itens: grupo.itens.filter(item => {
                const valores = [grupo.codigo, grupo.nome, item.ItemCode, item.ItemName, item.NOME];
                return valores.some(valor => String(valor || "").toLowerCase().includes(termo));
            })
        })).filter(grupo => grupo.itens.length || grupo.nome.toLowerCase().includes(termo) || grupo.codigo.toLowerCase().includes(termo));
    }

    dadosGrupos = grupos;
    atualizarResumo();
    renderizarGrupos();

    if (modoVisualizacao === "GRAFICOS") atualizarGraficos();

    esconderLoadingPagina();
}

function normalizarMateriais(materiais) {
    return materiais.map(grupo => ({
        tipo: "MATERIAL",
        codigo: grupo.WhsCode,
        nome: grupo.WhsName,
        totalItens: grupo.itens?.length || 0,
        quantidade: calcularQuantidade(grupo.itens),
        valorTotal: Number(grupo.ValorTotal) || 0,
        itens: grupo.itens || []
    }));
}

function normalizarEpi(epis) {
    return epis.map(grupo => ({
        tipo: "EPI",
        codigo: grupo.WhsCode,
        nome: grupo.WhsName,
        totalItens: grupo.itens?.length || 0,
        quantidade: calcularQuantidade(grupo.itens),
        valorTotal: Number(grupo.ValorTotal) || 0,
        itens: grupo.itens || []
    }));
}

function normalizarAtivos(ativos) {
    return ativos.map(grupo => ({
        tipo: "ATIVO",
        codigo: grupo.CC,
        nome: grupo.NAMECC,
        codAprovador: grupo.COD_APROVADOR,
        nomeAprovador: grupo.NOME_APROVADOR,
        codUsuario: grupo.COD_USUARIO,
        totalItens: grupo.itens?.length || 0,
        quantidade: grupo.itens?.length || 0,
        valorTotal: (grupo.itens || []).reduce((total, item) => total + (Number(item.VALOR_INICIAL) || 0), 0),
        itens: (grupo.itens || []).map(item => ({
            ItemCode: item.COD,
            ItemName: item.NOME,
            ValidFrom: item.VALIDF,
            ValidTo: item.VALIDT,
            ValorInicial: Number(item.VALOR_INICIAL) || 0,
            ValorRestante: Number(item.VALOR_RESTANTE) || 0
        }))
    }));
}

function atualizarInterface() {
    const configuracoes = {
        TODOS: {
            controle: "CONTROLE DE ATIVOS E ESTOQUE",
            titulo: "Ativos e Estoque",
            descricao: "Visão consolidada dos registros demonstrativos.",
            grupo: "Locais",
            itens: "Itens",
            tabelaGrupo: "Local",
            busca: "Buscar local, código ou item...",
            tabelaTitulo: "Ativos e Estoque",
            tabelaDescricao: "Registros organizados por local e categoria."
        },
        MATERIAL: {
            controle: "CONTROLE DE ESTOQUE",
            titulo: "Materiais",
            descricao: "Visualização dos materiais disponíveis nos depósitos.",
            grupo: "Depósitos",
            itens: "Itens",
            tabelaGrupo: "Depósito",
            busca: "Buscar depósito, código ou item...",
            tabelaTitulo: "Materiais em Estoque",
            tabelaDescricao: "Materiais disponíveis organizados por depósito."
        },
        ATIVO: {
            controle: "CONTROLE DE ATIVOS",
            titulo: "Ativos",
            descricao: "Visualização dos ativos vinculados aos centros de custo.",
            grupo: "Centros de Custos",
            itens: "Ativos",
            tabelaGrupo: "Centro de Custo",
            busca: "Buscar centro de custo, código ou ativo...",
            tabelaTitulo: "Ativos",
            tabelaDescricao: "Ativos organizados por centro de custo."
        },
        EPI: {
            controle: "CONTROLE DE EPI E UNIFORMES",
            titulo: "EPI e Uniformes",
            descricao: "Visualização de EPIs e uniformes disponíveis.",
            grupo: "Locais",
            itens: "Itens",
            tabelaGrupo: "Depósito",
            busca: "Buscar depósito, código ou item...",
            tabelaTitulo: "EPIs e Uniformes",
            tabelaDescricao: "EPIs e uniformes organizados por depósito."
        }
    };

    const config = configuracoes[tipoSelecionado];

    $("#tituloControle").text(config.controle);
    $("#tituloDashboard").text(config.titulo);
    $("#descricaoDashboard").text(config.descricao);
    $("#labelGrupo").text(config.grupo);
    $("#labelItens").text(config.itens);
    $("#labelTabelaGrupo").text(config.tabelaGrupo);
    $("#buscaItem").attr("placeholder", config.busca);
    $("#tituloTabela").text(config.tabelaTitulo);
    $("#descricaoTabela").text(config.tabelaDescricao);
}

function atualizarFiltroVisual() {
    $(".tipo-filtro").removeClass("bg-primary text-white").addClass("bg-white border border-gray-200 text-gray-600");
    $(`.tipo-filtro[data-tipo="${tipoSelecionado}"]`).removeClass("bg-white border border-gray-200 text-gray-600").addClass("bg-primary text-white");
}

function atualizarResumo() {
    let totalItens = 0;
    let totalQuantidade = 0;
    let valorMateriais = 0;
    let valorEpi = 0;
    let valorAtivos = 0;

    dadosGrupos.forEach(grupo => {
        totalItens += grupo.itens.length;
        totalQuantidade += Number(grupo.quantidade) || 0;

        if (grupo.tipo === "MATERIAL") valorMateriais += grupo.valorTotal;
        if (grupo.tipo === "EPI") valorEpi += grupo.valorTotal;
        if (grupo.tipo === "ATIVO") valorAtivos += grupo.valorTotal;
    });

    $("#totalDepositos").text(dadosGrupos.length);
    $("#totalItens").text(totalItens);
    $("#totalQuantidade").text(totalQuantidade.toLocaleString("pt-BR"));

    if (tipoSelecionado === "TODOS") {
        $("#cardValorEstoque").addClass("hidden");
        $("#cardValorMateriais, #cardValorEpi, #cardValorAtivos, #cardValorTotal").removeClass("hidden");
        $("#valorMateriais").text(formatarMoeda(valorMateriais));
        $("#valorEpi").text(formatarMoeda(valorEpi));
        $("#valorAtivos").text(formatarMoeda(valorAtivos));
        $("#valorTotal").text(formatarMoeda(valorMateriais + valorEpi + valorAtivos));
        return;
    }

    $("#cardValorEstoque").removeClass("hidden");
    $("#cardValorMateriais, #cardValorEpi, #cardValorAtivos, #cardValorTotal").addClass("hidden");

    const valores = {
        MATERIAL: [valorMateriais, "Valor em estoque"],
        EPI: [valorEpi, "Valor de EPI e uniformes"],
        ATIVO: [valorAtivos, "Valor dos ativos"]
    };

    const [valor, label] = valores[tipoSelecionado];
    $("#valorEstoque").text(formatarMoeda(valor));
    $("#labelValorEstoque").text(label);
}

function alternarDashboard() {
    modoVisualizacao = modoVisualizacao === "TABELA" ? "GRAFICOS" : "TABELA";

    $("#dashboardGraficos").toggleClass("hidden", modoVisualizacao !== "GRAFICOS");
    $("#tabelaDashboard").toggleClass("hidden", modoVisualizacao === "GRAFICOS");

    $("#btnDashboard")
        .toggleClass("bg-primary text-white border-primary", modoVisualizacao === "GRAFICOS")
        .toggleClass("bg-white text-gray-600 border-gray-200", modoVisualizacao !== "GRAFICOS");

    if (modoVisualizacao === "GRAFICOS") atualizarGraficos();
}

function atualizarGraficos() {
    if (typeof Chart === "undefined") return;

    destruirGraficos();
    atualizarDescricaoGraficos();

    if (tipoSelecionado === "TODOS") {
        $("#graficosTodos").removeClass("hidden");
        renderizarGraficoTipos();
        renderizarGraficoValoresTipos();
    } else {
        $("#graficosTodos").addClass("hidden");
    }

    renderizarGraficoRanking();
    renderizarGraficoQuantidade();
}

function atualizarDescricaoGraficos() {
    const descricoes = {
        TODOS: "Visão consolidada dos registros demonstrativos.",
        MATERIAL: "Análise dos materiais distribuídos pelos depósitos.",
        EPI: "Análise dos EPIs e uniformes distribuídos.",
        ATIVO: "Análise dos ativos vinculados aos centros de custo."
    };

    $("#descricaoGraficos").text(descricoes[tipoSelecionado]);
}

function renderizarGraficoTipos() {
    const dados = { materiais: 0, epi: 0, ativos: 0 };

    dadosGrupos.forEach(grupo => {
        const quantidade = grupo.itens.length;
        if (grupo.tipo === "MATERIAL") dados.materiais += quantidade;
        if (grupo.tipo === "EPI") dados.epi += quantidade;
        if (grupo.tipo === "ATIVO") dados.ativos += quantidade;
    });

    graficos.tipos = new Chart(document.getElementById("graficoTipos"), {
        type: "doughnut",
        data: {
            labels: ["Materiais", "EPI e Uniformes", "Ativos"],
            datasets: [{ data: [dados.materiais, dados.epi, dados.ativos], backgroundColor: ["#03a10e", "#8b5cf6", "#3b82f6"], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });
}

function renderizarGraficoValoresTipos() {
    const valores = { materiais: 0, epi: 0, ativos: 0 };

    dadosGrupos.forEach(grupo => {
        if (grupo.tipo === "MATERIAL") valores.materiais += grupo.valorTotal;
        if (grupo.tipo === "EPI") valores.epi += grupo.valorTotal;
        if (grupo.tipo === "ATIVO") valores.ativos += grupo.valorTotal;
    });

    graficos.valoresTipos = new Chart(document.getElementById("graficoValoresTipos"), {
        type: "bar",
        data: {
            labels: ["Materiais", "EPI e Uniformes", "Ativos"],
            datasets: [{ label: "Valor", data: [valores.materiais, valores.epi, valores.ativos], backgroundColor: "#03a10e", borderRadius: 8 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => formatarMoeda(context.raw) } } },
            scales: { y: { beginAtZero: true, ticks: { callback: valor => formatarMoeda(valor) } } }
        }
    });
}

function renderizarGraficoRanking() {
    const grupos = dadosGrupos.slice().sort((a, b) => b.valorTotal - a.valorTotal).slice(0, 10);
    const labels = grupos.map(grupo => `${grupo.codigo} - ${grupo.nome}`);
    const valores = grupos.map(grupo => grupo.valorTotal);

    $("#tituloGraficoRanking").text(tipoSelecionado === "ATIVO" ? "Valores por centro de custo" : "Valores por local");

    graficos.ranking = new Chart(document.getElementById("graficoRanking"), {
        type: "bar",
        data: { labels, datasets: [{ label: "Valor", data: valores, backgroundColor: "#03a10e", borderRadius: 8 }] },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => formatarMoeda(context.raw) } } },
            scales: { x: { beginAtZero: true, ticks: { callback: valor => formatarMoeda(valor) } } }
        }
    });
}

function renderizarGraficoQuantidade() {
    const grupos = dadosGrupos.slice().sort((a, b) => b.quantidade - a.quantidade).slice(0, 10);
    const labels = grupos.map(grupo => `${grupo.codigo} - ${grupo.nome}`);
    const valores = grupos.map(grupo => grupo.quantidade);

    $("#tituloGraficoQuantidade").text(tipoSelecionado === "ATIVO" ? "Quantidade de ativos por centro de custo" : "Quantidade por local");

    graficos.quantidade = new Chart(document.getElementById("graficoQuantidade"), {
        type: "bar",
        data: { labels, datasets: [{ label: "Quantidade", data: valores, backgroundColor: "#34c759", borderRadius: 8 }] },
        options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });
}

function destruirGraficos() {
    Object.values(graficos).forEach(grafico => grafico?.destroy());
    graficos = {};
}

function renderizarGrupos() {
    const tabela = $("#tabelaItens");
    tabela.empty();

    if (!dadosGrupos.length) {
        tabela.html(`<tr><td colspan="6" class="px-6 py-10 text-center text-sm text-gray-400">Nenhum registro encontrado.</td></tr>`);
        atualizarContador(0, 0);
        return;
    }

    let totalItens = 0;

    dadosGrupos.forEach((grupo, index) => {
        totalItens += grupo.itens.length;

        const id = `grupo-${index}`;
        const configuracao = {
            MATERIAL: ["Material", "Buscar material...", "Valor em estoque:", "bg-green-50 text-green-600"],
            EPI: ["EPI / Uniforme", "Buscar EPI ou uniforme...", "Valor em estoque:", "bg-purple-50 text-purple-600"],
            ATIVO: ["Ativo", "Buscar ativo...", "Valor dos ativos:", "bg-blue-50 text-blue-600"]
        }[grupo.tipo];

        tabela.append(`
            <tr class="border-b border-gray-100 last:border-0">
                <td colspan="6" class="p-0">
                    <div class="grupo-item">
                        <div class="px-4 sm:px-6 py-4 sm:py-5">
                            <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                                <button type="button" class="grupo-toggle flex items-center gap-3 sm:gap-4 text-left min-w-0 flex-1" data-grupo="${id}">
                                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">${renderizarIconeGrupo(grupo)}</div>
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span class="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${configuracao[3]}">${configuracao[0]}</span>
                                            <span class="font-semibold text-gray-900 truncate">${escapeHtml(grupo.nome)}</span>
                                            <span class="text-xs text-gray-400 shrink-0">${escapeHtml(grupo.codigo)}</span>
                                        </div>
                                        <p class="text-xs text-gray-500 mt-1">${grupo.totalItens} ${grupo.totalItens === 1 ? "item" : "itens"}</p>
                                        <p class="text-xs text-gray-500 mt-1">${configuracao[2]} <span class="font-semibold text-gray-900">${formatarMoeda(grupo.valorTotal)}</span></p>
                                        ${grupo.tipo === "ATIVO" ? `<div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2"><p class="text-xs text-gray-500">Responsável: <span class="font-medium text-gray-700">${escapeHtml(grupo.nomeAprovador || "-")}</span></p><p class="text-xs text-gray-400">${escapeHtml(grupo.codAprovador || "-")}</p></div>` : ""}
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        ${grupo.tipo === "MATERIAL" ? `<button type="button" class="btn-historico flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-primary hover:text-primary transition" data-deposito="${escapeHtml(grupo.codigo)}" data-nome="${escapeHtml(grupo.nome)}"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Histórico</button>` : ""}
                                        <svg class="w-5 h-5 text-gray-400 transition grupo-seta" data-seta="${id}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 9l6 6 6-6"/></svg>
                                    </div>
                                </button>
                                <div class="relative w-full lg:w-64 shrink-0">
                                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"/></svg>
                                    <input type="text" class="busca-grupo w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition" data-grupo="${id}" placeholder="${configuracao[1]}">
                                </div>
                            </div>
                        </div>
                        <div id="${id}" class="hidden border-t border-gray-100 bg-gray-50/50">${renderizarItens(grupo.itens, grupo.tipo)}</div>
                    </div>
                </td>
            </tr>
        `);
    });

    atualizarContador(dadosGrupos.length, totalItens);

    $(".grupo-toggle").on("click", function () {
        const id = $(this).data("grupo");
        $("#" + id).toggleClass("hidden");
        $(`[data-seta="${id}"]`).toggleClass("rotate-180");
    });

    $(".busca-grupo").on("click", event => event.stopPropagation());

    $(".busca-grupo").on("input", function () {
        const busca = $(this).val().trim().toLowerCase();
        const id = $(this).data("grupo");
        const index = Number(String(id).replace("grupo-", ""));
        const grupo = dadosGrupos[index];

        if (!grupo) return;

        const itens = grupo.itens.filter(item => {
            return String(item.ItemCode || "").toLowerCase().includes(busca) || String(item.ItemName || "").toLowerCase().includes(busca);
        });

        $("#" + id).html(renderizarItens(busca ? itens : grupo.itens, grupo.tipo));

        if (busca) {
            $("#" + id).removeClass("hidden");
            $(`[data-seta="${id}"]`).addClass("rotate-180");
        }
    });

    $(".btn-historico").on("click", function (event) {
        event.stopPropagation();
        carregarHistoricoDeposito($(this).data("deposito"), $(this).data("nome"));
    });
}

function renderizarIconeGrupo(grupo) {
    if (grupo.tipo === "ATIVO") {
        return `<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5h16v14H4zM8 9h8M8 13h5"/></svg>`;
    }

    return `<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7.5L12 12l9-4.5M12 12v9"/></svg>`;
}

function renderizarItens(itens, tipo) {
    return window.innerWidth <= 639 ? renderizarCards(itens, tipo) : renderizarTabela(itens, tipo);
}

function renderizarTabela(itens, tipo) {
    if (tipo === "ATIVO") {
        return `<div class="overflow-x-auto"><table class="w-full min-w-[800px] text-sm"><thead class="text-xs text-gray-400"><tr><th class="text-left font-medium px-4 py-3 pl-12">Código</th><th class="text-left font-medium px-4 py-3">Descrição</th><th class="text-left font-medium px-4 py-3">Início</th><th class="text-left font-medium px-4 py-3">Fim</th><th class="text-right font-medium px-4 py-3">Valor Inicial</th><th class="text-right font-medium px-4 py-3 pr-6">Valor Restante</th></tr></thead><tbody class="divide-y divide-gray-100">${itens.map(item => `<tr class="hover:bg-white transition"><td class="px-4 py-3 pl-12 text-xs font-medium text-gray-700">${escapeHtml(item.ItemCode)}</td><td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(item.ItemName)}</td><td class="px-4 py-3 text-sm text-gray-600">${formatarData(item.ValidFrom)}</td><td class="px-4 py-3 text-sm text-gray-600">${formatarData(item.ValidTo)}</td><td class="px-4 py-3 text-right font-medium text-gray-900">${formatarMoeda(item.ValorInicial)}</td><td class="px-4 py-3 pr-6 text-right font-medium text-gray-900">${formatarMoeda(item.ValorRestante)}</td></tr>`).join("")}</tbody></table></div>`;
    }

    return `<div class="overflow-x-auto"><table class="w-full min-w-[700px] text-sm"><thead class="text-xs text-gray-400"><tr><th class="text-left font-medium px-4 py-3 pl-12">Código</th><th class="text-left font-medium px-4 py-3">Descrição</th><th class="text-right font-medium px-4 py-3">Quantidade</th><th class="text-right font-medium px-4 py-3">Preço Médio</th><th class="text-right font-medium px-4 py-3 pr-6">Valor Total</th></tr></thead><tbody class="divide-y divide-gray-100">${itens.map(item => `<tr class="hover:bg-white transition"><td class="px-4 py-3 pl-12 text-xs font-medium text-gray-700">${escapeHtml(item.ItemCode)}</td><td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(item.ItemName)}</td><td class="px-4 py-3 text-right text-gray-700">${formatarNumero(item.OnHand)}</td><td class="px-4 py-3 text-right text-gray-600">${formatarMoeda(item.AvgPrice)}</td><td class="px-4 py-3 pr-6 text-right font-medium text-gray-900">${formatarMoeda(item.StockValue)}</td></tr>`).join("")}</tbody></table></div>`;
}

function renderizarCards(itens, tipo) {
    if (tipo === "ATIVO") {
        return `<div class="divide-y divide-gray-100">${itens.map(item => `<div class="px-4 py-4"><div class="mb-4"><p class="text-sm font-medium text-gray-900">${escapeHtml(item.ItemName)}</p><p class="text-xs text-gray-400 mt-1">Código: ${escapeHtml(item.ItemCode)}</p></div><div class="grid grid-cols-2 gap-4"><div><p class="text-[11px] text-gray-400">Início</p><p class="text-sm font-medium text-gray-700 mt-0.5">${formatarData(item.ValidFrom)}</p></div><div><p class="text-[11px] text-gray-400">Fim</p><p class="text-sm font-medium text-gray-700 mt-0.5">${formatarData(item.ValidTo)}</p></div><div><p class="text-[11px] text-gray-400">Valor inicial</p><p class="text-sm font-medium text-gray-900 mt-0.5">${formatarMoeda(item.ValorInicial)}</p></div><div class="text-right"><p class="text-[11px] text-gray-400">Valor restante</p><p class="text-sm font-medium text-gray-900 mt-0.5">${formatarMoeda(item.ValorRestante)}</p></div></div></div>`).join("")}</div>`;
    }

    return `<div class="divide-y divide-gray-100">${itens.map(item => `<div class="px-4 py-4"><div class="mb-3"><p class="text-sm font-medium text-gray-900">${escapeHtml(item.ItemName)}</p><p class="text-xs text-gray-400 mt-1">Código: ${escapeHtml(item.ItemCode)}</p></div><div class="grid grid-cols-3 gap-3"><div><p class="text-[11px] text-gray-400">Quantidade</p><p class="text-sm font-medium text-gray-700 mt-0.5">${formatarNumero(item.OnHand)}</p></div><div><p class="text-[11px] text-gray-400">Preço médio</p><p class="text-sm text-gray-700 mt-0.5">${formatarMoeda(item.AvgPrice)}</p></div><div class="text-right"><p class="text-[11px] text-gray-400">Valor total</p><p class="text-sm font-medium text-gray-900 mt-0.5">${formatarMoeda(item.StockValue)}</p></div></div></div>`).join("")}</div>`;
}

function calcularQuantidade(itens = []) {
    return itens.reduce((total, item) => total + (Number(item.OnHand) || 0), 0);
}

function atualizarContador(totalGrupos, totalItens) {
    const nomeGrupo = tipoSelecionado === "ATIVO" ? "centro de custo" : "depósito";
    const grupos = `${totalGrupos} ${totalGrupos === 1 ? nomeGrupo : nomeGrupo + "s"}`;
    const itens = `${totalItens} ${totalItens === 1 ? "item" : "itens"}`;
    $("#contadorItens").text(`${grupos} • ${itens}`);
}

function carregarHistoricoDeposito(deposito, nomeDeposito) {
    $("#modalHistorico").removeClass("hidden").addClass("flex");
    $("#tituloHistorico").text("Histórico de movimentações");
    $("#subtituloHistorico").text(`${nomeDeposito} • ${deposito}`);

    const grupo = HISTORICO_MOCK.find(item => item.Warehouse === deposito);

    if (!grupo || !grupo.itens.length) {
        $("#conteudoHistorico").html(`<div class="py-12 text-center text-sm text-gray-400">Nenhuma movimentação encontrada.</div>`);
        return;
    }

    $("#conteudoHistorico").html(renderizarTabelaHistorico(grupo.itens));
}

function renderizarTabelaHistorico(itens) {
    return `<div class="overflow-x-auto"><table class="w-full min-w-[850px] text-sm"><thead class="text-xs text-gray-400 border-b border-gray-100"><tr><th class="text-left font-medium px-4 py-3">Tipo</th><th class="text-left font-medium px-4 py-3">Código</th><th class="text-left font-medium px-4 py-3">Descrição</th><th class="text-left font-medium px-4 py-3">Data</th><th class="text-right font-medium px-4 py-3">Entrada</th><th class="text-right font-medium px-4 py-3">Saída</th><th class="text-right font-medium px-4 py-3">Preço</th></tr></thead><tbody class="divide-y divide-gray-100">${itens.map(item => { const entrada = Number(item.InQty) || 0; const saida = Number(item.OutQty) || 0; return `<tr class="hover:bg-gray-50 transition"><td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${entrada > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}">${escapeHtml(item.Tipo)}</span></td><td class="px-4 py-3 text-xs font-medium text-gray-700">${escapeHtml(item.ItemCode)}</td><td class="px-4 py-3 text-gray-700">${escapeHtml(item.Dscription)}</td><td class="px-4 py-3 text-gray-600">${formatarData(item.CreateDate)}</td><td class="px-4 py-3 text-right font-medium text-green-600">${entrada ? "+" + formatarNumero(entrada) : "-"}</td><td class="px-4 py-3 text-right font-medium text-red-500">${saida ? "-" + formatarNumero(saida) : "-"}</td><td class="px-4 py-3 text-right text-gray-700">${formatarMoeda(item.Price)}</td></tr>`; }).join("")}</tbody></table></div>`;
}

function abrirModalHistoricos() {
    const agora = new Date();
    $("#mesHistoricos").val(`${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`);
    $("#buscaHistoricos").val("");
    $("#modalHistoricos").removeClass("hidden").addClass("flex");
    carregarHistoricos();
}

function fecharModalHistoricos() {
    $("#modalHistoricos").removeClass("flex").addClass("hidden");
}

function fecharModalHistorico() {
    $("#modalHistorico").removeClass("flex").addClass("hidden");
}

function carregarHistoricos() {
    const busca = $("#buscaHistoricos").val().trim().toLowerCase();
    const grupos = HISTORICO_MOCK.map(grupo => ({
        ...grupo,
        itens: grupo.itens.filter(item => {
            if (!busca) return true;
            return [grupo.Warehouse, grupo.WhsName, item.Tipo, item.ItemCode, item.Dscription]
                .some(valor => String(valor || "").toLowerCase().includes(busca));
        })
    })).filter(grupo => grupo.itens.length);

    historicosMovimentacoes = grupos;
    renderizarHistoricos();
}

function renderizarHistoricosFiltrados() {
    carregarHistoricos();
}

function renderizarHistoricos() {
    const totalMovimentacoes = historicosMovimentacoes.reduce((total, grupo) => total + grupo.itens.length, 0);

    $("#resumoHistoricos").text(`${historicosMovimentacoes.length} ${historicosMovimentacoes.length === 1 ? "depósito" : "depósitos"} • ${totalMovimentacoes} ${totalMovimentacoes === 1 ? "movimentação" : "movimentações"}`);

    if (!historicosMovimentacoes.length) {
        $("#conteudoHistoricos").html(`<div class="py-16 text-center text-sm text-gray-400">Nenhuma movimentação encontrada.</div>`);
        return;
    }

    $("#conteudoHistoricos").html(`
        <div class="divide-y divide-gray-100">
            ${historicosMovimentacoes.map(grupo => `
                <div class="px-6 py-5">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-gray-900">${escapeHtml(grupo.WhsName)}</span>
                                <span class="text-xs text-gray-400">${escapeHtml(grupo.Warehouse)}</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">${grupo.itens.length} ${grupo.itens.length === 1 ? "movimentação" : "movimentações"}</p>
                        </div>
                    </div>
                    ${renderizarTabelaHistorico(grupo.itens)}
                </div>
            `).join("")}
        </div>
    `);
}

function formatarData(valor) {
    if (!valor) return "-";
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR");
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function mostrarCarregando() {
    $("#tabelaItens").html(`<tr><td colspan="6" class="px-6 py-10 text-center text-sm text-gray-400">Carregando...</td></tr>`);
    $("#contadorItens").text("Carregando...");
}

function mostrarLoadingPagina() {
    $("#loadingPagina").removeClass("hidden").addClass("flex");
}

function esconderLoadingPagina() {
    $("#loadingPagina").removeClass("flex").addClass("hidden");
}
