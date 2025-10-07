import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/app.js',
        'resources/js/employment/index.js',
        'resources/js/employee-attendance/index.js',
        'resources/js/sallary-income/index.js',
        'resources/js/master-data/payroll/index.js'
      ],
      refresh: true,
    }),
  ],
});
