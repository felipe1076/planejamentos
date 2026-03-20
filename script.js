// 1. Manage Weeks
const weeksContainer = document.getElementById('weeks-container');
const addWeekBtn = document.getElementById('add-week-btn');
const weekTemplate = document.getElementById('week-template');

function createWeek(data = null) {
    const clone = weekTemplate.content.cloneNode(true);
    const block = clone.querySelector('.week-block');
    // Select fields
    const labelField = block.querySelector('.field-semana-label');
    const eixo = block.querySelector('.field-eixo');
    const objetos = block.querySelector('.field-objetos');
    const objetivos = block.querySelector('.field-objetivos');
    const metodologia = block.querySelector('.field-metodologia');
    const recursos = block.querySelector('.field-recursos');
    const adaptacoes = block.querySelector('.field-adaptacoes');
    const avaliacao = block.querySelector('.field-avaliacao');
    const recuperacao = block.querySelector('.field-recuperacao');

    // Fill data if provided, otherwise default
    if (data) {
        labelField.value = data.label || "";
        eixo.value = data.eixo || "";
        objetos.value = data.objetos || "";
        objetivos.value = data.objetivos || "";
        metodologia.value = data.metodologia || "";
        recursos.value = data.recursos || "";
        adaptacoes.value = data.adaptacoes || "";
        avaliacao.value = data.avaliacao || "";
        recuperacao.value = data.recuperacao || "";
    }

    // Initialize Flatpickr for Range
    flatpickr(labelField, { 
        mode: "range", 
        dateFormat: "d/m", 
        locale: "pt", 
        onChange: (selectedDates, dateStr) => {
            if (selectedDates.length === 2) {
                const start = selectedDates[0];
                const end = selectedDates[1];
                const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                
                // Format nicely: "10 a 12 de fevereiro"
                if (start.getMonth() === end.getMonth()) {
                    const month = startStr.split(' de ')[1];
                    labelField.value = `${start.getDate()} a ${end.getDate()} de ${month}`;
                } else {
                    labelField.value = `${startStr} a ${endStr}`;
                }
            } else {
                labelField.value = dateStr;
            }
            saveData(); 
        } 
    });

    // Add save listener to all fields
    block.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', saveData);
    });

    clone.querySelector('.remove-week-btn').onclick = () => {
        block.remove();
        updateWeekNumbers();
        saveData();
    };
    
    weeksContainer.prepend(clone);
    updateWeekNumbers();
}

function updateWeekNumbers() {
    const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();
    blocks.forEach((block, idx) => {
        const num = idx + 1;
        block.querySelector('.week-num').textContent = num;
        
        // Apply different colors cycling through 1-5
        block.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5');
        const colorIdx = ((num - 1) % 5) + 1;
        block.classList.add(`color-${colorIdx}`);
    });
}

addWeekBtn.onclick = () => {
    createWeek();
    saveData();
};

// 2. Data Persistence (LocalStorage)
const STORAGE_KEY = 'semed_planos_data_v2'; // versioned key for new model

function saveData() {
    const data = {
        header: {
            componente: document.getElementById('componente').value,
            duracao: document.getElementById('duracao').value,
            turma: document.getElementById('turma').value,
            turno: document.getElementById('turno').value,
            escola: document.getElementById('escola').value,
            professor: document.getElementById('professor').value,
            periodoGeral: document.getElementById('periodo-geral').value,
            logoSemed: logoSemedB64,
            logoEscola: logoEscolaB64
        },
        weeks: []
    };

    weeksContainer.querySelectorAll('.week-block').forEach(block => {
        data.weeks.push({
            label: block.querySelector('.field-semana-label').value,
            eixo: block.querySelector('.field-eixo').value,
            objetos: block.querySelector('.field-objetos').value,
            objetivos: block.querySelector('.field-objetivos').value,
            metodologia: block.querySelector('.field-metodologia').value,
            recursos: block.querySelector('.field-recursos').value,
            adaptacoes: block.querySelector('.field-adaptacoes').value,
            avaliacao: block.querySelector('.field-avaliacao').value,
            recuperacao: block.querySelector('.field-recuperacao').value
        });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        createWeek(); // Default first week
        return;
    }

    try {
        const data = JSON.parse(saved);
        
        // Populate Header
        if (data.header) {
            document.getElementById('componente').value = data.header.componente || "";
            document.getElementById('duracao').value = data.header.duracao || "";
            document.getElementById('turma').value = data.header.turma || "";
            document.getElementById('turno').value = data.header.turno || "";
            document.getElementById('escola').value = data.header.escola || "";
            document.getElementById('professor').value = data.header.professor || "";
            document.getElementById('periodo-geral').value = data.header.periodoGeral || "";
            
            if (data.header.logoSemed) {
                logoSemedB64 = data.header.logoSemed;
                document.getElementById('logo-semed').src = logoSemedB64;
            }
            if (data.header.logoEscola) {
                logoEscolaB64 = data.header.logoEscola;
                document.getElementById('logo-escola').src = logoEscolaB64;
            }
        }

        // Populate Weeks
        weeksContainer.innerHTML = "";
        if (data.weeks && data.weeks.length > 0) {
            // Reverse when loading because createWeek uses prepend()
            [...data.weeks].reverse().forEach(w => createWeek(w));
        } else {
            createWeek();
        }
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
        createWeek();
    }
}

// Attach auto-save to header inputs
document.querySelectorAll('.main-header input').forEach(el => {
    el.addEventListener('input', saveData);
});

// 3. Theme Management
const themeBtn = document.getElementById('theme-btn');
const themeDropdown = document.getElementById('theme-dropdown');

themeBtn.onclick = (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('show');
};

document.querySelectorAll('.theme-dropdown button').forEach(btn => {
    btn.onclick = () => {
        const theme = btn.getAttribute('data-theme');
        setTheme(theme);
        themeDropdown.classList.remove('show');
    };
});

function setTheme(theme) {
    document.body.className = theme === 'light' ? '' : `theme-${theme}`;
    localStorage.setItem('semed_app_theme', theme);
}

// Close dropdown on click outside
window.onclick = () => themeDropdown.classList.remove('show');

// 3.1. Export / Import Backup (Footer)
const exportBtn = document.getElementById('exportar-btn');
const importBtn = document.getElementById('importar-btn');
const importInput = document.getElementById('importar-input');

exportBtn.onclick = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return alert("Não há dados para exportar.");
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_planejamento_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

importBtn.onclick = () => importInput.click();

importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            loadData();
            alert("Dados importados com sucesso!");
        } catch (err) {
            alert("Erro ao importar arquivo. Verifique se é um JSON válido.");
        }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
};

// 4. Logo Handling (Inlined to avoid fetch issues)
const SEMED_LOGO_DEFAULT = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="white"/><g transform="translate(40,40)"><circle cx="20" cy="20" r="18" fill="#5cba47" opacity="0.8"/><circle cx="15" cy="45" r="12" fill="#29abe2" opacity="0.8"/><path d="M45,30 Q60,10 75,30 T105,30" fill="none" stroke="#5cba47" stroke-width="8" stroke-linecap="round"/><text x="75" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="#1e3a66">ALTOS</text><text x="75" y="90" font-family="Arial, sans-serif" font-size="10" fill="#1e3a66" opacity="0.7">PREFEITURA MUNICIPAL DE</text></g></svg>`;
const ESCOLA_LOGO_DEFAULT = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="white"/><g transform="translate(10,10)"><path d="M20,60 Q40,40 60,60 Q40,80 20,60 M60,60 Q80,40 100,60 Q80,80 60,60" fill="#fbb03b"/><path d="M25,55 Q40,30 55,55 L55,65 Q40,90 25,65 Z" fill="#29abe2"/><path d="M65,55 Q80,30 95,55 L95,65 Q80,90 65,65 Z" fill="#0071bc" opacity="0.8"/><text x="50" y="110" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#1e3a66">ZECA DA MARINHA</text><text x="50" y="125" font-family="Arial, sans-serif" font-size="8" fill="#1e3a66" opacity="0.7">CENTRO MUNICIPAL DE FORMAÇÃO CONTINUADA</text></g></svg>`;

let logoSemedB64 = "";
let logoEscolaB64 = "";

async function svgToBase64(svgString) {
    return new Promise((resolve) => {
        try {
            const svg64 = btoa(unescape(encodeURIComponent(svgString)));
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + svg64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Use a high resolution while keeping the original SVG aspect ratio
                const scale = 2; 
                canvas.width = img.width * scale; 
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve("");
        } catch (e) {
            resolve("");
        }
    });
}

function setupUploader(inputId, imgId, side) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const b64 = event.target.result;
                document.getElementById(imgId).src = b64;
                if (side === 'semed') logoSemedB64 = b64;
                else logoEscolaB64 = b64;
                saveData(); 
            };
            reader.readAsDataURL(file);
        }
    };
}
setupUploader('upload-logo-semed', 'logo-semed', 'semed');
setupUploader('upload-logo-escola', 'logo-escola', 'escola');

// 5. PDF Generation (Official Matching Image)
const gerarPdfBtn = document.getElementById('gerar-pdf-btn');

gerarPdfBtn.onclick = async () => {
    gerarPdfBtn.disabled = true;
    gerarPdfBtn.innerHTML = 'Gerando...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        // Data Extraction
        const prof = document.getElementById('professor').value || '';
        const turma = document.getElementById('turma').value || '';
        const turno = document.getElementById('turno').value || '';
        const duracao = document.getElementById('duracao').value || '';
        const escola = document.getElementById('escola').value || '';
        const componente = document.getElementById('componente').value || '';
        const periodoTxt = document.getElementById('periodo-geral').value || '';

        // 4. LOOP THROUGH WEEKS (ONE PER PAGE)
        const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();
        const semedImgEl = document.getElementById('logo-semed');
        const escolaImgEl = document.getElementById('logo-escola');
        
        for (let i = 0; i < blocks.length; i++) {
            if (i > 0) doc.addPage();
            const block = blocks[i];
            const weekLabel = block.querySelector('.field-semana-label').value || '';

            // --- DRAW HEADER ON EVERY PAGE ---
            if (logoSemedB64 && semedImgEl.naturalWidth) {
                const ratio = semedImgEl.naturalHeight / semedImgEl.naturalWidth;
                const h = 55 * ratio;
                doc.addImage(logoSemedB64, 'PNG', 10, 8, 55, h);
            }
            if (logoEscolaB64 && escolaImgEl.naturalWidth) {
                const ratio = escolaImgEl.naturalHeight / escolaImgEl.naturalWidth;
                const h = 55 * ratio;
                doc.addImage(logoEscolaB64, 'PNG', 232, 8, 55, h);
            }
            
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text('PREFEITURA MUNICIPAL DE ALTOS', 148, 12, { align: 'center' });
            doc.setFontSize(10);
            doc.text('SECRETARIA MUNICIPAL DE EDUCAÇÃO – SEMED', 148, 17, { align: 'center' });
            doc.text('COMPONENTE CURRICULAR: ' + componente.toUpperCase(), 148, 22, { align: 'center' });

            doc.setFontSize(9);
            doc.text(`DURAÇÃO: ${duracao.toUpperCase()}`, 100, 30);
            doc.text(`TURMA: ${turma.toUpperCase()}`, 145, 30);
            doc.text(`TURNO: ${turno.toUpperCase()}`, 180, 30);
            doc.text(`ESCOLA: ${escola.toUpperCase()}`, 15, 36);
            doc.text(`PROFESSOR (A): ${prof.toUpperCase()}`, 15, 42);

            // PLANO DE AULA BANNER (Use Week Specific Label)
            doc.setFillColor(243, 232, 255); 
            doc.setDrawColor(216, 180, 254);
            doc.rect(15, 48, 267, 10, 'FD');
            doc.setTextColor(88, 28, 135);
            doc.setFontSize(10);
            doc.text(`- PLANO DE AULA -      ${weekLabel.toUpperCase()}`, 148, 54.5, { align: 'center' });
            doc.setTextColor(0);

            // TABLE FOR THIS WEEK
            const row = [
                weekLabel,
                block.querySelector('.field-eixo').value,
                block.querySelector('.field-objetos').value,
                block.querySelector('.field-objetivos').value,
                block.querySelector('.field-metodologia').value,
                block.querySelector('.field-recursos').value,
                block.querySelector('.field-adaptacoes').value,
                block.querySelector('.field-avaliacao').value,
                block.querySelector('.field-recuperacao').value
            ];

            doc.autoTable({
                startY: 58,
                head: [['Data', 'Eixo/\nTemática', 'Objeto do\nConhecimento', 'Objetivos', 'Estratégias\nMetodológicas', 'Recursos', 'Adaptações\nCurriculares', 'Avaliação', 'Recuperação']],
                body: [row],
                theme: 'grid',
                headStyles: { 
                    fillColor: [240, 240, 240], 
                    textColor: 0, 
                    fontStyle: 'bold', 
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: 0,
                    fontSize: 8
                },
                styles: { 
                    fontSize: 7.5, 
                    cellPadding: 2, 
                    overflow: 'linebreak',
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: 0
                },
                columnStyles: { 
                    0: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
                    1: { cellWidth: 32 },
                    2: { cellWidth: 32 },
                    3: { cellWidth: 32 },
                    4: { cellWidth: 40 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 25 },
                    7: { cellWidth: 32 },
                    8: { cellWidth: 32 }
                },
                margin: { horizontal: 15 }
            });
        }

        doc.save(`Plano_de_Aula_${prof.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
        console.error(e);
        alert('Erro ao gerar PDF. Verifique os dados.');
    } finally {
        gerarPdfBtn.disabled = false;
        gerarPdfBtn.innerHTML = '<span class="btn-icon">📄</span> GERAR PDF OFICIAL';
    }
};

// 6. Word Generation
const gerarWordBtn = document.getElementById('gerar-word-btn');
gerarWordBtn.onclick = () => {
    const prof = document.getElementById('professor').value || '/';
    const escola = document.getElementById('escola').value || '/';
    const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();

    let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><style>
            table { border-collapse: collapse; width: 100%; border: 1px solid black; } 
            th, td { border: 1px solid black; padding: 5px; font-family: Arial; font-size: 9pt; vertical-align: middle; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .page-break { page-break-before: always; }
            .banner { text-align:center; border: 1px solid black; padding: 5px; background-color: #f3e8ff; font-weight: bold; margin: 10px 0; }
        </style></head>
        <body style="mso-page-orientation: landscape;">
    `;

    blocks.forEach((block, idx) => {
        const weekLabel = block.querySelector('.field-semana-label').value || '';
        const row = [
            weekLabel,
            block.querySelector('.field-eixo').value,
            block.querySelector('.field-objetos').value,
            block.querySelector('.field-objetivos').value,
            block.querySelector('.field-metodologia').value,
            block.querySelector('.field-recursos').value,
            block.querySelector('.field-adaptacoes').value,
            block.querySelector('.field-avaliacao').value,
            block.querySelector('.field-recuperacao').value
        ];

        if (idx > 0) html += `<div class="page-break"></div>`;

        html += `
            <h2 style="text-align:center">PREFEITURA MUNICIPAL DE ALTOS</h2>
            <h3 style="text-align:center">SECRETARIA MUNICIPAL DE EDUCAÇÃO – SEMED</h3>
            <p><b>ESCOLA:</b> ${escola} | <b>PROFESSOR:</b> ${prof}</p>
            <div class="banner">- PLANO DE AULA - ${weekLabel.toUpperCase()}</div>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Eixo/Temática</th>
                        <th>Objeto do Conhecimento</th>
                        <th>Objetivos</th>
                        <th>Estratégias Metodológicas</th>
                        <th>Recursos</th>
                        <th>Adaptações Curriculares</th>
                        <th>Avaliação</th>
                        <th>Recuperação</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        ${row.map(c => `<td>${c.replace(/\n/g, '<br>')}</td>`).join('')}
                    </tr>
                </tbody>
            </table>
        `;
    });

    html += `</body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Plano_de_Aula_${prof.replace(/\s+/g, '_')}.doc`;
    link.click();
};

// 7. Floating Buttons
document.getElementById('float-pdf-btn').onclick = () => document.getElementById('gerar-pdf-btn').click();
document.getElementById('float-word-btn').onclick = () => document.getElementById('gerar-word-btn').click();

// Start
(async () => {
    loadData();
    if (!logoSemedB64) {
        logoSemedB64 = await svgToBase64(SEMED_LOGO_DEFAULT);
        if (!document.getElementById('logo-semed').src || document.getElementById('logo-semed').src.includes('semed_altos_logo.svg')) {
            document.getElementById('logo-semed').src = logoSemedB64;
        }
    }
    if (!logoEscolaB64) {
        logoEscolaB64 = await svgToBase64(ESCOLA_LOGO_DEFAULT);
        if (!document.getElementById('logo-escola').src || document.getElementById('logo-escola').src.includes('zeca_marinha_logo.svg')) {
            document.getElementById('logo-escola').src = logoEscolaB64;
        }
    }
    // Load Saved Theme
    const savedTheme = localStorage.getItem('semed_app_theme') || 'light';
    setTheme(savedTheme);
})();
