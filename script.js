// 1. Manage Weeks
const weeksContainer = document.getElementById('weeks-container');
const addWeekBtn = document.getElementById('add-week-btn');
const weekTemplate = document.getElementById('week-template');

function createWeek(data = null) {
    const clone = weekTemplate.content.cloneNode(true);
    const block = clone.querySelector('.week-block');
    const index = weeksContainer.querySelectorAll('.week-block').length + 1;
    block.querySelector('.week-num').textContent = index;
    
    // Select fields
    const labelField = block.querySelector('.field-semana-label');
    const startInput = block.querySelector('.field-date-start');
    const endInput = block.querySelector('.field-date-end');
    const habilidades = block.querySelector('.field-habilidades');
    const objetivos = block.querySelector('.field-objetivos');
    const objetos = block.querySelector('.field-objetos');
    const metodologia = block.querySelector('.field-metodologia');
    const avaliacao = block.querySelector('.field-avaliacao');

    // Fill data if provided, otherwise default
    if (data) {
        labelField.value = data.label || "";
        startInput.value = data.start || "";
        endInput.value = data.end || "";
        habilidades.value = data.habilidades || "";
        objetivos.value = data.objetivos || "";
        objetos.value = data.objetos || "";
        metodologia.value = data.metodologia || "";
        avaliacao.value = data.avaliacao || "";
    } else {
        labelField.value = `${index}ª SEMANA`;
    }

    // Initialize Flatpickr
    [startInput, endInput].forEach(inp => {
        if (inp) flatpickr(inp, { dateFormat: "d/m", locale: "pt", onChange: saveData });
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
    
    weeksContainer.appendChild(clone);
}

function updateWeekNumbers() {
    const blocks = weeksContainer.querySelectorAll('.week-block');
    blocks.forEach((block, idx) => {
        block.querySelector('.week-num').textContent = idx + 1;
    });
}

addWeekBtn.onclick = () => {
    createWeek();
    saveData();
};

// 2. Data Persistence (LocalStorage)
const STORAGE_KEY = 'semed_planos_data';

function saveData() {
    const data = {
        header: {
            componente: document.getElementById('componente').value,
            titulo: document.getElementById('planejamento-titulo').value,
            periodo: document.getElementById('periodo').value,
            eixo: document.getElementById('eixo').value,
            coordenador: document.getElementById('coordenador').value,
            professor: document.getElementById('professor').value,
            turmas: document.getElementById('turmas').value,
            logoSemed: logoSemedB64,
            logoEscola: logoEscolaB64
        },
        weeks: []
    };

    weeksContainer.querySelectorAll('.week-block').forEach(block => {
        data.weeks.push({
            label: block.querySelector('.field-semana-label').value,
            start: block.querySelector('.field-date-start').value,
            end: block.querySelector('.field-date-end').value,
            habilidades: block.querySelector('.field-habilidades').value,
            objetivos: block.querySelector('.field-objetivos').value,
            objetos: block.querySelector('.field-objetos').value,
            metodologia: block.querySelector('.field-metodologia').value,
            avaliacao: block.querySelector('.field-avaliacao').value
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
            document.getElementById('planejamento-titulo').value = data.header.titulo || "";
            document.getElementById('periodo').value = data.header.periodo || "";
            document.getElementById('eixo').value = data.header.eixo || "";
            document.getElementById('coordenador').value = data.header.coordenador || "";
            document.getElementById('professor').value = data.header.professor || "";
            document.getElementById('turmas').value = data.header.turmas || "";
            
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
            data.weeks.forEach(w => createWeek(w));
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

// 3. Export / Import Backup
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
                canvas.width = 600; canvas.height = 300;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 600, 300);
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
                // Save logos to localStorage too? The user might want persistence for logos.
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
        const prof = document.getElementById('professor').value || '/';
        const turmas = document.getElementById('turmas').value || '/';
        const componente = document.getElementById('componente').value || '/';
        const coord = document.getElementById('coordenador').value || '/';
        const periodoTxt = document.getElementById('periodo').value || '/';
        const eixo = document.getElementById('eixo').value || '/';
        const planejamentoTxt = document.getElementById('planejamento-titulo').value || '/';

        // 1. TOP SECTION: Logos and Text
        if (logoSemedB64) doc.addImage(logoSemedB64, 'PNG', 15, 8, 30, 15);
        if (logoEscolaB64) doc.addImage(logoEscolaB64, 'PNG', 252, 8, 30, 15);
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('SECRETARIA MUNICIPAL DE EDUCAÇÃO- SEMED', 148, 12, { align: 'center' });
        doc.text('COORDENAÇÃO DE ENSINO 6º AO 9º ANO', 148, 17, { align: 'center' });
        doc.text('COMPONENTE CURRICULAR: ' + componente, 148, 22, { align: 'center' });
        doc.text('PROJETOS INTEGRADORES', 148, 27, { align: 'center' });

        // 2. GREEN BANNERS
        doc.setDrawColor(187, 247, 208); // border
        doc.setFillColor(212, 237, 218); // green banner
        
        // Banner 1: Planejamento
        doc.rect(15, 33, 267, 10, 'F');
        doc.rect(15, 33, 267, 10, 'S');
        doc.setFontSize(9);
        doc.text(planejamentoTxt + ' ' + periodoTxt, 148, 39, { align: 'center' });

        // Banner 2: Eixo
        doc.rect(15, 45, 267, 8, 'F');
        doc.rect(15, 45, 267, 8, 'S');
        doc.text('EIXO INTEGRADOR - ' + eixo, 148, 50, { align: 'center' });

        // 3. BLUE IDENTIFICATION BAND
        doc.setDrawColor(191, 219, 254);
        doc.setFillColor(204, 229, 255);
        doc.rect(15, 55, 267, 10, 'F');
        doc.rect(15, 55, 267, 10, 'S');
        
        doc.setFontSize(9);
        doc.text(`FORMADOR(A): ${coord}`, 18, 61);
        doc.text(`PROFESSOR(A): ${prof}`, 130, 61);
        doc.text(`TURMA: ${turmas}`, 235, 61);

        // 4. MAIN TABLE
        const tableRows = [];
        weeksContainer.querySelectorAll('.week-block').forEach(block => {
            const label = block.querySelector('.field-semana-label').value;
            const start = block.querySelector('.field-date-start').value;
            const end = block.querySelector('.field-date-end').value;
            const fullDateStr = label + '\n' + (start && end ? `${start} a ${end}` : (start || end ? start || end : ''));
            tableRows.push([
                fullDateStr,
                block.querySelector('.field-habilidades').value,
                block.querySelector('.field-objetivos').value,
                block.querySelector('.field-objetos').value,
                block.querySelector('.field-metodologia').value,
                block.querySelector('.field-avaliacao').value
            ]);
        });

        doc.autoTable({
            startY: 68,
            head: [['DATAS', 'HABILIDADES', 'OBJETIVOS', 'OBJETO DO CONHECIMENTO', 'METODOLOGIA', 'AVALIAÇÃO']],
            body: tableRows,
            theme: 'grid',
            headStyles: { 
                fillColor: [180, 200, 240], 
                textColor: 0, 
                fontStyle: 'bold', 
                halign: 'center',
                lineWidth: 0.1,
                lineColor: 0
            },
            styles: { 
                fontSize: 8, 
                cellPadding: 2, 
                overflow: 'linebreak',
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: 0
            },
            columnStyles: { 
                0: { cellWidth: 25, fontStyle: 'bold', halign: 'center' },
                1: { cellWidth: 45 },
                2: { cellWidth: 45 },
                3: { cellWidth: 50 },
                4: { cellWidth: 55 },
                5: { cellWidth: 47 }
            },
            margin: { horizontal: 15 }
        });

        doc.save(`Planejamento_SEMED_${prof.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
        console.error(e);
        alert('Erro ao gerar PDF oficial. Verifique se você está conectado à internet para carregar as bibliotecas.');
    } finally {
        gerarPdfBtn.disabled = false;
        gerarPdfBtn.innerHTML = '<span class="btn-icon">📄</span> GERAR PDF OFICIAL';
    }
};

// 6. Word Generation (Simplified Table-based)
const gerarWordBtn = document.getElementById('gerar-word-btn');
gerarWordBtn.onclick = () => {
    const prof = document.getElementById('professor').value || '/';
    const turmas = document.getElementById('turmas').value || '/';
    const data = [];
    weeksContainer.querySelectorAll('.week-block').forEach(block => {
        data.push([
            block.querySelector('.field-semana-label').value + ' ' + block.querySelector('.field-date-start').value + ' a ' + block.querySelector('.field-date-end').value,
            block.querySelector('.field-habilidades').value,
            block.querySelector('.field-objetivos').value,
            block.querySelector('.field-objetos').value,
            block.querySelector('.field-metodologia').value,
            block.querySelector('.field-avaliacao').value
        ]);
    });

    let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><style>
            table { border-collapse: collapse; width: 100%; border: 1px solid black; } 
            th, td { border: 1px solid black; padding: 5px; font-family: Arial; font-size: 10pt; vertical-align: middle; }
            th { background-color: #f0f0f0; }
        </style></head>
        <body style="mso-page-orientation: landscape;">
        <h2 style="text-align:center">SECRETARIA MUNICIPAL DE EDUCAÇÃO - SEMED</h2>
        <h4 style="text-align:center">${document.getElementById('planejamento-titulo').value}</h4>
        <p><b>FORMADOR:</b> ${document.getElementById('coordenador').value} | <b>PROFESSOR:</b> ${prof} | <b>TURMAS:</b> ${turmas}</p>
        <table>
            <thead><tr><th>DATAS</th><th>HABILIDADES</th><th>OBJETIVOS</th><th>OBJETO</th><th>METODOLOGIA</th><th>AVALIAÇÃO</th></tr></thead>
            <tbody>${data.map(r => `<tr>${r.map(c => `<td>${c.replace(/\n/g, '<br>')}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        </body></html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planejamento_${prof}.doc`;
    link.click();
};

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
})();
