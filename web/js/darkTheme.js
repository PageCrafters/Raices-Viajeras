// Aplico el tema lo antes posible para que la pagina no haga un destello al cargar.
// Lo dejo simple a proposito porque solo hace falta leer la preferencia y pintar la clase.
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark-mode');
}
