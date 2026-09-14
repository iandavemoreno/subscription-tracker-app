const { test, expect } = require('@playwright/test');
const BillPage = require('../pages/BillPage');
const { createTestBillName } = require('./helpers/test-data');

test('adding a bill shows it in the list with correct details', async ({ page }) => {
    const billPage = new BillPage(page);
    await billPage.goto();

    const billName = createTestBillName('Netflix');
    await billPage.addBill(billName, 199, '2026-10-15', 'Streaming', 'Monthly');

    const bill = billPage.getBill(billName);
    await expect(bill).toContainText(billName);
    await expect(bill).toContainText('199.00');
    await expect(bill).toContainText('Streaming');
    await expect(bill).toContainText('Monthly');

    // ------------------------------------------------
    // CLEAN UP TEST BILL
    // ------------------------------------------------
    await billPage.deleteBill(billName);
    await expect(billPage.billList).not.toContainText(billName);
});

test('marking a bill as paid updates its state', async ({ page }) => {
    const billPage = new BillPage(page);
    await billPage.goto();

    const billName = createTestBillName('Electricity');
    await billPage.addBill(billName, 1500, '2026-10-05', 'Utilities', 'Monthly');

    await billPage.togglePaid(billName);

    await expect(billPage.getBill(billName)).toHaveClass(/paid/);

    // ------------------------------------------------
    // CLEAN UP TEST BILL
    // ------------------------------------------------
    await billPage.deleteBill(billName);
    await expect(billPage.billList).not.toContainText(billName);
});

test('editing a bill updates its name, amount, category, and recurrence', async ({ page }) => {
    const billPage = new BillPage(page);
    await billPage.goto();

    const originalName = createTestBillName('Spotify');
    const updatedName = createTestBillName('Disney Plus');

    await billPage.addBill(originalName, 149, '2026-10-20', 'Streaming', 'Monthly');

    await billPage.editBill(originalName, updatedName, 350, '2026-11-01', 'Subscriptions', 'Yearly');

    const bill = billPage.getBill(updatedName);
    await expect(bill).toContainText(updatedName);
    await expect(bill).toContainText('350.00');
    await expect(bill).toContainText('Subscriptions');
    await expect(bill).toContainText('Yearly');
    await expect(billPage.billList).not.toContainText(originalName);

    // ------------------------------------------------
    // CLEAN UP TEST BILL
    // ------------------------------------------------
    await billPage.deleteBill(updatedName);
    await expect(billPage.billList).not.toContainText(updatedName);
});

test('an unpaid bill past its due date is marked overdue', async ({ page }) => {
    const billPage = new BillPage(page);
    await billPage.goto();

    const billName = createTestBillName('Water Bill');
    await billPage.addBill(billName, 800, '2020-01-01', 'Utilities', 'Monthly');

    const bill = billPage.getBill(billName);
    await expect(bill).toHaveClass(/overdue/);
    await expect(bill).toContainText('Overdue');

    await billPage.togglePaid(billName);

    await expect(bill).not.toHaveClass(/overdue/);
    await expect(bill).not.toContainText('Overdue');

    // ------------------------------------------------
    // CLEAN UP TEST BILL
    // ------------------------------------------------
    await billPage.deleteBill(billName);
    await expect(billPage.billList).not.toContainText(billName);
});