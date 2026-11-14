// Home page interactions: hero x-ray and guide.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const whatsapp = text => `https://wa.me/5531984610556?text=${encodeURIComponent(text)}`;

  // Hero x-ray: the visitor drags a discount and watches the profit shrink.
  const xray = document.querySelector('[data-xray]');
  if (xray) {
    const range = document.getElementById('x-discount');
    const out = id => document.getElementById(id);
    const base = { price: 120, cost: 62, feeRate: 0.18, ship: 22 };
    const full = base.price - base.cost - base.price * base.feeRate - base.ship;

    function render() {
      const discount = Number(range.value);
      const price = base.price * (1 - discount / 100);
      const fee = price * base.feeRate;
      const profit = price - base.cost - fee - base.ship;
      const status = out('x-status');
      out('x-value').value = `${discount}%`;
      out('x-price').textContent = brl.format(price);
      out('x-fee').textContent = brl.format(fee);
      out('x-profit').textContent = brl.format(profit);
      out('x-profit').classList.toggle('is-negative', profit < 0);
      const parts = { cost: base.cost, fee, ship: base.ship, profit: Math.max(profit, 0) };
      const total = parts.cost + parts.fee + parts.ship + parts.profit;
      xray.querySelectorAll('[data-x]').forEach(node => {
        node.style.width = `${(parts[node.dataset.x] / total) * 100}%`;
      });
      if (profit < 0) {
        status.dataset.level = 'bad';
        status.textContent = 'Agora cada venda dá prejuízo, e vender mais só aumenta a perda.';
      } else if (discount === 0) {
        status.dataset.level = 'ok';
        status.textContent = 'Margem de 12%. Arraste e veja o que acontece.';
      } else {
        status.dataset.level = 'warn';
        status.textContent = `Um desconto de ${discount}% levou ${Math.round((1 - profit / full) * 100)}% do seu lucro.`;
      }
    }

    let touched = false;
    ['input', 'pointerdown', 'keydown'].forEach(type => range.addEventListener(type, () => { touched = true; }));
    range.addEventListener('input', render);
    render();

    // Plays once on arrival so the visitor sees the panel is alive.
    if (!reduceMotion) {
      setTimeout(() => {
        const startTime = performance.now();
        const step = now => {
          if (touched) return;
          const progress = Math.min((now - startTime) / 1600, 1);
          range.value = Math.round(progress * 10);
          render();
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 1100);
    }
  }

  // Two-question guide.
  const guide = document.querySelector('[data-guide]');
  if (guide) {
    const results = {
      preco: {
        comecar: ['Planilha de precificação', 'A partir de R$ 99, ela reúne custos, taxas, frete e margem para você definir preços com segurança desde o início.', './planilhas/', 'Ver planilhas'],
        estruturar: ['Planilha de vendas e lucratividade', 'A partir de R$ 199, mostra lucro e margem por item, período e canal, para enxergar o que cada venda representa.', './planilhas/', 'Ver planilhas'],
        otimizar: ['NGTech Otimizar', 'Gestão em lote de preços e promoções, análise de margem mínima e oportunidades de rebate para decidir com dados.', './consultoria/', 'Ver consultoria'],
      },
      estoque: {
        comecar: ['NGTech Começar', 'Base organizada desde o início: produtos padronizados, implantação básica do Olist e rotina de notas alinhada à contabilidade.', './consultoria/', 'Ver consultoria'],
        estruturar: ['NGTech Estruturar', 'Diagnóstico da operação, revisão de catálogo e vínculos com o ERP e conferência de estoque, depósitos e reservas.', './consultoria/', 'Ver consultoria'],
        otimizar: ['NGTech Otimizar', 'Planejamento de reposição, análise de estoque parado, alertas operacionais e automações personalizadas.', './consultoria/', 'Ver consultoria'],
      },
      manual: {
        comecar: ['Planilhas sob medida', 'Uma estrutura pensada para a sua rotina, com fórmulas que substituem controles soltos e retrabalho.', './solucoes-tecnologicas/', 'Ver soluções'],
        estruturar: ['Automação com Google Apps Script', 'Tarefas em planilhas automatizadas, informações consolidadas e relatórios recorrentes sem digitação manual.', './solucoes-tecnologicas/', 'Ver soluções'],
        otimizar: ['Integrações por API', 'Sistemas e marketplaces conectados, quando as plataformas oferecem os recursos e acessos necessários.', './solucoes-tecnologicas/', 'Ver soluções'],
      },
      site: ['Sites & desenvolvimento', 'Site institucional, landing page, loja virtual ou melhorias no que você já tem, com a identidade da sua marca.', './sites-e-desenvolvimento/', 'Ver portfólio'],
      pc: ['Suporte técnico', 'Diagnóstico, formatação, instalação, manutenção e upgrades para pessoas e empresas.', './suporte-tecnico/', 'Ver suporte técnico'],
    };
    const steps = guide.querySelectorAll('[data-step]');
    const bar = guide.querySelector('[data-guide-bar]');
    const out = name => guide.querySelector(`[data-r="${name}"]`);
    let goal = null;

    function go(step) {
      steps.forEach(panel => { panel.hidden = panel.dataset.step !== String(step); });
      bar.style.width = `${step * 33.34}%`;
    }

    function finish(result) {
      const [title, text, href, label] = result;
      out('title').textContent = title;
      out('text').textContent = text;
      out('wa').href = whatsapp(`Oi! Fiz o guia no site da NGTech e a sugestão foi: ${title}. Quero entender se faz sentido para mim.`);
      out('link').href = href;
      out('link').textContent = label;
      go(3);
      out('title').focus({ preventScroll: true });
    }

    guide.querySelectorAll('[data-goal]').forEach(button => button.addEventListener('click', () => {
      goal = button.dataset.goal;
      if (Array.isArray(results[goal])) {
        finish(results[goal]);
      } else {
        go(2);
        guide.querySelector('#g2').focus({ preventScroll: true });
      }
    }));
    guide.querySelectorAll('[data-phase]').forEach(button => button.addEventListener('click', () => {
      finish(results[goal][button.dataset.phase]);
    }));
    guide.querySelector('[data-guide-back]').addEventListener('click', () => go(1));
    guide.querySelector('[data-guide-reset]').addEventListener('click', () => go(1));
  }
})();
