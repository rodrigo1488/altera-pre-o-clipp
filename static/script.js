/*****************************
 * CONTROLE DE ABAS
 *****************************/
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
  
  /*****************************
   * SALVAR E CARREGAR USUÁRIO
   *****************************/
  // Ao carregar a página, tentamos recuperar o nome do usuário do localStorage
  document.addEventListener("DOMContentLoaded", () => {
    const nomeUsuarioArmazenado = localStorage.getItem("nome_usuario");
    if (nomeUsuarioArmazenado) {
      document.getElementById("nome_usuario").value = nomeUsuarioArmazenado;
      document.getElementById("usuarioStatus").innerText = `Usuário atual: ${nomeUsuarioArmazenado}`;
    }
  
    listarItens(); // Carrega a lista de itens na aba "Itens Coletados"
  });
  
  document.getElementById("btnSalvarUsuario").addEventListener("click", () => {
    const nome = document.getElementById("nome_usuario").value.trim();
    if (!nome) {
      alert("Digite o nome do usuário.");
      return;
    }
    localStorage.setItem("nome_usuario", nome);
    document.getElementById("usuarioStatus").innerText = `Usuário atual: ${nome}`;
    alert("Usuário salvo com sucesso!");
  });
  
  /*****************************
   * MODAL
   *****************************/
  function abrirModal() {
    document.getElementById("itemModal").style.display = "block";
  }
  function fecharModal() {
    document.getElementById("itemModal").style.display = "none";
    limparModal();
  }
  function limparModal() {
    document.getElementById("descricaoProduto").innerText = "";
    document.getElementById("quantidadeSistema").innerText = "";
    document.getElementById("quantidadeContada").value = "";
    document.getElementById("preco").value = "";
  }

  
  /*****************************
   * BUSCAR PRODUTO
   *****************************/
  let codigoBarrasAtual = "";  // Guardar o código de barras buscado
  let ID_ESTOQUE = null;

  function buscarProduto() {
    const codigo_barras = document.getElementById("codigo_barras").value.trim();
    if (!codigo_barras) {
      alert("Digite um código de barras.");
      return;
    }
    fetch(`/produto/${codigo_barras}`)
      .then(response => response.json())
      .then(data => {
        if (data.erro) {
          alert("Produto não encontrado!");
        } else {
          // Guarda o código de barras para salvar depois
          codigoBarrasAtual = codigo_barras;
          ID_ESTOQUE_GLOBAL = data.ID_ESTOQUE;
          console.log("ID_ESTOQUE_GLOBAL atribuído:", ID_ESTOQUE_GLOBAL);

          console.log(data);
 
  
          // Exibe os dados no modal
          document.getElementById("descricaoProduto").innerHTML = `<strong>Produto:</strong> ${data.Descricao}`;
          document.getElementById("quantidadeSistema").innerHTML = `<strong>Qtd. Sistema:</strong> ${data.Quantidade}`;
          document.getElementById("preco_atual").innerHTML = `<strong>Preço Atual:</strong>R$${data.Preco}`;

  
          abrirModal(); // Abre o modal
          return ID_ESTOQUE
        }
      })
      .catch(error => console.error("Erro ao buscar produto:", error));
  }
  function buscarProdutoDescricao(id_produto) {
  
    if (!id_produto) {
      alert("Digite um código de barras.");
      return;
    }
    fetch(`/estoque/${id_produto}`)
      .then(response => response.json())
      .then(data => {
        if (data.erro) {
          alert("Produto não encontrado!");
        } else {
          // Guarda o código de barras para salvar depois
          codigoBarrasAtual = codigo_barras;
          ID_ESTOQUE_GLOBAL = data.ID_ESTOQUE;
          console.log("ID_ESTOQUE_GLOBAL atribuído:", ID_ESTOQUE_GLOBAL);

          console.log(data);
 
  
          // Exibe os dados no modal
          document.getElementById("descricaoProduto").innerHTML = `<strong>Produto:</strong> ${data.Descricao}`;
          document.getElementById("quantidadeSistema").innerHTML = `<strong>Qtd. Sistema:</strong> ${data.Quantidade}`;
          document.getElementById("preco_atual").innerHTML = `<strong>Preço Atual:</strong>R$${data.Preco}`;

  
          abrirModal(); // Abre o modal
          return ID_ESTOQUE
        }
      })
      .catch(error => console.error("Erro ao buscar produto:", error));
  }
  
  /*****************************
   * SALVAR ESTOQUE
   *****************************/
  function salvarEstoque() {
    const nome_usuario = localStorage.getItem("nome_usuario");
    if (!nome_usuario) {
      alert("Você precisa definir um usuário primeiro (aba 'Usuário').");
      fecharModal();
      return;
    }
    const id_produto = ID_ESTOQUE_GLOBAL;

  
    const quantidadeContada = document.getElementById("quantidadeContada").value.trim();
    const preco = document.getElementById("preco").value.trim();
    if (!quantidadeContada) {
      alert("Digite a quantidade contada.");
      return;
    }
  
    fetch(`/salvar/${nome_usuario}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        codigo_barras: codigoBarrasAtual,
        quantidade: quantidadeContada,
        preco: preco,
        id : id_produto
      })
    })
    console.log 
    .then(response => response.json())
    .then(data => {
      
      fecharModal();
      // Limpa o campo de código de barras após salvar
      document.getElementById("codigo_barras").value = "";
      listarItens();
    })
    .catch(error => console.error('Erro ao salvar estoque:', error));
  }
  // Função para listar todos os itens ou filtrar por descrição
  function listarItens(filtro = "") {
    fetch(filtro ? `/listar-contagem/${filtro}` : "/listar-contagem")
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById("itens-coletados");
        container.innerHTML = "";
  
        if (data.length === 0) {
          container.innerHTML = "<p>Nenhum item coletado.</p>";
          return;
        }
  
        data.forEach(item => {
          const div = document.createElement("div");
          div.classList.add("item");
          div.innerHTML = `
            <p>
              <strong>Descrição:</strong> ${item.descricao}<br>
              <strong>Código:</strong> ${item.codigo_barras}<br>
              <strong>Quantidade Coletada:</strong> ${item.quantidade}<br>
              <strong>Quantidade no sistema:</strong> ${item.qnt_sist}<br>
              <strong>Coleto:</strong> ${item.nome_user}<br>
              <strong>Data:</strong> ${item.data_hora}
            </p>
            <div class="bot">
              <button class="editar" onclick="editarItem(${item.id}, '${item.codigo_barras}', ${item.quantidade})">Editar</button>
              <button class="excluir" onclick="excluirItem(${item.id})">Excluir</button>
            </div>
          `;
          container.appendChild(div);
        });
      })
      .catch(error => console.error("Erro ao listar itens:", error));
  }
  
// Variável para controlar o debounce
let debounceTimer;

// Listener para disparar a busca conforme o usuário digita
document.getElementById("descricao").addEventListener("keyup", function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    buscarItem();
  }, 300);
});



document.getElementById("descricao_prod").addEventListener("keyup", function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    buscarprod();
  }, 300);
});
// Função para buscar item (já atualizada para tratar arrays)
function buscarItem() {
  const descricao = document.getElementById("descricao").value;
  if (descricao.trim() === "") {
    // Se o campo estiver vazio, opcionalmente você pode listar todos os itens ou limpar a área de resultados
    listarItens();
    return;
  }

  fetch(`/listar-contagem/${descricao}`)
    .then(response => response.json())
    .then(data => {
      console.log("Dados retornados:", data); // Para depuração
      const container = document.getElementById("itens-coletados");
      container.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p>Nenhum item coletado.</p>";
        return;
      }

      data.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
          <p>
            <strong>Descrição:</strong> ${item.descricao}<br>
            <strong>Código:</strong> ${item.codigo_barras}<br>
            <strong>Preço:</strong> ${item.preco}<br>
            <strong>Quantidade:</strong> ${item.quantidade}<br>
            <strong>Quantidade no sistema:</strong> ${item.qnt_sist}<br>
            <strong>Coletado por:</strong> ${item.nome_user}<br>
            <strong>Data:</strong> ${item.data_hora}
          </p>
          <div class="bot">
            <button class="editar" onclick="editarItem(${item.id}, '${item.codigo_barras}', ${item.quantidade})">Editar</button>
            <button class="excluir" onclick="excluirItem(${item.id})">Excluir</button>
          </div>
        `;
        container.appendChild(div);
      });
    })
    .catch(error => console.error("Erro ao buscar item:", error));
}

function buscarprod() {
  const descricao = document.getElementById("descricao_prod").value;
  if (descricao.trim() === "") {
    // Se o campo estiver vazio, opcionalmente você pode listar todos os itens ou limpar a área de resultados
    listarItens();
    return;
  }

  fetch(`estoque/${descricao}`)
    .then(response => response.json())
    .then(data => {
      console.log("Dados retornados:", data); // Para depuração
      const container = document.getElementById("itens-encontrados");
      container.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p>Nenhum item coletado.</p>";
        return;
      }

      data.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
        <p>
        <strong>Descrição:</strong> ${item.Descricao}<br>
        <strong>Código:</strong> ${item.codigo_barras}<br>
        <strong>Preço:</strong> ${item.Preco}<br>
        <strong>Quantidade no sistema:</strong> ${item.Quantidade}<br>
        </p>
        <div class="bot">
        <button class="editar" onclick = "buscarProdutoDescricao(${item.id_produto})">Alterar</button>
        </div>
      
        `;
        container.appendChild(div);

      });
    })  


  
      }