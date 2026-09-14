let allBills = [];
let editingBillId = null;

function loadBills() {
    fetch('/api/bills')
        .then(function (response) {
            return response.json();
        })
        .then(function (bills) {
            allBills = bills;
            renderBills(bills);
            renderSummary(bills);
        });
}

function renderSummary(bills) {
    const summaryEl = document.getElementById('summary');

    const totalMonthly = bills
        .filter(function (bill) {
            return bill.recurrence === 'Monthly';
        })
        .reduce(function (sum, bill) {
            return sum + bill.amount;
        }, 0);

    summaryEl.textContent = 'Total Monthly Bills: ₱' + totalMonthly.toFixed(2);
}

function renderBills(bills) {
    const listEl = document.getElementById('bill-list');

    if (bills.length === 0) {
        listEl.innerHTML = '<p>No bills added yet.</p>';
        return;
    }

    const today = getTodayString();
    let html = '';

    bills.forEach(function (bill) {
        const isPaid = bill.paid === 1;
        const isOverdue = !isPaid && bill.due_date < today;

        let classes = 'bill';
        if (isPaid) classes += ' paid';
        if (isOverdue) classes += ' overdue';

        html += '<div class="' + classes + '">';
        html += '<input type="checkbox" ' + (isPaid ? 'checked' : '') +
            ' onchange="togglePaid(' + bill.id + ')" aria-label="Mark ' + bill.name + ' as paid">';
        html += '<div class="bill-info">';
        html += '<div class="bill-name">' + bill.name + (isOverdue ? ' <span class="overdue-label">Overdue</span>' : '') + '</div>';
        html += '<div class="bill-meta">\u20b1' + bill.amount.toFixed(2) + ' &bull; Due ' + bill.due_date +
            ' &bull; ' + bill.category + ' &bull; ' + bill.recurrence + '</div>';
        html += '</div>';
        html += '<button onclick="editBill(' + bill.id + ')">Edit</button>';
        html += '<button onclick="deleteBill(' + bill.id + ')">Delete</button>';
        html += '</div>';
    });

    listEl.innerHTML = html;
}

function togglePaid(id) {
    fetch('/api/bills/' + id + '/toggle-paid', {
        method: 'PATCH'
    })
    .then(function () {
        loadBills();
    });
}

function deleteBill(id) {
    fetch('/api/bills/' + id, {
        method: 'DELETE'
    })
    .then(function () {
        loadBills();
    });
}

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function editBill(id) {
    const bill = allBills.find(function (b) {
        return b.id === id;
    });

    if (!bill) {
        return;
    }

    document.getElementById('bill-name').value = bill.name;
    document.getElementById('bill-amount').value = bill.amount;
    document.getElementById('bill-due-date').value = bill.due_date;
    document.getElementById('bill-category').value = bill.category;
    document.getElementById('bill-recurrence').value = bill.recurrence;

    editingBillId = id;
    document.getElementById('form-submit-btn').textContent = 'Save Changes';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
}

function cancelEdit() {
    editingBillId = null;
    document.getElementById('add-bill-form').reset();
    document.getElementById('form-submit-btn').textContent = 'Add Bill';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

document.getElementById('add-bill-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const nameInput = document.getElementById('bill-name');
    const amountInput = document.getElementById('bill-amount');
    const dueDateInput = document.getElementById('bill-due-date');
    const categoryInput = document.getElementById('bill-category');
    const recurrenceInput = document.getElementById('bill-recurrence');

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const due_date = dueDateInput.value;
    const category = categoryInput.value;
    const recurrence = recurrenceInput.value;

    if (!name) {
        alert('Please enter a bill name.');
        return;
    }

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    if (!due_date) {
        alert('Please select a due date.');
        return;
    }

    if (!category) {
        alert('Please select a category.');
        return;
    }

    if (!recurrence) {
        alert('Please select a recurrence.');
        return;
    }

    const isEditing = editingBillId !== null;
    const url = isEditing ? '/api/bills/' + editingBillId : '/api/bills';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            amount: amount,
            due_date: due_date,
            category: category,
            recurrence: recurrence
        })
    })
    .then(function (response) {
        return response.json();
    })
    .then(function () {
        cancelEdit();
        loadBills();
    });
});

document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);

loadBills();