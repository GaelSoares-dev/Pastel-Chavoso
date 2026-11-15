// Modal de cadastro compartilhado por todas as páginas do Pastel Chavoso.
// Os dados são enviados à API C#; a senha deve ser armazenada como hash no servidor.
(() => {
    const API_URL = "https://localhost:7001/api/cadastro";

    const css = `
    .cadastro-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        padding: 18px; box-sizing: border-box;
        background: rgba(0,0,0,.72);
    }
    .cadastro-modal {
        width: min(460px, 100%); max-height: 90vh; overflow-y: auto;
        box-sizing: border-box; padding: 26px;
        border-radius: 14px; background: #fff; color: #191717;
        box-shadow: 0 12px 45px rgba(0,0,0,.35);
        font-family: Arial, sans-serif;
    }
    .cadastro-modal h2 { margin: 0 0 8px; text-align: center; }
    .cadastro-modal p { margin: 0 0 18px; text-align: center; color: #555; }
    .cadastro-modal label { display: block; margin: 12px 0 5px; font-weight: 600; }
    .cadastro-modal input {
        display: block; width: 100%; height: 42px; box-sizing: border-box;
        padding: 9px 11px; border: 1px solid #bbb; border-radius: 7px;
        background: #fff; color: #191717; font-size: 15px;
    }
    .cadastro-modal input:focus { outline: 2px solid #dd1111; border-color: #dd1111; }
    .cadastro-acoes { display: flex; gap: 10px; margin-top: 20px; }
    .cadastro-acoes button {
        flex: 1; min-height: 42px; border: 0; border-radius: 7px;
        cursor: pointer; font-weight: 700; font-size: 15px;
    }
    .cadastro-enviar { background: #dd1111; color: #fff; }
    .cadastro-cancelar { background: #e8e8e8; color: #191717; }
    .cadastro-status { min-height: 20px; margin-top: 13px !important; font-size: 14px; }
    .cadastro-status.erro { color: #b00020; }
    .cadastro-status.sucesso { color: #137333; }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    function abrirModal() {
        if (document.querySelector(".cadastro-overlay")) return;

        const overlay = document.createElement("div");
        overlay.className = "cadastro-overlay";
        overlay.innerHTML = `
            <section class="cadastro-modal" role="dialog" aria-modal="true"
                     aria-labelledby="cadastro-titulo">
                <h2 id="cadastro-titulo">Criar cadastro</h2>
                <p>Preencha seus dados para continuar.</p>
                <form id="formCadastro">
                    <label for="cadastro-email">E-mail</label>
                    <input id="cadastro-email" name="email" type="email"
                           autocomplete="email" required maxlength="150">

                    <label for="cadastro-nome">Nome</label>
                    <input id="cadastro-nome" name="nome" type="text"
                           autocomplete="name" required maxlength="100">

                    <label for="cadastro-senha">Senha</label>
                    <input id="cadastro-senha" name="senha" type="password"
                           autocomplete="new-password" required minlength="8"
                           maxlength="128">

                    <label for="cadastro-endereco">Endereço</label>
                    <input id="cadastro-endereco" name="endereco" type="text"
                           autocomplete="street-address" required maxlength="200">

                    <div class="cadastro-acoes">
                        <button class="cadastro-enviar" type="submit">Cadastrar</button>
                        <button class="cadastro-cancelar" id="fecharCadastro"
                                type="button">Cancelar</button>
                    </div>
                    <p id="cadastroStatus" class="cadastro-status"
                       role="status" aria-live="polite"></p>
                </form>
            </section>
        `;

        document.body.appendChild(overlay);
        const form = overlay.querySelector("#formCadastro");
        const status = overlay.querySelector("#cadastroStatus");

        function fechar() { overlay.remove(); }
        overlay.querySelector("#fecharCadastro").addEventListener("click", fechar);
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) fechar();
        });
        document.addEventListener("keydown", function escapeHandler(event) {
            if (event.key === "Escape" && document.body.contains(overlay)) {
                fechar();
                document.removeEventListener("keydown", escapeHandler);
            }
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const botao = form.querySelector(".cadastro-enviar");
            botao.disabled = true;
            botao.textContent = "Enviando...";
            status.className = "cadastro-status";
            status.textContent = "";

            const cadastro = {
                email: form.email.value.trim(),
                nome: form.nome.value.trim(),
                senha: form.senha.value,
                endereco: form.endereco.value.trim()
            };

            try {
                const resposta = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cadastro)
                });

                const resultado = await resposta.json().catch(() => ({}));
                if (!resposta.ok) {
                    throw new Error(resultado.mensagem || "Não foi possível concluir o cadastro.");
                }

                status.classList.add("sucesso");
                status.textContent = resultado.mensagem || "Cadastro salvo com sucesso!";
                form.reset();
                botao.textContent = "Cadastrado";
            } catch (erro) {
                status.classList.add("erro");
                status.textContent = erro.message.includes("Failed to fetch")
                    ? "Não foi possível acessar a API. Verifique se o servidor C# está iniciado e se a URL está correta."
                    : erro.message;
                botao.disabled = false;
                botao.textContent = "Cadastrar";
            }
        });

        overlay.querySelector("#cadastro-email").focus();
    }

    // Captura todos os links/botões cujo texto seja LOGIN, inclusive o rodapé.
    document.addEventListener("click", (event) => {
        const alvo = event.target.closest("a, button");
        if (!alvo) return;
        if (alvo.textContent.trim().toLocaleUpperCase("pt-BR") === "LOGIN") {
            event.preventDefault();
            abrirModal();
        }
    });
})();
