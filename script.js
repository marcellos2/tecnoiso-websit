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

    // Verificar se GSAP está carregado
    function checkGSAP() {
        if (typeof gsap === 'undefined') {
            console.error('❌ GSAP não está carregado! Verifique se o script está incluído no HTML.');
            return false;
        }
        console.log('✅ GSAP carregado com sucesso!');
        return true;
    }

    // Função para verificar se estamos na página index.html
    function isIndexPage() {
        return window.location.pathname.endsWith('index.html') || 
               window.location.pathname === '/' ||
               window.location.pathname.endsWith('/');
    }

    // Função para navegar para produtos
    function navigateToProducts() {
        console.log('Navegando para produtos...');
        
        const possiblePaths = [
            'produtos/produtos.html',
            './produtos/produtos.html',
            '/produtos/produtos.html'
        ];
        
        if (isIndexPage()) {
            window.location.href = possiblePaths[0];
        } else {
            window.location.href = possiblePaths[1];
        }
    }

    // Configurar navegação do menu
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach((navItem, index) => {
            const link = navItem.querySelector('a');
            const span = navItem.querySelector('span');
            
            if (index === 1) { // Item "Produtos"
                const clickHandler = function(e) {
                    e.preventDefault();
                    navigateToProducts();
                };
                
                if (link) {
                    link.addEventListener('click', clickHandler);
                } else if (span) {
                    navItem.addEventListener('click', clickHandler);
                }
                
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

    // Funções de animação GSAP - Com fallback se GSAP não estiver disponível
    function animateSlideTransition(currentItem, nextItem, direction) {
        return new Promise((resolve) => {
            if (!checkGSAP()) {
                // Fallback sem GSAP
                currentItem.style.opacity = '0';
                resolve();
                return;
            }

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
        if (!checkGSAP()) {
            // Fallback sem GSAP
            nextItem.style.opacity = '1';
            nextItem.style.transform = 'translateX(0) rotateY(0)';
            return;
        }

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
        if (!checkGSAP()) return;

        const words = item.querySelectorAll('.word');
        const description = item.querySelector('.description');
        const priceContainer = item.querySelector('.price-container');
        const img = item.querySelector('.product-img img');
        
        // Reset inicial
        gsap.set(words, { y: 100, rotationX: 90, opacity: 0 });
        gsap.set([description, priceContainer], { y: 30, opacity: 0 });
        gsap.set(img, { x: 300, rotationY: 45, opacity: 0 });
        
        // Animações
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
        
        // Animar descrição se estiver visível
        const moreInfo = item.querySelector('.more-info');
        if (moreInfo && moreInfo.classList.contains('show')) {
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
        if (isTransitioning || total === 0) return;
        
        console.log(`🔄 Atualizando slide: direção ${direction}, ativo atual: ${active}`);
        
        isTransitioning = true;

        const currentItem = document.querySelector(".item.active");
        const currentDot = document.querySelector(".dot.active");
        
        if (!currentItem || !currentDot) {
            console.error('❌ Item ou dot ativo não encontrado!');
            isTransitioning = false;
            return;
        }

        const next = (active + direction + total) % total;
        const nextItem = items[next];
        const nextDot = dots[next];

        if (!nextItem || !nextDot) {
            console.error('❌ Próximo item ou dot não encontrado!');
            isTransitioning = false;
            return;
        }

        // Executar transição
        await animateSlideTransition(currentItem, nextItem, direction);
        
        // Atualizar classes
        currentItem.classList.remove("active");
        currentDot.classList.remove("active");
        
        nextItem.classList.add("active");
        nextDot.classList.add("active");
        
        // Animar novo slide
        animateNewSlide(nextItem, direction);
        animateSlideElements(nextItem);

        active = next;
        updateNumberWithEffect(active + 1);
        isTransitioning = false;
        
        console.log(`✅ Slide atualizado para: ${active + 1}`);
    }

    function updateNumberWithEffect(num) {
        if (!numbersIndicator) return;

        if (!checkGSAP()) {
            // Fallback sem GSAP
            numbersIndicator.textContent = String(num).padStart(2, "0");
            return;
        }

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
        
        // Só iniciar timer se tivermos slides válidos
        if (total > 1) {
            timer = setInterval(() => {
                update(1);
            }, 5000);
            console.log('⏰ Timer iniciado (5s)');
        }
    }

    function setupButtonInteractions() {
        infoButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔘 Botão info clicado');
                
                const moreInfo = this.parentElement.querySelector('.more-info');
                if (!moreInfo) return;

                const isShowing = moreInfo.classList.toggle('show');
                const btnText = this.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = isShowing ? 'Mostrar menos' : 'Saiba mais';
                }
                
                if (!checkGSAP()) {
                    // Fallback sem GSAP
                    moreInfo.style.display = isShowing ? 'block' : 'none';
                    return;
                }
                
                if (isShowing) {
                    gsap.to(moreInfo, {
                        maxHeight: 500,
                        duration: 0.8,
                        ease: "power2.inOut"
                    });
                    
                    const description = moreInfo.querySelector('.description');
                    const priceContainer = moreInfo.querySelector('.price-container');
                    
                    gsap.to([description, priceContainer], {
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
                            const description = moreInfo.querySelector('.description');
                            const priceContainer = moreInfo.querySelector('.price-container');
                            gsap.set([description, priceContainer], { y: 30, opacity: 0 });
                        }
                    });
                }
            });
        });
    }

    function setupArrowInteractions() {
        if (prevButton) {
            prevButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('⬅️ Botão anterior clicado');
                update(-1);
                startTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('➡️ Botão próximo clicado');
                update(1);
                startTimer();
            });
        }
    }

    function setupDotInteractions() {
        dots.forEach((dot, index) => {
            dot.addEventListener("click", (e) => {
                e.preventDefault();
                console.log(`🔘 Dot ${index + 1} clicado`);
                
                if (index !== active) {
                    update(index - active);
                    startTimer();
                }
            });
        });
    }

    function setupHeaderEffects() {
        if (!header) return;

        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (!checkGSAP()) {
                // Fallback sem GSAP
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.style.transform = 'translateY(-100px)';
                    header.style.opacity = '0.8';
                } else {
                    header.style.transform = 'translateY(0)';
                    header.style.opacity = '1';
                }
            } else {
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
            }
            
            lastScrollY = currentScrollY;
        });
    }

    function setupKeyboardNavigation() {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') {
                console.log('⌨️ Seta esquerda pressionada');
                update(-1);
                startTimer();
            } else if (e.key === 'ArrowRight') {
                console.log('⌨️ Seta direita pressionada');
                update(1);
                startTimer();
            }
        });
    }

    function setupCart() {
        const cartButton = document.getElementById('cartButton');
        const cartCount = document.getElementById('cartCount');
        
        if (cartButton && cartCount) {
            cartButton.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Carrinho de compras disponível na página de produtos!\n\nClique em "Produtos" para ver nosso catálogo completo.');
                
                setTimeout(() => {
                    navigateToProducts();
                }, 1000);
            });
            
            cartCount.textContent = '0';
        }
    }

    function debugInfo() {
        console.log('🔍 Debug do Slider:');
        console.log('- Total de items:', total);
        console.log('- Items encontrados:', items.length);
        console.log('- Dots encontrados:', dots.length);
        console.log('- Botões info encontrados:', infoButtons.length);
        console.log('- Item ativo atual:', active);
        console.log('- É página index?', isIndexPage());
        console.log('- GSAP disponível?', typeof gsap !== 'undefined');
        
        // Verificar se elementos necessários existem
        if (items.length === 0) console.warn('⚠️ Nenhum item .item encontrado!');
        if (dots.length === 0) console.warn('⚠️ Nenhum dot .dot encontrado!');
        if (!prevButton) console.warn('⚠️ Botão #prev não encontrado!');
        if (!nextButton) console.warn('⚠️ Botão #next não encontrado!');
        if (!numbersIndicator) console.warn('⚠️ Indicador .numbers não encontrado!');
    }

    function initializeSlider() {
        // Garantir que o primeiro item está ativo
        if (items.length > 0) {
            items.forEach(item => item.classList.remove('active'));
            items[0].classList.add('active');
        }
        
        if (dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[0].classList.add('active');
        }
        
        // Animar primeiro slide
        if (items[0]) {
            animateSlideElements(items[0]);
        }
        
        // Atualizar contador
        updateNumberWithEffect(1);
    }

    function init() {
        console.log('🚀 Inicializando Tecnoiso Enhanced...');
        
        // Debug inicial
        debugInfo();
        
        // Verificar GSAP
        checkGSAP();
        
        // Inicializar slider se estivermos na página index
        if (isIndexPage() && total > 0) {
            initializeSlider();
        }
        
        // Animações iniciais do header
        if (checkGSAP()) {
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
        }

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
        }
        
        console.log('✅ Tecnoiso Enhanced inicializado com sucesso!');
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
        
        const matrixStyle = document.createElement('style');
        matrixStyle.textContent = `
            @keyframes matrix-fall {
                0% { top: -20px; opacity: 1; }
                100% { top: 100vh; opacity: 0; }
            }
        `;
        document.head.appendChild(matrixStyle);
        document.body.appendChild(matrixContainer);
        
        setTimeout(() => {
            matrixContainer.remove();
            matrixStyle.remove();
        }, 3000);
    }
});