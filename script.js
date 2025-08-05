document.addEventListener('DOMContentLoaded', function() {
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");
    const items = document.querySelectorAll(".item");
    const dots = document.querySelectorAll(".dot");
    const numbersIndicator = document.querySelector(".numbers");
    const infoButtons = document.querySelectorAll(".btn");
    const header = document.querySelector("header");
    
    let active = 0;
    const total = items.length;
    let timer;
    let isTransitioning = false;

    // Função para verificar se estamos na página index.html
    function isIndexPage() {
        return window.location.pathname.endsWith('index.html') || 
               window.location.pathname === '/' ||
               window.location.pathname.endsWith('/');
    }

    // Função para navegar para produtos
    function navigateToProducts() {
        console.log('Navegando para produtos...');
        
        // Verificar caminhos possíveis
        const possiblePaths = [
            'produtos/produtos.html',
            './produtos/produtos.html',
            '/produtos/produtos.html'
        ];
        
        // Se estivermos na pasta raiz, usar o primeiro caminho
        if (isIndexPage()) {
            window.location.href = possiblePaths[0];
        } else {
            // Tentar navegar relativamente
            window.location.href = possiblePaths[1];
        }
    }

    // Configurar navegação do menu
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach((navItem, index) => {
            const link = navItem.querySelector('a');
            const span = navItem.querySelector('span');
            
            // Remover event listeners existentes
            navItem.removeEventListener('click', handleNavClick);
            if (link) link.removeEventListener('click', handleLinkClick);
            
            // Adicionar novos event listeners
            if (index === 1) { // Item "Produtos"
                if (link) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        navigateToProducts();
                    });
                } else if (span) {
                    navItem.addEventListener('click', function(e) {
                        e.preventDefault();
                        navigateToProducts();
                    });
                }
                
                // Adicionar cursor pointer
                navItem.style.cursor = 'pointer';
                
            } else if (index === 0) { // Item "Home"
                if (link) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (!isIndexPage()) {
                            window.location.href = 'index.html';
                        }
                    });
                }
            } else if (index === 2) { // Item "Contato"
                navItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('Página de contato em desenvolvimento!\n\nEmail: contato@tecnoiso.com\nTelefone: (47) 99999-9999');
                });
                navItem.style.cursor = 'pointer';
            }
        });
    }

    // Funções de animação GSAP
    function animateSlideTransition(currentItem, nextItem, direction) {
        return new Promise((resolve) => {
            gsap.to(currentItem, {
                duration: 0.8,
                opacity: 0,
                x: direction > 0 ? -100 : 100,
                rotationY: direction > 0 ? -30 : 30,
                ease: "power3.inOut",
                onComplete: resolve
            });
        });
    }

    function animateNewSlide(nextItem, direction) {
        gsap.fromTo(nextItem, 
            { opacity: 0, x: direction > 0 ? 100 : -100, rotationY: direction > 0 ? 30 : -30 },
            {
                duration: 0.8,
                opacity: 1,
                x: 0,
                rotationY: 0,
                ease: "power3.inOut"
            }
        );
    }

    function animateSlideElements(item) {
        const words = item.querySelectorAll('.word');
        const description = item.querySelector('.description');
        const priceContainer = item.querySelector('.price-container');
        const img = item.querySelector('.product-img img');
        
        gsap.set(words, { y: 100, rotationX: 90, opacity: 0 });
        gsap.set([description, priceContainer], { y: 30, opacity: 0 });
        gsap.set(img, { x: 300, rotationY: 45, opacity: 0 });
        
        gsap.to(words, {
            y: 0,
            rotationX: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.3
        });
        
        gsap.to(img, {
            x: 0,
            rotationY: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.5
        });
        
        if (item.querySelector('.more-info.show')) {
            gsap.to([description, priceContainer], {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.6
            });
        }
    }

    async function update(direction) {
        if (isTransitioning) return;
        isTransitioning = true;

        const currentItem = document.querySelector(".item.active");
        const currentDot = document.querySelector(".dot.active");
        const next = (active + direction + total) % total;
        const nextItem = items[next];
        const nextDot = dots[next];

        await animateSlideTransition(currentItem, nextItem, direction);
        
        currentItem.classList.remove("active");
        currentDot.classList.remove("active");
        
        nextItem.classList.add("active");
        nextDot.classList.add("active");
        
        animateNewSlide(nextItem, direction);
        animateSlideElements(nextItem);

        active = next;
        updateNumberWithEffect(active + 1);
        isTransitioning = false;
    }

    function updateNumberWithEffect(num) {
        gsap.to(numbersIndicator, {
            duration: 0.3,
            y: -10,
            opacity: 0,
            ease: "power1.out",
            onComplete: () => {
                numbersIndicator.textContent = String(num).padStart(2, "0");
                gsap.to(numbersIndicator, {
                    duration: 0.3,
                    y: 0,
                    opacity: 1,
                    ease: "power1.in"
                });
            }
        });
    }

    function startTimer() {
        clearInterval(timer);
        
        timer = setInterval(() => {
            update(1);
        }, 5000);
    }

    function setupButtonInteractions() {
        infoButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const moreInfo = this.parentElement.querySelector('.more-info');
                const isShowing = moreInfo.classList.toggle('show');
                this.querySelector('.btn-text').textContent = isShowing ? 'Mostrar menos' : 'Saiba mais';
                
                if (isShowing) {
                    gsap.to(moreInfo, {
                        maxHeight: 500,
                        duration: 0.8,
                        ease: "power2.inOut"
                    });
                    gsap.to([moreInfo.querySelector('.description'), moreInfo.querySelector('.price-container')], {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.1
                    });
                } else {
                    gsap.to(moreInfo, {
                        maxHeight: 0,
                        duration: 0.8,
                        ease: "power2.inOut",
                        onComplete: () => {
                            gsap.set([moreInfo.querySelector('.description'), moreInfo.querySelector('.price-container')], 
                            { y: 30, opacity: 0 });
                        }
                    });
                }
            });
        });
    }

    function setupArrowInteractions() {
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                update(-1);
                startTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function() {
                update(1);
                startTimer();
            });
        }
    }

    function setupDotInteractions() {
        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                if (index !== active) {
                    update(index - active);
                    startTimer();
                }
            });
        });
    }

    function setupHeaderEffects() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                gsap.to(header, {
                    y: -100,
                    opacity: 0.8,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                gsap.to(header, {
                    y: 0,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
            
            lastScrollY = currentScrollY;
        });
    }

    function setupKeyboardNavigation() {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') {
                update(-1);
                startTimer();
            } else if (e.key === 'ArrowRight') {
                update(1);
                startTimer();
            }
        });
    }

    // Configurar carrinho
    function setupCart() {
        const cartButton = document.getElementById('cartButton');
        const cartCount = document.getElementById('cartCount');
        
        if (cartButton && cartCount) {
            cartButton.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Carrinho de compras disponível na página de produtos!\n\nClique em "Produtos" para ver nosso catálogo completo.');
                
                // Opcional: redirecionar para produtos
                setTimeout(() => {
                    navigateToProducts();
                }, 1000);
            });
            
            // Definir contador inicial
            cartCount.textContent = '0';
        }
    }

    // Função de debug
    function debugNavigation() {
        console.log('🔍 Debug da navegação:');
        console.log('- Página atual:', window.location.pathname);
        console.log('- É página index?', isIndexPage());
        
        const navItems = document.querySelectorAll('.nav-item');
        console.log('- Items de navegação encontrados:', navItems.length);
        
        navItems.forEach((item, index) => {
            const link = item.querySelector('a');
            const span = item.querySelector('span');
            console.log(`  Item ${index}: link=${!!link}, span=${!!span}`);
            if (link) console.log(`    Link href: ${link.getAttribute('href')}`);
            if (span) console.log(`    Span text: ${span.textContent}`);
        });
    }

    function init() {
        // Debug inicial
        debugNavigation();
        
        // Animação inicial
        gsap.from('header', {
            y: -50,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
        
        gsap.from('.nav-item', {
            y: -20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            delay: 0.3,
            ease: "back.out(1.7)"
        });
        
        gsap.from('.cart-icon', {
            scale: 0,
            rotation: 180,
            duration: 0.8,
            delay: 0.5,
            ease: "elastic.out(1, 0.5)"
        });

        // Configurar todas as interações
        setupNavigation();
        setupButtonInteractions();
        setupArrowInteractions();
        setupDotInteractions();
        setupHeaderEffects();
        setupKeyboardNavigation();
        setupCart();
        
        // Iniciar timer se estivermos na página index
        if (isIndexPage()) {
            startTimer();
            updateNumberWithEffect(1);
        }
        
        console.log('🚀 Tecnoiso Enhanced - Navegação corrigida!');
    }

    // Inicializar tudo
    init();

    // Código Konami mantido
    let konami = [];
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    document.addEventListener('keydown', e => {
        konami.push(e.keyCode);
        konami = konami.slice(-konamiCode.length);
        
        if (konami.join('') === konamiCode.join('')) {
            createMatrixRain();
            konami = [];
        }
    });

    function createMatrixRain() {
        console.log("🎮 Konami code activated!");
        
        // Criar efeito Matrix
        const matrixContainer = document.createElement('div');
        matrixContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            pointer-events: none;
        `;
        
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.textContent = Math.random() > 0.5 ? '1' : '0';
            drop.style.cssText = `
                position: absolute;
                color: #00ff00;
                font-family: monospace;
                font-size: 20px;
                left: ${Math.random() * 100}%;
                animation: matrix-fall 2s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            matrixContainer.appendChild(drop);
        }
        
        // Adicionar CSS para animação
        const matrixStyle = document.createElement('style');
        matrixStyle.textContent = `
            @keyframes matrix-fall {
                0% { top: -20px; opacity: 1; }
                100% { top: 100vh; opacity: 0; }
            }
        `;
        document.head.appendChild(matrixStyle);
        document.body.appendChild(matrixContainer);
        
        // Remover após 3 segundos
        setTimeout(() => {
            matrixContainer.remove();
            matrixStyle.remove();
        }, 3000);
    }
});