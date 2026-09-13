// =======================================================
// 1. ENGINE DE PARTÍCULAS 3D INTERATIVO DA TELA DE ENTRADA
// =======================================================
const canvas = document.getElementById('canvas3d');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let mouse = { x: null, y: null, radius: 120 };

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Suporte ao Toque 3D no Celular
window.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 20) + 5;
        this.color = Math.random() > 0.5 ? '#00f2fe' : '#0072ff';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function init3DParticles() {
    particlesArray = [];
    let numberOfParticles = (canvas.width * canvas.height) / 5000;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animate3DParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
    }
    requestAnimationFrame(animate3DParticles);
}

init3DParticles();
animate3DParticles();


// =======================================================
// 2. GERENCIAMENTO REAL DE PRODUTOS (SEM DADOS FALSOS)
// =======================================================
let products = JSON.parse(localStorage.getItem('conexao2d_products')) || [];
let cartCount = 0;

const productList = document.getElementById('product-list');
const countElement = document.getElementById('total-products-count');

function renderProducts(itemsToRender = products) {
    productList.innerHTML = '';
    
    // Atualiza contagem verdadeira de itens
    countElement.innerText = `${itemsToRender.length} ${itemsToRender.length === 1 ? 'produto disponível' : 'produtos disponíveis'}`;

    if (itemsToRender.length === 0) {
        productList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #94a3b8;">
                <p style="font-size: 1.1rem;">Nenhum produto cadastrado no momento.</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Acesse o <a href="admin.html" style="color: #00f2fe;">Painel ADM</a> com sua senha para adicionar itens da galeria.</p>
            </div>
        `;
        return;
    }

    itemsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</p>
            <button class="btn-buy" onclick="buyOnWhatsApp('${product.name}', ${product.price})">Comprar no WhatsApp</button>
        `;
        
        productList.appendChild(productCard);
    });
}

function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    renderProducts(filtered);
}

function buyOnWhatsApp(productName, price) {
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;

    const phoneNumber = "5511913407970"; 
    const message = `Olá! Quero comprar o produto: *${productName}* no valor de *R$ ${parseFloat(price).toFixed(2).replace('.', ',')}* visto no site da Conexão 2D!`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

renderProducts();