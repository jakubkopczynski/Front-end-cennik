const VAT_MULTIPLIER = 1.23;
const MIN_STUDENTS = 1;
const MAX_STUDENTS = 1000;

const formatCurrency = (value) => `${value.toFixed(2).replace('.', ',')} zł`;

const clampStudents = (value) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return MIN_STUDENTS;
    return Math.min(MAX_STUDENTS, Math.max(MIN_STUDENTS, num));
};

const updateSliderUI = (rangeEl, bubbleEl) => {
    const min = parseInt(rangeEl.min, 10);
    const max = parseInt(rangeEl.max, 10);
    const val = parseInt(rangeEl.value, 10);
    const percent = ((val - min) / (max - min)) * 100;

    rangeEl.style.setProperty('--slider-progress', `${percent}%`);
    bubbleEl.style.setProperty('--bubble-left', `${percent}%`);
    bubbleEl.textContent = val;
};

const initCalculator = () => {
    const rangeEl = document.getElementById('students-range');
    const inputEl = document.getElementById('students-input');
    const bubbleEl = document.getElementById('students-bubble');
    const modulesGrid = document.getElementById('modules-grid');
    const orderBtn = document.getElementById('order-btn');
    const summaryStudents = document.getElementById('summary-students');
    const summaryPerStudent = document.getElementById('summary-per-student');
    const summaryNet = document.getElementById('summary-net');
    const summaryGross = document.getElementById('summary-gross');

    if (!rangeEl || !inputEl || !modulesGrid) return;

    const moduleToggles = modulesGrid.querySelectorAll('.module-toggle');

    const getStudents = () => clampStudents(inputEl.value);

    const getSelectedModules = () => {
        const selected = [];
        moduleToggles.forEach((toggle) => {
            const checkbox = toggle.querySelector('.module-toggle__input');
            const isActive = toggle.classList.contains('is-active') || checkbox?.checked;
            if (isActive) {
                selected.push({
                    name: toggle.querySelector('.module-toggle__label')?.textContent?.trim(),
                    price: parseFloat(toggle.dataset.price) || 0,
                });
            }
        });
        return selected;
    };

    const calculate = () => {
        const students = getStudents();
        const modules = getSelectedModules();
        const pricePerStudent = modules.reduce((sum, m) => sum + m.price, 0);
        const net = pricePerStudent * students;
        const gross = net * VAT_MULTIPLIER;
        return { students, modules, pricePerStudent, net, gross };
    };

    const renderSummary = () => {
        const { students, pricePerStudent, net, gross } = calculate();
        summaryStudents.textContent = students;
        summaryPerStudent.textContent = formatCurrency(pricePerStudent);
        summaryNet.textContent = formatCurrency(net);
        summaryGross.textContent = formatCurrency(gross);
    };

    const syncStudents = (value) => {
        const clamped = clampStudents(value);
        rangeEl.value = clamped;
        inputEl.value = clamped;
        updateSliderUI(rangeEl, bubbleEl);
        renderSummary();
    };

    rangeEl.addEventListener('input', () => syncStudents(rangeEl.value));
    inputEl.addEventListener('input', () => syncStudents(inputEl.value));
    inputEl.addEventListener('blur', () => syncStudents(inputEl.value));

    moduleToggles.forEach((toggle) => {
        const checkbox = toggle.querySelector('.module-toggle__input');
        if (!checkbox || toggle.classList.contains('module-toggle--locked')) return;

        checkbox.addEventListener('change', () => {
            toggle.classList.toggle('is-active', checkbox.checked);
            renderSummary();
        });
    });

    orderBtn?.addEventListener('click', () => {
        const data = calculate();
        const moduleList = data.modules
            .map((m) => `${m.name} (${m.price.toFixed(2)} zł/słuchacz)`)
            .join('\n');

        alert(
            [
                'Podsumowanie zamówienia:',
                '',
                `Liczba słuchaczy: ${data.students}`,
                '',
                'Wybrane moduły:',
                moduleList,
                '',
                `Miesięczna cena za słuchacza: ${formatCurrency(data.pricePerStudent)}`,
                `Miesięczny koszt netto: ${formatCurrency(data.net)}`,
                `Miesięczny koszt brutto: ${formatCurrency(data.gross)}`,
            ].join('\n')
        );
    });

    syncStudents(200);
};

const initFeaturesScrollSpy = () => {
    const nav = document.getElementById('features-nav');
    const cards = document.querySelectorAll('.feature-card');
    const navLinks = nav?.querySelectorAll('.features-nav__link');

    if (!nav || !cards.length || !navLinks?.length) return;

    const setActive = (featureId) => {
        navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.feature === featureId);
        });
        cards.forEach((card) => {
            card.classList.toggle('is-active', card.dataset.feature === featureId);
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.slice(1);
            const target = targetId ? document.getElementById(targetId) : null;
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActive(link.dataset.feature);
            }
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const featureId = entry.target.dataset.feature;
                    if (featureId) setActive(featureId);
                }
            });
        },
        { root: null, rootMargin: '-35% 0px -45% 0px', threshold: 0 }
    );

    cards.forEach((card) => observer.observe(card));
    setActive('sekretariat');
};

const pricingPage = () => {
    initCalculator();
    initFeaturesScrollSpy();
};

export { pricingPage };
