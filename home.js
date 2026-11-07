// Home page interactions: hero network, sale breakdown, profit calculator and guide.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const pct = value => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const whatsapp = text => `https://wa.me/5531989878715?text=${encodeURIComponent(text)}`;

  // Hero network canvas: paused off screen and skipped for reduced motion.
  const canvas = document.querySelector('.hero-canvas');
  if (canvas && !reduceMotion) {
    const context = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let points = [];
    let visible = true;
    let frame = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(Math.round(width / 26), 56);
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    }

    function draw() {
      frame = 0;
      if (!visible) return;
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        for (let next = index + 1; next < points.length; next += 1) {
          const other = points[next];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 130) {
            context.strokeStyle = `rgba(0,207,234,${(1 - distance / 130) * 0.28})`;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
        context.fillStyle = 'rgba(0,207,234,.65)';
        context.beginPath();
        context.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
        context.fill();
      });
      frame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    }).observe(canvas);
    frame = requestAnimationFrame(draw);
  }

  // Subtle tilt of the hero panel on devices with a mouse.
  const tilt = document.querySelector('[data-tilt]');
  const dashPanel = document.querySelector('.dash');
  if (tilt && dashPanel && !reduceMotion && window.matchMedia('(hover:hover) and (min-width:1001px)').matches) {
    document.querySelector('.hero2').addEventListener('pointermove', event => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      dashPanel.style.setProperty('--ry', `${-5 + x * 8}deg`);
      dashPanel.style.setProperty('--rx', `${3 - y * 6}deg`);
    });
  }

  // Hero sale breakdown cycling through fictitious examples.
  const dash = document.querySelector('[data-dash]');
  const samples = [
    { channel: 'Mercado Livre', name: 'Fone Bluetooth', price: 158.47, cost: 80, feeRate: 0.17, ship: 23 },
    { channel: 'Shopee', name: 'Kit de cozinha', price: 89.9, cost: 52, feeRate: 0.2, ship: 6 },
    { channel: 'Loja própria', name: 'Perfume 100 ml', price: 219, cost: 120, feeRate: 0.05, ship: 28 },
  ];

  function showSample(sample) {
    const fee = sample.price * sample.feeRate;
    const profit = sample.price - sample.cost - fee - sample.ship;
    const values = {
      channel: sample.channel,
      name: sample.name,
      price: brl.format(sample.price),
      cost: brl.format(sample.cost),
      fee: brl.format(fee),
      ship: brl.format(sample.ship),
      profit: brl.format(profit),
      margin: `${pct((profit / sample.price) * 100)} de margem`,
    };
    dash.querySelectorAll('[data-d]').forEach(node => { node.textContent = values[node.dataset.d]; });
    const parts = { cost: sample.cost, fee, ship: sample.ship, profit };
    dash.querySelectorAll('[data-seg]').forEach(node => {
      node.style.width = `${(parts[node.dataset.seg] / sample.price) * 100}%`;
    });
    dash.setAttribute('aria-label', `Exemplo com dados fictícios: venda de ${values.price} com ${values.profit} de lucro`);
  }

  if (dash) {
    showSample(samples[0]);
    if (!reduceMotion) {
      let current = 0;
      setInterval(() => {
        if (document.hidden) return;
        current = (current + 1) % samples.length;
        dash.classList.add('is-swapping');
        setTimeout(() => {
          showSample(samples[current]);
          dash.classList.remove('is-swapping');
        }, 280);
      }, 4200);
    }
  }

  // Marquee: duplicate the list so the loop has no visible seam.
  const track = document.querySelector('.marquee-track');
  if (track) {
    [...track.children].forEach(item => {
      const copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.append(copy);
    });
  }

  // Discount test: one slider that shows how quickly profit disappears.
  const testBox = document.querySelector('[data-test]');
  if (testBox) {
    const range = document.getElementById('t-discount');
    const value = document.getElementById('t-value');
    const profitOut = document.getElementById('t-profit');
    const bar = document.getElementById('t-bar');
    const status = document.getElementById('t-status');
    const base = { price: 120, cost: 62, feeRate: 0.18, ship: 22 };
    const profitAt = discount => {
      const price = base.price * (1 - discount / 100);
      return price - base.cost - price * base.feeRate - base.ship;
    };
    const full = profitAt(0);

    function render() {
      const discount = Number(range.value);
      const profit = profitAt(discount);
      const lost = Math.round((1 - profit / full) * 100);
      value.value = `${discount}%`;
      profitOut.value = brl.format(profit);
      profitOut.classList.toggle('is-negative', profit < 0);
      bar.style.width = `${Math.max(profit / full, 0) * 100}%`;
      if (profit < 0) {
        status.dataset.level = 'bad';
        status.textContent = 'Agora cada venda dá prejuízo, e o volume só aumenta a perda.';
      } else if (discount === 0) {
        status.dataset.level = 'ok';
        status.textContent = 'Margem de 12%. Parece pouco, mas ainda é lucro.';
      } else {
        status.dataset.level = 'warn';
        status.textContent = `Um desconto de ${discount}% levou ${lost}% do seu lucro.`;
      }
    }

    let touched = false;
    range.addEventListener('input', () => { touched = true; render(); });
    render();

    // Shows the effect once on arrival, so visitors see the slider is alive.
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const demo = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        demo.disconnect();
        const startTime = performance.now();
        const step = now => {
          if (touched) return;
          const progress = Math.min((now - startTime) / 1400, 1);
          range.value = Math.round(progress * 10);
          render();
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.5 });
      demo.observe(testBox);
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
