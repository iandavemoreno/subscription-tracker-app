class BillPage {
    constructor(page) {
        this.page = page;

        this.nameInput = page.locator('#bill-name');
        this.amountInput = page.locator('#bill-amount');
        this.dueDateInput = page.locator('#bill-due-date');
        this.categorySelect = page.locator('#bill-category');
        this.recurrenceSelect = page.locator('#bill-recurrence');
        this.addButton = page.locator('#add-bill-form button[type="submit"]');

        this.billList = page.locator('#bill-list');
        this.summary = page.locator('#summary');
    }

    async goto() {
        await this.page.goto('/');
    }

    async addBill(name, amount, dueDate, category, recurrence) {
        await this.nameInput.fill(name);
        await this.amountInput.fill(String(amount));
        await this.dueDateInput.fill(dueDate);
        await this.categorySelect.selectOption(category);
        await this.recurrenceSelect.selectOption(recurrence);

        const addResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/bills') &&
            resp.request().method() === 'POST'
        );

        await this.addButton.click();
        await addResponsePromise;
    }

    getBill(name) {
        return this.billList.locator('.bill', { hasText: name });
    }

    async togglePaid(name) {
        const checkbox = this.getBill(name).locator('input[type="checkbox"]');

        const toggleResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/toggle-paid') &&
            resp.request().method() === 'PATCH'
        );

        await checkbox.click();
        await toggleResponsePromise;
    }

    async deleteBill(name) {
        const deleteResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/bills/') &&
            resp.request().method() === 'DELETE'
        );

        await this.getBill(name).locator('button:has-text("Delete")').click();
        await deleteResponsePromise;
    }

    async editBill(currentName, newName, newAmount, newDueDate, newCategory, newRecurrence) {
        await this.getBill(currentName).locator('button:has-text("Edit")').click();

        await this.nameInput.fill(newName);
        await this.amountInput.fill(String(newAmount));
        await this.dueDateInput.fill(newDueDate);
        await this.categorySelect.selectOption(newCategory);
        await this.recurrenceSelect.selectOption(newRecurrence);

        const editResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/bills/') &&
            resp.request().method() === 'PUT'
        );

        await this.addButton.click();
        await editResponsePromise;
    }
}

module.exports = BillPage;