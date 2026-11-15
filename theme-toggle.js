// Alterna entre o tema escuro e o tema claro ao clicar na imagem dark-mode.png.
document.addEventListener("DOMContentLoaded", () => {
    const botoesTema = document.querySelectorAll('img[src*="dark-mode.png"]');

    if (botoesTema.length === 0) {
        console.warn('Imagem dark-mode.png não encontrada nesta página.');
        return;
    }

    // Recupera a preferência salva; por padrão, o site começa no modo escuro.
    const temaSalvo = localStorage.getItem("temaPastelChavoso") || "escuro";
    aplicarTema(temaSalvo);

    botoesTema.forEach((imagem) => {
        imagem.style.cursor = "pointer";
        imagem.setAttribute("role", "button");
        imagem.setAttribute("tabindex", "0");
        imagem.setAttribute("aria-label", "Alternar entre modo claro e escuro");

        imagem.addEventListener("click", alternarTema);
        imagem.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                alternarTema();
            }
        });
    });
});

function alternarTema() {
    const temaAtual = document.documentElement.dataset.tema || "escuro";
    const novoTema = temaAtual === "escuro" ? "claro" : "escuro";

    aplicarTema(novoTema);
    localStorage.setItem("temaPastelChavoso", novoTema);
}

function aplicarTema(tema) {
    const claro = tema === "claro";
    document.documentElement.dataset.tema = tema;

    // Variáveis e filtros globais para preservar a estrutura visual do site.
    document.documentElement.style.colorScheme = claro ? "light" : "dark";
    document.body.style.backgroundColor = claro ? "#ffffff" : "";
    document.body.style.color = claro ? "#191717" : "";

    // Mantém a mudança de tema em todas as páginas da mesma origem.
    document.querySelectorAll("body, body *").forEach((elemento) => {
        if (elemento.matches("img, video, svg, canvas, input, textarea, select, button")) {
            return;
        }

        if (claro) {
            if (!elemento.dataset.corFundoOriginal) {
                const fundo = getComputedStyle(elemento).backgroundColor;
                elemento.dataset.corFundoOriginal = fundo;
            }
            if (!elemento.dataset.corTextoOriginal) {
                const cor = getComputedStyle(elemento).color;
                elemento.dataset.corTextoOriginal = cor;
            }

            const fundoOriginal = elemento.dataset.corFundoOriginal;
            const corOriginal = elemento.dataset.corTextoOriginal;

            // Só clareia superfícies escuras; preserva fundos coloridos e imagens.
            if (fundoOriginal && (
                fundoOriginal === "rgb(0, 0, 0)" ||
                fundoOriginal === "rgb(25, 23, 23)" ||
                fundoOriginal === "rgba(0, 0, 0, 0)" ||
                fundoOriginal === "transparent"
            )) {
                elemento.style.backgroundColor = fundoOriginal === "rgba(0, 0, 0, 0)" ||
                    fundoOriginal === "transparent" ? "transparent" : "#ffffff";
            }

            if (corOriginal === "rgb(255, 255, 255)" ||
                corOriginal === "rgb(240, 240, 240)" ||
                corOriginal === "rgb(245, 245, 245)") {
                elemento.style.color = "#191717";
            }
        } else {
            elemento.style.removeProperty("background-color");
            elemento.style.removeProperty("color");
        }
    });

    // Atualiza o estado acessível do botão.
    document.querySelectorAll('img[src*="dark-mode.png"]').forEach((imagem) => {
        imagem.setAttribute("aria-pressed", String(claro));
        imagem.setAttribute("title", claro ? "Ativar modo escuro" : "Ativar modo claro");
    });
}
