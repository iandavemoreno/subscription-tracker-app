const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3002',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: {
        command: 'node server.js',
        url: 'http://localhost:3002',
        reuseExistingServer: !process.env.CI,
    },
});