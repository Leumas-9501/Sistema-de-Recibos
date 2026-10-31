const formRecibo = document.getElementById("form-recibo");

const campoNome = document.getElementById("nome-pagador");
const campoDocumento = document.getElementById("documento-pagador");
const campoDescricao = document.getElementById("descricao-servico");
const campoValor = document.getElementById("valor");
const campoData = document.getElementById("data-pagamento");
const campoLocal = document.getElementById("local");

const recibo = document.getElementById("recibo");
const mensagemInicial = document.getElementById("mensagem-inicial");
const acoesDocumento = document.getElementById("acoes-documento");

const saidaNumero = document.getElementById("saida-numero");
const saidaTexto = document.getElementById("saida-texto");
const saidaValorExtenso = document.getElementById("saida-valor-extenso");
const saidaLocalData = document.getElementById("saida-local-data");
const saidaRecebedor = document.getElementById("saida-recebedor");

const btnLimpar = document.getElementById("btn-limpar");
const btnPdf = document.getElementById("btn-pdf");

const mensagemDocumento = document.getElementById("mensagem-documento");

let numeroRecibo = 0;

// Preenche a data atual usando o fuso horário local.
function obterDataAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

campoData.value = obterDataAtual();
campoLocal.value = CONFIG.recibo.localPadrao;

// Converte uma data YYYY-MM-DD para uma data legível
// sem depender da interpretação UTC do navegador.
function formatarData(data) {
    const [ano, mes, dia] = data.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);

    return dataLocal.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: CONFIG.recibo.moeda,
    });
}

function gerarRecibo(evento) {
    evento.preventDefault();

    if (!formRecibo.reportValidity()) {
        return;
    }

    const nome = campoNome.value.trim();
    const documento = campoDocumento.value.trim();
    const tipo = tipoDocumento.value;
    const documentoFormatado = `${tipo} ${documento}`;
    if (!validarDocumento()) {
        return;
    }
    const descricao = campoDescricao.value.trim();
    const valor = Number(campoValor.value);
    const data = campoData.value;
    const local = campoLocal.value.trim() || CONFIG.recibo.localPadrao;

    if (
        !nome ||
        !descricao ||
        !Number.isFinite(valor) ||
        valor < 0.01 ||
        valor > 999999999.99 ||
        !data
    ) {
        alert("Confira os campos obrigatórios antes de gerar o recibo.");
        return;
    }

    numeroRecibo++;

    const valorFormatado = formatarMoeda(valor);
    const extenso = valorPorExtenso(valor);

    saidaNumero.textContent = String(numeroRecibo).padStart(3, "0");

    // textContent evita interpretar os dados digitados como HTML.
    saidaTexto.textContent =
        `Eu, ${nome}, portador(a) do documento ` +
        `${documentoFormatado || "não informado"}, declaro ter recebido ` +
        `a quantia de ${valorFormatado} (${extenso}) da empresa rural ` +
        `${CONFIG.empresa.nome}, sediada na ${CONFIG.empresa.endereco}. ` +
        `O valor recebido é referente a: ${descricao}. ` +
        `Declaro que o pagamento corresponde ao serviço descrito e dou ` +
        `quitação exclusivamente quanto ao valor aqui recebido.`;

    saidaLocalData.textContent = `${local}, ${formatarData(data)}.`;

    saidaRecebedor.textContent = nome;

    mensagemInicial.hidden = true;
    recibo.hidden = false;
    acoesDocumento.hidden = false;
}

formRecibo.addEventListener("submit", gerarRecibo);

btnLimpar.addEventListener("click", () => {
    formRecibo.reset();

    campoData.value = obterDataAtual();
    campoLocal.value = CONFIG.recibo.localPadrao;

    recibo.hidden = true;
    acoesDocumento.hidden = true;
    mensagemInicial.hidden = false;
});

btnPdf.addEventListener("click", () => {
    window.print();
});

const tipoDocumento = document.getElementById("tipo-documento");

const placeholdersDocumento = {
    CPF: "000.000.000-00",
    RG: "00000000-0",
    CNH: "00000000000",
    CNPJ: "00.000.000/0000-00",
};

function atualizarPlaceholder() {
    const tipo = tipoDocumento.value;

    campoDocumento.placeholder = placeholdersDocumento[tipo];

    // Limpa o documento anterior ao trocar o tipo.
    campoDocumento.value = "";
}

campoDocumento.addEventListener("input", () => {
    campoDocumento.value = formatarDocumento(
        campoDocumento.value,
        tipoDocumento.value,
    );

    campoDocumento.setCustomValidity("");
    mensagemDocumento.textContent = "";
});

tipoDocumento.addEventListener("change", atualizarPlaceholder);

function formatarDocumento(valor, tipo) {
    let numeros = somenteNumeros(valor);

    switch (tipo) {
        case "CPF":
            numeros = numeros.slice(0, 11);

            return numeros
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        case "CNPJ":
            numeros = numeros.slice(0, 14);

            return numeros
                .replace(/^(\d{2})(\d)/, "$1.$2")
                .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/\.(\d{3})(\d)/, ".$1/$2")
                .replace(/(\d{4})(\d)/, "$1-$2");

        case "CNH":
            return numeros.slice(0, 11);

        case "RG":
            numeros = numeros.slice(0, 9);

            return numeros.replace(/^(\d{8})(\d)/, "$1-$2");
    }

    return valor;
}

function somenteNumeros(valor) {
    return valor.replace(/\D/g, "");
}

// Define o placeholder inicial.
atualizarPlaceholder();

function validarCPF(cpf) {
    const numeros = somenteNumeros(cpf);

    if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
        return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(numeros[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    if (digito !== Number(numeros[9])) return false;

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(numeros[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    return digito === Number(numeros[10]);
}

function validarCNPJ(cnpj) {
    const numeros = somenteNumeros(cnpj);

    if (numeros.length !== 14 || /^(\d)\1{13}$/.test(numeros)) {
        return false;
    }

    const calcularDigito = (base, pesos) => {
        const soma = base
            .split("")
            .reduce(
                (total, numero, indice) =>
                    total + Number(numero) * pesos[indice],
                0,
            );

        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(
        numeros.slice(0, 12),
        [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    const segundo = calcularDigito(
        numeros.slice(0, 12) + primeiro,
        [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    return primeiro === Number(numeros[12]) && segundo === Number(numeros[13]);
}

function validarCNH(cnh) {
    const numeros = somenteNumeros(cnh);

    if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
        return false;
    }

    const base = numeros.slice(0, 9).split("").map(Number);

    let soma = base.reduce(
        (total, numero, indice) => total + numero * (9 - indice),
        0,
    );

    let primeiro = soma % 11;
    if (primeiro >= 10) primeiro = 0;

    soma = base.reduce(
        (total, numero, indice) => total + numero * (indice + 1),
        0,
    );

    let segundo = soma % 11;

    if (segundo >= 10) {
        segundo = 0;
    }

    if (primeiro === 0 && soma % 11 >= 10) {
        segundo = ((soma % 11) - 2 + 11) % 11;
        if (segundo >= 10) segundo = 0;
    }

    return primeiro === Number(numeros[9]) && segundo === Number(numeros[10]);
}

function validarRG(rg) {
    const caracteres = rg.toUpperCase().replace(/[^0-9X]/g, "");

    return (
        caracteres.length >= 5 &&
        caracteres.length <= 14 &&
        !/^(\d)\1+$/.test(caracteres)
    );
}

function validarDocumento() {
    const tipo = tipoDocumento.value;
    const documento = campoDocumento.value;

    const validacoes = {
        CPF: validarCPF,
        CNPJ: validarCNPJ,
        CNH: validarCNH,
        RG: validarRG,
    };

    const valido = validacoes[tipo](documento);

    if (!valido) {
        mensagemDocumento.textContent = `O ${tipo} informado é inválido. Confira o número.`;

        campoDocumento.setCustomValidity(`Informe um ${tipo} válido.`);

        campoDocumento.reportValidity();
        return false;
    }

    mensagemDocumento.textContent = "Formato e validação numérica aprovados.";
    campoDocumento.setCustomValidity("");

    return true;
}

campoDocumento.addEventListener("blur", () => {
    if (campoDocumento.value.trim()) {
        validarDocumento();
    }
});
