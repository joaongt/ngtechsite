const demoFields = ['demo-cost', 'demo-fixed', 'demo-fee', 'demo-margin']
  .map(id => document.getElementById(id));
const demoPrice = document.getElementById('demo-price');
const demoNote = document.getElementById('demo-note');
const initialNote = demoNote.textContent;
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function updatePrice() {
  const [cost, fixed, fee, margin] = demoFields.map(field => field.valueAsNumber);
  const remainder = (100 - fee - margin) / 100;
  const valid = demoFields.every(field => field.validity.valid && Number.isFinite(field.valueAsNumber));
  const price = (cost + fixed) / remainder;

  if (!valid || remainder <= 0 || !Number.isFinite(price)) {
    demoPrice.value = '—';
    demoNote.textContent = 'Preencha todos os campos com valores válidos. A soma da tarifa e da margem deve ser menor que 100%.';
    return;
  }

  const cents = Math.ceil(Number((price * 100).toFixed(8)));
  demoPrice.value = currency.format(cents / 100);
  demoNote.textContent = initialNote;
}

demoFields.forEach(field => field.addEventListener('input', updatePrice));
updatePrice();
