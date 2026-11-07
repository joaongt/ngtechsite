// Profit calculator used on the Planilhas page.
(() => {
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const pct = value => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const whatsapp = text => `https://wa.me/5531989878715?text=${encodeURIComponent(text)}`;

  // Profit calculator.
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const field = id => document.getElementById(id);
    const inputs = ['c-price', 'c-cost', 'c-fee', 'c-ship', 'c-orders'].map(field);
    const big = field('r-profit');
    const margin = field('r-margin');
    const month = field('r-month');
    const status = field('r-status');
    const cta = field('r-cta');
    const segments = calc.querySelectorAll('[data-calc-seg]');

    function update() {
      const [price, cost, feeRate, ship, orders] = inputs.map(input => Math.max(Number(input.value) || 0, 0));
      if (price <= 0) {
        big.value = '—';
        margin.value = '—';
        month.value = '—';
        status.dataset.level = 'warn';
        status.textContent = 'Informe um preço de venda para ver o resultado.';
        return;
      }
      const fee = price * (feeRate / 100);
      const profit = price - cost - fee - ship;
      const rate = (profit / price) * 100;
      big.value = brl.format(profit);
      big.classList.toggle('is-negative', profit < 0);
      margin.value = pct(rate);
      month.value = brl.format(profit * orders);

      const total = cost + fee + ship + Math.max(profit, 0);
      const parts = { cost, fee, ship, profit: Math.max(profit, 0) };
      segments.forEach(node => {
        node.style.width = `${total > 0 ? (parts[node.dataset.calcSeg] / total) * 100 : 0}%`;
      });

      if (profit < 0) {
        status.dataset.level = 'bad';
        status.textContent = 'Atenção: com esses números, cada venda dá prejuízo.';
      } else if (rate < 15) {
        status.dataset.level = 'warn';
        status.textContent = 'Margem apertada: uma promoção ou aumento de frete pode zerar o lucro.';
      } else {
        status.dataset.level = 'ok';
        status.textContent = 'Boa base. Vale conferir se essa margem se mantém com promoções e devoluções.';
      }
      cta.href = whatsapp(`Oi! Fiz a simulação no site da NGTech e minha margem deu ${pct(rate)}. Quero revisar minha precificação.`);
    }

    calc.querySelectorAll('input[type=range]').forEach(range => {
      const number = field(range.dataset.for);
      range.addEventListener('input', () => { number.value = range.value; update(); });
      number.addEventListener('input', () => { range.value = number.value; update(); });
    });
    update();
  }
})();
