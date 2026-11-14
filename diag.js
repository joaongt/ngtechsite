// One-minute diagnostic on the Consultoria page.
// Answers stay in the browser; nothing is sent until the visitor opens WhatsApp.
(() => {
  const root = document.querySelector('[data-diag]');
  if (!root) return;

  const steps = [
    { key: 'fase', title: 'Há quanto tempo você vende online?', options: ['Ainda não comecei', 'Comecei há menos de 6 meses', 'Vendo há 6 meses a 2 anos', 'Vendo há mais de 2 anos'] },
    { key: 'canais', title: 'Em quais canais vende ou pretende vender?', hint: 'Pode marcar mais de um.', multi: true, options: ['Mercado Livre', 'Shopee', 'Amazon', 'Magalu', 'Site próprio', 'WhatsApp / Instagram', 'Loja física', 'Ainda estou decidindo'] },
    { key: 'lucro', title: 'Você conhece o lucro real depois de taxas, frete e custos?', options: ['Sim, por produto e canal', 'Tenho uma estimativa geral', 'Não acompanho', 'Ainda não vendo'] },
    { key: 'estoque', title: 'Como controla o estoque hoje?', options: ['ERP / sistema de gestão', 'Planilha', 'Caderno / controle manual', 'Somente no marketplace', 'Não controlo', 'Ainda não tenho estoque'] },
    { key: 'dores', title: 'O que mais atrapalha a operação?', hint: 'Pode marcar mais de um.', multi: true, options: ['Anúncios / catálogo', 'Preços / margem', 'Estoque', 'Integrações', 'Notas fiscais', 'Separação / despacho', 'Atendimento / devoluções', 'Relatórios'] },
    { key: 'quando', title: 'Quando gostaria de começar?', options: ['O quanto antes', 'Neste mês', 'Nos próximos 3 meses', 'Estou pesquisando'] },
  ];
  const phases = {
    comecar: ['NGTech Começar', 'Você está montando a base. O foco é cadastrar, precificar e atender os primeiros pedidos sem criar vícios que custam caro depois.'],
    estruturar: ['NGTech Estruturar', 'Você já vende, e agora a operação precisa de processo. O foco é organizar catálogo, estoque e números para crescer sem perder o controle.'],
    otimizar: ['NGTech Otimizar', 'Sua base está organizada. O foco é ganhar eficiência: gestão em lote, automações e decisões guiadas por margem.'],
  };
  const answers = {};
  let current = 0;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function phaseFor() {
    if (['Ainda não comecei', 'Comecei há menos de 6 meses'].includes(answers.fase)) return 'comecar';
    if (answers.lucro === 'Sim, por produto e canal' && answers.estoque === 'ERP / sistema de gestão') return 'otimizar';
    return 'estruturar';
  }

  function notes() {
    const list = [];
    if (['Tenho uma estimativa geral', 'Não acompanho'].includes(answers.lucro)) {
      list.push('Você ainda não enxerga o lucro por produto e canal. Sem isso, uma promoção pode dar prejuízo sem ninguém perceber.');
    }
    if (['Caderno / controle manual', 'Somente no marketplace', 'Não controlo'].includes(answers.estoque)) {
      list.push('O estoque não tem um controle central. A cada canal novo, cresce o risco de vender o que não está na prateleira.');
    }
    const channels = (answers.canais || []).filter(item => item !== 'Ainda estou decidindo');
    if (channels.length >= 2 && answers.estoque !== 'ERP / sistema de gestão') {
      list.push(`Você citou ${channels.length} canais. Com mais de um, sincronizar estoque e preços evita cancelamentos.`);
    }
    if ((answers.dores || []).length) {
      list.push(`Prioridades que você apontou: ${answers.dores.join(', ').toLowerCase()}.`);
    }
    return list;
  }

  function message(name) {
    const [title] = phases[phaseFor()];
    const lines = [
      'Oi! Fiz o diagnóstico no site da NGTech.',
      name ? `Nome: ${name}` : '',
      `Tempo de operação: ${answers.fase}`,
      `Canais: ${(answers.canais || []).join(', ') || 'não informado'}`,
      `Lucro real: ${answers.lucro}`,
      `Estoque: ${answers.estoque}`,
      `O que mais atrapalha: ${(answers.dores || []).join(', ') || 'não informado'}`,
      `Quando começar: ${answers.quando}`,
      `Sugestão do site: ${title}`,
    ];
    return lines.filter(Boolean).join('\n');
  }

  function render() {
    root.textContent = '';
    const done = current >= steps.length;
    const track = el('div', 'diag-track');
    const bar = el('i');
    bar.style.width = `${(done ? 1 : current / steps.length) * 100}%`;
    track.append(bar);
    track.setAttribute('aria-hidden', 'true');
    root.append(el('p', 'diag-count', done ? 'Seu resultado' : `Pergunta ${current + 1} de ${steps.length}`), track);
    if (done) renderResult(); else renderStep(steps[current]);
  }

  function renderStep(step) {
    const title = el('h3', 'diag-title', step.title);
    title.tabIndex = -1;
    const group = el('div', 'diag-options');
    group.setAttribute('role', 'group');
    const selected = new Set(step.multi ? answers[step.key] || [] : []);
    const next = el('button', 'button', 'Continuar');
    next.type = 'button';
    next.disabled = step.multi && selected.size === 0;

    step.options.forEach(option => {
      const button = el('button', 'diag-option', option);
      button.type = 'button';
      const active = step.multi ? selected.has(option) : answers[step.key] === option;
      button.setAttribute('aria-pressed', String(active));
      button.addEventListener('click', () => {
        if (!step.multi) {
          answers[step.key] = option;
          current += 1;
          render();
          return;
        }
        if (selected.has(option)) selected.delete(option); else selected.add(option);
        button.setAttribute('aria-pressed', String(selected.has(option)));
        next.disabled = selected.size === 0;
      });
      group.append(button);
    });

    root.append(title);
    if (step.hint) root.append(el('p', 'diag-hint', step.hint));
    root.append(group);

    const nav = el('div', 'diag-nav');
    if (current > 0) {
      const back = el('button', 'guide-back', 'Voltar');
      back.type = 'button';
      back.addEventListener('click', () => { current -= 1; render(); });
      nav.append(back);
    }
    if (step.multi) {
      next.addEventListener('click', () => {
        answers[step.key] = step.options.filter(option => selected.has(option));
        current += 1;
        render();
      });
      nav.append(next);
    }
    if (nav.children.length) root.append(nav);
    if (current > 0) title.focus({ preventScroll: true });
  }

  function renderResult() {
    const [title, text] = phases[phaseFor()];
    const heading = el('h3', 'diag-title', `Seu ponto de partida: ${title}`);
    heading.tabIndex = -1;
    root.append(heading, el('p', 'diag-text', text));

    const points = notes();
    if (points.length) {
      const list = el('ul', 'diag-notes');
      points.forEach(point => list.append(el('li', '', point)));
      root.append(list);
    }

    const label = el('label', 'diag-label', 'Seu nome (opcional)');
    const input = el('input');
    input.type = 'text';
    input.autocomplete = 'given-name';
    input.maxLength = 60;
    label.append(input);

    const send = el('a', 'button button-lg', 'Enviar meu diagnóstico pelo WhatsApp');
    send.target = '_blank';
    send.rel = 'noopener noreferrer';
    const update = () => {
      send.href = `https://wa.me/5531984610556?text=${encodeURIComponent(message(input.value.trim()))}`;
    };
    input.addEventListener('input', update);
    update();

    const again = el('button', 'guide-back', 'Refazer');
    again.type = 'button';
    again.addEventListener('click', () => {
      Object.keys(answers).forEach(key => delete answers[key]);
      current = 0;
      render();
    });

    const nav = el('div', 'diag-nav');
    nav.append(send, again);
    root.append(label, nav, el('p', 'diag-hint', 'A mensagem abre pronta no WhatsApp e você pode revisar antes de enviar. Esta é uma indicação inicial; o escopo é definido na conversa.'));
    heading.focus({ preventScroll: true });
  }

  render();
})();
