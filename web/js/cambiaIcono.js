export function cambiaIcono() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        const iconos = document.querySelectorAll('.bi-moon-fill');
        for (const icono of iconos) {
            icono.classList.remove('bi-moon-fill');
            icono.classList.add('bi-sun-fill');
        }
    }
}