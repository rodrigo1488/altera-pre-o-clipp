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
  let ID_ESTOQUE = "";
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
          ID_ESTOQUE = data.ID_ESTOQUE; 
          console.log(ID_ESTOQUE);
  
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
  function salvarEstoque(ID_ESTOQUE) {
    const nome_usuario = localStorage.getItem("nome_usuario");
    if (!nome_usuario) {
      alert("Você precisa definir um usuário primeiro (aba 'Usuário').");
      fecharModal();
      return;
    }
  
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
        ID_ESTOQUE: ID_ESTOQUE
      })
    })
    .then(response => response.json())
    console.log(ID_ESTOQUE)
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
            <strong>Quantidade:</strong> ${item.quantidade}<br>
            <strong>Qtd. Sistema:</strong> ${item.qnt_sist}<br>
            <strong>Usuário:</strong> ${item.nome_user}<br>
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

  // Função para editar item
  function editarItem(id, codigo_barras, quantidade) {
    const novaQuantidade = prompt(`Editar quantidade para ${codigo_barras}:`, quantidade);
    if (novaQuantidade !== null) {
      fetch(`/editar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: novaQuantidade })
      })
      .then(response => response.json())
      .then(data => {
        alert("Quantidade atualizada!");
        listarItens();
      })
      .catch(error => console.error("Erro ao editar item:", error));
    }
  }
  

  // Função para excluir item
  function excluirItem(id) {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      fetch(`/excluir/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
          alert("Item excluído!");
          listarItens();
        })
        .catch(error => console.error("Erro ao excluir item:", error));
    }
  }
  
  // Botão para gerar arquivo TXT
  document.getElementById('gerar-txt-btn').addEventListener('click', function() {
    fetch('/gerar-txt', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        alert('Arquivo TXT gerado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao gerar o arquivo:', error);
        alert('Erro ao gerar o arquivo TXT');
      });
  });
  
  // Inicializa a listagem ao carregar a página
  document.addEventListener("DOMContentLoaded", () => {
    listarItens();
  });
  