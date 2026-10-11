// app.js
document.addEventListener('DOMContentLoaded', () => {
  // State
  const transactions = [];

  // DOM elements
  const descInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const typeSelect = document.getElementById('type');
  const addBtn = document.getElementById('addBtn');
  const tbody = document.querySelector('#transactionTable tbody');
  const totalIncomeSpan = document.getElementById('totalIncome');
  const totalExpenseSpan = document.getElementById('totalExpense');
  const balanceSpan = document.getElementById('balance');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let currentFilter = 'all';

  // Helper: format currency
  const formatMoney = (num) => Number(num).toFixed(2).replace(/\d(?=(\d{3})+(?!\d))/g, '$&,');

  // Render table & summary
  function render() {
    // Filter transactions
    let filtered = transactions;
    if (currentFilter === 'income') {
      filtered = transactions.filter(t => t.type === 'income');
    } else if (currentFilter === 'expense') {
      filtered = transactions.filter(t => t.type === 'expense');
    }

    tbody.innerHTML = '';

    filtered.forEach((t) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${escapeHtml(t.description)}</td>
        <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">${t.type === 'income' ? '+' : '-'} ${formatMoney(t.amount)}</td>
        <td>${t.dateTime}</td>
        <td><button class="delete-btn" data-id="${t.id}">ลบ</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        deleteTransaction(id);
      });
    });

    updateSummary();
  }

  function updateSummary() {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    totalIncomeSpan.textContent = formatMoney(totalIncome);
    totalExpenseSpan.textContent = formatMoney(totalExpense);
    balanceSpan.textContent = formatMoney(balance);
    balanceSpan.classList.toggle('negative', balance < 0);
  }

  function deleteTransaction(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
      render();
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  function generateId() {
    return Date.now() + Math.random();
  }

  function addTransaction() {
    const desc = descInput.value.trim();
    const amountStr = amountInput.value.trim();
    const type = typeSelect.value;

    if (!desc) {
      alert('กรุณากรอกรายละเอียด');
      descInput.focus();
      return;
    }

    const amount = parseFloat(amountStr);
    if (Number.isNaN(amount) || amount <= 0) {
      alert('กรุณากรอกจำนวณเงินที่มากกว่า 0');
      amountInput.focus();
      return;
    }

    const newTrans = {
      id: generateId(),
      description: desc,
      amount: amount,
      type: type,
      dateTime: new Date().toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    transactions.push(newTrans);
    descInput.value = '';
    amountInput.value = '';
    typeSelect.value = 'income';
    descInput.focus();
    render();
  }

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  addBtn.addEventListener('click', addTransaction);

  // Initial render (empty)
  render();
});