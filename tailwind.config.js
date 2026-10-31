/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './404.html'],
    darkMode: 'class',
    theme: {
        // Fluid page width: full width with a uniform side gutter, capped once at 96rem (1536px, more on
        // large displays where the root font size grows) - the default container jumps at every breakpoint
        container: {
            center: true,
            padding: 'var(--page-gutter)',
            screens: { '2xl': '96rem' }
        },
        extend: {
            colors: {
                brand: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                }
            }
        }
    }
}
