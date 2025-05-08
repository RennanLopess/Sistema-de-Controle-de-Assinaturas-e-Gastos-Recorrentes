document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("subscription-form");
    const lista = document.getElementById("lista-assinaturas");
    const totalGastos = document.getElementById("total-gastos");
    const graficoCanvas = document.getElementById("grafico");
  
    const modal = new bootstrap.Modal(document.getElementById("editarModal"));
    const editarInicio = document.getElementById("editarInicio");
    const editarProxima = document.getElementById("editarProxima");
    const editarIndex = document.getElementById("editarIndex");
    const salvarEdicao = document.getElementById("salvarEdicao");
  
    mostrarAssinaturas();
    mostrarGrafico();
  
    // Adicionar serviço
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const nome = document.getElementById("nome").value.trim();
      const valor = parseFloat(document.getElementById("valor").value.replace(",", "."));
      const categoria = document.getElementById("categoria").value;
      const inicio = document.getElementById("inicio").value;
  
      if (!nome || isNaN(valor) || !categoria || !inicio) {
        alert("Preencha todos os campos corretamente.");
        return;
      }
  
      const proxima = calcularProximaFatura(inicio);
      const nova = { nome, valor, categoria, inicio, proxima };
  
      let assinaturas = JSON.parse(localStorage.getItem("assinaturas")) || [];
      assinaturas.push(nova);
      localStorage.setItem("assinaturas", JSON.stringify(assinaturas));
  
      form.reset();
      mostrarAssinaturas();
    });
  
    // Calcula a próxima fatura (30 dias a partir da data de início)
    function calcularProximaFatura(dataInicial) {
      const data = new Date(dataInicial);
      data.setDate(data.getDate() + 30);  // Adiciona 30 dias
      return data.toISOString().split("T")[0];
    }
  
    // Formata a data para o formato desejado
    function formatarData(dataStr) {
      const [ano, mes, dia] = dataStr.split("-");
      return `${dia}/${mes}/${ano}`;
    }
  
    // Exibe as assinaturas e atualiza o total
    function mostrarAssinaturas() {
      const assinaturas = JSON.parse(localStorage.getItem("assinaturas")) || [];
      lista.innerHTML = "";
      let total = 0;
  
      assinaturas.forEach((a, index) => {
        const item = document.createElement("li");
        item.className = "list-group-item d-flex justify-content-between align-items-center flex-wrap";
        item.innerHTML = `
          <div>
            <strong>${a.nome}</strong> - R$ ${a.valor.toFixed(2)}<br/>
            <small>${a.categoria} | Início ${formatarData(a.inicio)} - Próxima fatura ${formatarData(a.proxima)}</small>
          </div>
          <div class="d-flex gap-2 mt-2 mt-md-0">
            <button class="btn btn-sm btn-primary" onclick="abrirModal(${index})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="removerAssinatura(${index})">Remover</button>
          </div>
        `;
        lista.appendChild(item);
        total += a.valor;
      });
  
      totalGastos.textContent = `R$ ${total.toFixed(2)}`;
      mostrarGrafico();  // Atualiza o gráfico
    }
  
    // Exibe o gráfico
    function mostrarGrafico() {
      const assinaturas = JSON.parse(localStorage.getItem("assinaturas")) || [];
      const nomes = assinaturas.map(a => a.nome);
      const valores = assinaturas.map(a => a.valor);
  
      // Se já existir um gráfico, destruímos o anterior
      if (window.myChart) {
        window.myChart.destroy();
      }
  
      // Criando o novo gráfico
      window.myChart = new Chart(graficoCanvas, {
        type: "pie",
        data: {
          labels: nomes,
          datasets: [{
            data: valores,
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6', '#E74C3C'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            }
          },
          maintainAspectRatio: false,
          aspectRatio: 1.5,
        }
      });
    }
  
    // Função para remover a assinatura
    window.removerAssinatura = (index) => {
      let assinaturas = JSON.parse(localStorage.getItem("assinaturas")) || [];
      assinaturas.splice(index, 1);
      localStorage.setItem("assinaturas", JSON.stringify(assinaturas));
      mostrarAssinaturas();
    };
  
    // Função para abrir o modal de edição
    window.abrirModal = (index) => {
      let assinaturas = JSON.parse(localStorage.getItem("assinaturas")) || [];
      const assinatura = assinaturas[index];
  
      editarInicio.value = assinatura.inicio;
      editarProxima.value = assinatura.proxima;
      editarIndex.value = index;
  
      modal.show();
    };
  
    // Salvar as edições no modal
    salvarEdicao.addEventListener("click", () => {
      const assinaturas = JSON.parse(localStorage.getItem("assinaturas")) || [];
      const index = editarIndex.value;
      const assinatura = assinaturas[index];
  
      assinatura.inicio = editarInicio.value;
      assinatura.proxima = editarProxima.value;
      assinaturas[index] = assinatura;
  
      localStorage.setItem("assinaturas", JSON.stringify(assinaturas));
      modal.hide();
      mostrarAssinaturas();
    });
  });
  