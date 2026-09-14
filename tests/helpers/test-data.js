function uniqueSuffix() {
    return Date.now() + '' + Math.floor(Math.random() * 1000000);
}

function createTestBillName(prefix) {
    return (prefix || 'Test Bill') + ' ' + uniqueSuffix();
}

module.exports = { createTestBillName };