<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ניהול תקציב חודשי</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9; }
    h1, h2 { margin-top: 20px; }
    select, button, input { padding: 6px; margin: 5px 0; }
    .expense-list { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; max-width: 500px; background:#fff; border-radius:8px; }
    .row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #eee; }
    .row:last-child { border-bottom:none; }
    .add-form { margin-top:10px; padding:10px; background:#eef; border-radius:8px; max-width:500px; }
  </style>
</head>
<body>

<h1>ניהול תקציב חודשי</h1>

<label>בחר חודש:</label>
<select id="monthSelect"></select>

<h2>הכנסות והוצאות קבועות</h2>
<div id="fixedExpenses" class="expense-list"></div>

<h2>הוצאות מזדמנות</h2>
<div id="variableExpenses" class="expense-list"></div>

<div class="add-form">
  <h3>➕ הוסף הוצאה מזדמנת</h3>
  <input type="date" id="varDate">
  <input type="text" id="varCategory" placeholder="קטגוריה">
  <input type="number" id="varAmount" placeholder="סכום">
  <button onclick="addVariableExpense()">הוסף</button>
</div>

<h2>תקציב</h2>
<p>יתרה: <span id="balance">0</span> ₪</p>
<p>ימים שנותרו: <span id="daysLeft">0</span></p>
<p>תקציב יומי: <span id="dailyBudget">0</span> ₪</p>

<script>
(function () {
  'use strict';

  // ===== נתוני חודשים =====
  var months = [
    {id: '2025-08', name: 'אוגוסט 2025', start: '2025-08-01', end: '2025-08-31'},
    {id: '2025-09', name: 'ספטמבר 2025', start: '2025-09-01', end: '2025-09-30'}
  ];

  // ===== נתוני קבועות =====
  var fixedExpenses = [
    {monthId: '2025-08', category: 'משכורת', amount: 14000, type: 'income'},
    {monthId: '2025-08', category: 'שכירות', amount: 4500, type: 'expense'},
    {monthId: '2025-08', category: 'ביטוח', amount: 1200, type: 'expense'},
    {monthId: '2025-09', category: 'משכורת', amount: 14000, type: 'income'},
    {monthId: '2025-09', category: 'שכירות', amount: 4500, type: 'expense'},
    {monthId: '2025-09', category: 'ביטוח', amount: 1200, type: 'expense'}
  ];

  // ===== נתוני מזדמנות =====
  var variableExpenses = [
    {monthId: '2025-08', date: '2025-08-03', category: 'דלק', amount: 300},
    {monthId: '2025-08', date: '2025-08-04', category: 'מסעדה', amount: 220}
  ];

  // ===== יצירת רשימת חודשים =====
  var monthSelect = document.getElementById('monthSelect');
  months.forEach(function (m) {
    var option = document.createElement('option');
    option.value = m.id;
    option.textContent = m.name;
    monthSelect.appendChild(option);
  });
  monthSelect.addEventListener('change', updateMonth);

  // ===== פונקציית עדכון חודש =====
  function updateMonth() {
    var monthId = monthSelect.value;

    // קבועות
    var fixedDiv = document.getElementById('fixedExpenses');
    fixedDiv.innerHTML = '';
    var fixedForMonth = fixedExpenses.filter(function (f) { return f.monthId === monthId; });
    fixedForMonth.forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = '<b>' + f.category + '</b> (' + f.type + ') <span>' + f.amount + ' ₪</span>';
      fixedDiv.appendChild(row);
    });

    // מזדמנות
    var variableDiv = document.getElementById('variableExpenses');
    variableDiv.innerHTML = '';
    var variableForMonth = variableExpenses.filter(function (v) { return v.monthId === monthId; })
      .sort(function(a,b){ return new Date(a.date) - new Date(b.date); });
    variableForMonth.forEach(function (v) {
      var row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = v.date + ' - ' + v.category + ' <span>' + v.amount + ' ₪</span>';
      variableDiv.appendChild(row);
    });

    // חישובים
    var totalIncome = fixedForMonth.filter(function (f) { return f.type === 'income'; }).reduce(function (a, b) { return a + b.amount; }, 0);
    var totalFixed = fixedForMonth.filter(function (f) { return f.type === 'expense'; }).reduce(function (a, b) { return a + b.amount; }, 0);
    var totalVariable = variableForMonth.reduce(function (a, b) { return a + b.amount; }, 0);
    var balance = totalIncome - totalFixed - totalVariable;

    var today = new Date();
    var monthEnd = new Date(months.find(function(m){ return m.id === monthId; }).end);
    var daysLeft = Math.max(0, Math.ceil((monthEnd - today) / (1000 * 60 * 60 * 24)));
    var dailyBudget = daysLeft > 0 ? (balance / daysLeft).toFixed(2) : 0;

    document.getElementById('balance').textContent = balance;
    document.getElementById('daysLeft').textContent = daysLeft;
    document.getElementById('dailyBudget').textContent = dailyBudget;
  }

  // ===== פונקציה להוספת הוצאה מזדמנת =====
  window.addVariableExpense = function () {
    var date = document.getElementById('varDate').value;
    var category = document.getElementById('varCategory').value;
    var amount = parseFloat(document.getElementById('varAmount').value);
    var monthId = monthSelect.value;

    if (!date || !category || isNaN(amount)) {
      return alert('נא למלא את כל השדות');
    }

    variableExpenses.push({monthId: monthId, date: date, category: category, amount: amount});

    // איפוס טופס
    document.getElementById('varDate').value = '';
    document.getElementById('varCategory').value = '';
    document.getElementById('varAmount').value = '';

    updateMonth();
  };

  // ===== אתחול =====
  monthSelect.value = months[0].id;
  updateMonth();

})();
</script>

</body>
</html>
