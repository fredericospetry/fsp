// Navegação entre seções
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active de todos os itens
        menuItems.forEach(i => i.classList.remove('active'));
        
        // Adiciona active ao item clicado
        this.classList.add('active');
        
        // Esconde todas as seções
        sections.forEach(s => s.classList.remove('active'));
        
        // Mostra a seção correspondente
        const sectionId = this.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Toggle menu em mobile
const sidebar = document.querySelector('.sidebar');
const btnMenuMobile = document.querySelector('.btn-menu-mobile');

if (btnMenuMobile) {
    btnMenuMobile.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
    });
}

// Fecha menu ao clicar em um link (mobile)
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {

    /* ===== Matrix Effect Sidebar (Original Style – FIXED) ===== */

    const canvas = document.getElementById('matrix-sidebar');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sidebar = document.querySelector('.sidebar');

    // Caracteres Matrix
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()-_=+[]{}|;:",.<>?/\\`~';
    const fontSize = 11.5;

    let columns = 0;
    let drops = [];
    let frame = 0;

    const radialSpeed = 0.4;

    function resizeAndReinit() {
        const w = sidebar.offsetWidth;
        const h = sidebar.offsetHeight;

        if (w === 0 || h === 0) return;

        canvas.width = w;
        canvas.height = h;

        const newColumns = Math.floor(w / fontSize);

        // Evita recriação desnecessária
        if (newColumns === columns && drops.length) return;

        columns = newColumns;
        drops = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
        }
    }

    function getRadialForFrame() {
        const h = (frame * radialSpeed) % 360;
        const g = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            Math.min(canvas.width, canvas.height) * 0.05,
            canvas.width / 2,
            canvas.height / 2,
            Math.max(canvas.width, canvas.height)
        );

        g.addColorStop(0, `hsl(${h}, 80%, 60%)`);
        g.addColorStop(0.5, `hsl(${(h + 90) % 360}, 70%, 45%)`);
        g.addColorStop(1, `hsl(${(h + 180) % 360}, 60%, 30%)`);

        return g;
    }

    function drawMatrix() {
        if (!drops.length) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = getRadialForFrame();

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        frame++;
    }

    // Inicialização segura
    resizeAndReinit();

    // Observa mudanças reais de largura (expansão do menu)
    let lastWidth = sidebar.offsetWidth;

    setInterval(() => {
        const w = sidebar.offsetWidth;
        if (w !== lastWidth) {
            lastWidth = w;
            resizeAndReinit();
        }
    }, 80);

    window.addEventListener('resize', resizeAndReinit);

    setInterval(drawMatrix, 45);
});

// Desativar botão direito do mouse (bloqueia o menu de contexto)
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});