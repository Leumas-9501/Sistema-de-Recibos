function valorPorExtenso(valor) {
    if (
        typeof valor !== "number" ||
        !Number.isFinite(valor) ||
        valor < 0 ||
        valor > 999999999.99
    ) {
        throw new Error("Valor monetário inválido.");
    }

    // Converte para centavos inteiros para evitar
    // problemas de precisão com números decimais.
    const centavosTotais = Math.round(valor * 100);

    const reais = Math.floor(centavosTotais / 100);
    const centavos = centavosTotais % 100;

    const unidades = [
        "zero", "um", "dois", "três", "quatro",
        "cinco", "seis", "sete", "oito", "nove"
    ];

    const especiais = [
        "dez", "onze", "doze", "treze", "quatorze",
        "quinze", "dezesseis", "dezessete",
        "dezoito", "dezenove"
    ];

    const dezenas = [
        "", "", "vinte", "trinta", "quarenta",
        "cinquenta", "sessenta", "setenta",
        "oitenta", "noventa"
    ];

    const centenas = [
        "", "cento", "duzentos", "trezentos",
        "quatrocentos", "quinhentos", "seiscentos",
        "setecentos", "oitocentos", "novecentos"
    ];

    function numeroPorExtenso(numero) {
        if (numero === 0) return "zero";
        if (numero === 100) return "cem";

        const partes = [];

        if (numero >= 100) {
            const centena = Math.floor(numero / 100);
            partes.push(centenas[centena]);
            numero %= 100;
        }

        if (numero >= 10 && numero <= 19) {
            partes.push(especiais[numero - 10]);
            numero = 0;
        } else if (numero >= 20) {
            const dezena = Math.floor(numero / 10);
            partes.push(dezenas[dezena]);
            numero %= 10;
        }

        if (numero > 0) {
            partes.push(unidades[numero]);
        }

        return partes.join(" e ");
    }

    function grupoPorExtenso(numero) {
        const partes = [];

        const milhoes = Math.floor(numero / 1000000);
        const milhares = Math.floor((numero % 1000000) / 1000);
        const resto = numero % 1000;

        if (milhoes > 0) {
            partes.push(
                milhoes === 1
                    ? "um milhão"
                    : numeroPorExtenso(milhoes) + " milhões"
            );
        }

        if (milhares > 0) {
            partes.push(
                milhares === 1
                    ? "mil"
                    : numeroPorExtenso(milhares) + " mil"
            );
        }

        if (resto > 0) {
            partes.push(numeroPorExtenso(resto));
        }

        if (partes.length === 1) {
            return partes[0];
        }

        if (resto === 0 && partes.length > 1) {
            return partes.join(" e ");
        }

        if (resto > 0 && resto < 100) {
            return partes.join(" e ");
        }

        return partes.join(", ");
    }

    const partesValor = [];

    if (reais > 0) {
        partesValor.push(
            grupoPorExtenso(reais) +
            (reais === 1 ? " real" : " reais")
        );
    }

    if (centavos > 0) {
        partesValor.push(
            grupoPorExtenso(centavos) +
            (centavos === 1 ? " centavo" : " centavos")
        );
    }

    if (partesValor.length === 0) {
        return "zero real";
    }

    return partesValor.join(" e ");
}