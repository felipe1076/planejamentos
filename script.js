// 1. Manage Weeks
const weeksContainer = document.getElementById('weeks-container');
const addWeekBtn = document.getElementById('add-week-btn');
const weekTemplate = document.getElementById('week-template');

function createWeek(data = null) {
    const clone = weekTemplate.content.cloneNode(true);
    const block = clone.querySelector('.week-block');
    
    // Select fields
    const fields = {
        eixoSocioemocional: block.querySelector('.field-eixo-socioemocional'),
        semanaLabel: block.querySelector('.field-semana-label'),
        datas: block.querySelector('.field-datas'),
        unidades: block.querySelector('.field-unidades'),
        habilidades: block.querySelector('.field-habilidades'),
        objetivos: block.querySelector('.field-objetivos'),
        objetos: block.querySelector('.field-objetos'),
        metodologia: block.querySelector('.field-metodologia'),
        recursos: block.querySelector('.field-recursos'),
        adaptacoes: block.querySelector('.field-adaptacoes'),
        avaliacao: block.querySelector('.field-avaliacao'),
        recuperacao: block.querySelector('.field-recuperacao'),
        referencias: block.querySelector('.field-referencias')
    };

    // Fill data if provided
    if (data) {
        Object.keys(fields).forEach(key => {
            if (data[key] !== undefined) fields[key].value = data[key];
        });
    }

    // Initialize Flatpickr for Range on the semanaLabel
    flatpickr(fields.semanaLabel, { 
        mode: "range", 
        dateFormat: "d/m", 
        locale: "pt", 
        onChange: (selectedDates, dateStr) => {
            if (selectedDates.length === 2) {
                const start = selectedDates[0];
                const end = selectedDates[1];
                const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                
                if (start.getMonth() === end.getMonth()) {
                    const month = startStr.split(' de ')[1];
                    fields.semanaLabel.value = `${start.getDate()} a ${end.getDate()} de ${month}`;
                } else {
                    fields.semanaLabel.value = `${startStr} a ${endStr}`;
                }
            } else {
                fields.semanaLabel.value = dateStr;
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

addWeekBtn.onclick = () => {
    createWeek();
    saveData();
};

function updateWeekNumbers() {
    const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();
    blocks.forEach((block, idx) => {
        const num = idx + 1;
        block.querySelector('.week-num').textContent = num;
        block.querySelector('.week-num-display').textContent = num;
        
        block.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5');
        const colorIdx = ((num - 1) % 5) + 1;
        block.classList.add(`color-${colorIdx}`);
    });
}

const STORAGE_KEY = 'semed_planos_data_v3'; // Increment version for new schema

function saveData() {
    const data = {
        header: {
            componente: document.getElementById('componente').value,
            ano: document.getElementById('ano').value,
            professor: document.getElementById('professor').value,
            logoSemed: logoSemedB64,
            logoEscola: logoEscolaB64
        },
        weeks: []
    };

    weeksContainer.querySelectorAll('.week-block').forEach(block => {
        data.weeks.push({
            eixoSocioemocional: block.querySelector('.field-eixo-socioemocional').value,
            semanaLabel: block.querySelector('.field-semana-label').value,
            datas: block.querySelector('.field-datas').value,
            unidades: block.querySelector('.field-unidades').value,
            habilidades: block.querySelector('.field-habilidades').value,
            objetivos: block.querySelector('.field-objetivos').value,
            objetos: block.querySelector('.field-objetos').value,
            metodologia: block.querySelector('.field-metodologia').value,
            recursos: block.querySelector('.field-recursos').value,
            adaptacoes: block.querySelector('.field-adaptacoes').value,
            avaliacao: block.querySelector('.field-avaliacao').value,
            recuperacao: block.querySelector('.field-recuperacao').value,
            referencias: block.querySelector('.field-referencias').value
        });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        // Migration check: check for v2 data
        const oldData = localStorage.getItem('semed_planos_data_v2');
        if (oldData) {
            try {
                const data = JSON.parse(oldData);
                // Simple mapping for v2 to v3
                if (data.header) {
                    document.getElementById('componente').value = data.header.componente || "";
                    document.getElementById('professor').value = data.header.professor || "";
                }
                if (data.weeks) {
                    data.weeks.forEach(w => {
                        createWeek({
                            semanaLabel: w.label || "",
                            unidades: w.eixo || "",
                            objetos: w.objetos || "",
                            objetivos: w.objetivos || "",
                            metodologia: w.metodologia || "",
                            recursos: w.recursos || "",
                            adaptacoes: w.adaptacoes || "",
                            avaliacao: w.avaliacao || "",
                            recuperacao: w.recuperacao || ""
                        });
                    });
                }
                saveData();
                return;
            } catch(e) {}
        }
        createWeek(); 
        return;
    }

    try {
        const data = JSON.parse(saved);
        
        if (data.header) {
            document.getElementById('componente').value = data.header.componente || "";
            document.getElementById('ano').value = data.header.ano || "";
            document.getElementById('professor').value = data.header.professor || "";
            
            if (data.header.logoSemed) {
                logoSemedB64 = data.header.logoSemed;
                document.getElementById('logo-semed').src = logoSemedB64;
            }
            if (data.header.logoEscola) {
                logoEscolaB64 = data.header.logoEscola;
                document.getElementById('logo-escola').src = logoEscolaB64;
            }
        }

        weeksContainer.innerHTML = "";
        if (data.weeks && data.weeks.length > 0) {
            [...data.weeks].reverse().forEach(w => createWeek(w));
        } else {
            createWeek();
        }
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
        createWeek();
    }
}

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
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        const componente = document.getElementById('componente').value || '';
        const ano = document.getElementById('ano').value || '';
        const prof = document.getElementById('professor').value || '';
        
        const sanitizeFilename = (str) => str.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');

        const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();
        const semedImgEl = document.getElementById('logo-semed');
        const escolaImgEl = document.getElementById('logo-escola');
        
        for (let i = 0; i < blocks.length; i++) {
            if (i > 0) doc.addPage();
            const block = blocks[i];
            const weekNum = i + 1;
            
            // --- HEADER ---
            if (logoSemedB64 && semedImgEl.naturalWidth) {
                const ratio = semedImgEl.naturalHeight / semedImgEl.naturalWidth;
                const w = 40;
                const h = w * ratio;
                doc.addImage(logoSemedB64, 'PNG', 15, 12, w, h);
            }
            if (logoEscolaB64 && escolaImgEl.naturalWidth) {
                const ratio = escolaImgEl.naturalHeight / escolaImgEl.naturalWidth;
                const w = 40;
                const h = w * ratio;
                doc.addImage(logoEscolaB64, 'PNG', 155, 12, w, h);
            }
            
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(30, 58, 102);
            doc.text('PREFEITURA MUNICIPAL DE ALTOS-PI', 105, 14, { align: 'center' });
            doc.setFontSize(9);
            doc.text('SECRETARIA MUNICIPAL DE EDUCAÇÃO-SEMED', 105, 19, { align: 'center' });
            doc.text('COORDENAÇÃO DE ENSINO E APRENDIZAGEM', 105, 23, { align: 'center' });

            // Title Box
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(15, 30, 195, 30);
            doc.line(15, 38, 195, 38);
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text('PLANEJAMENTO SEMANAL - 6º ao 9º ano do Ensino Fundamental', 105, 35, { align: 'center' });

            // Info rows
            doc.setLineWidth(0.2);
            doc.setFontSize(8.5);
            doc.text(`COMPONENTE CURRICULAR: ${componente.toUpperCase()}`, 15, 45);
            doc.line(57, 46, 195, 46);
            
            doc.text(`ANO: ${ano.toUpperCase()}`, 15, 52);
            doc.line(26, 53, 60, 53);
            
            doc.text(`PROFESSOR(A): ${prof.toUpperCase()}`, 65, 52);
            doc.line(90, 53, 195, 53);

            let currentY = 58;
            const marginX = 15;
            const pageWidth = 210;
            const contentWidth = pageWidth - (marginX * 2);

            const sections = [
                { label: 'EIXO INTEGRADOR SOCIOEMOCIONAL', value: block.querySelector('.field-eixo-socioemocional').value },
                { label: `PERÍODO: ${weekNum}ª SEMANA (${block.querySelector('.field-semana-label').value.toUpperCase()})`, value: '' },
                { label: 'DATAS IMPORTANTES DA SEMANA', value: block.querySelector('.field-datas').value },
                { label: 'UNIDADES TEMÁTICAS/PRÁTICAS DE LINGUAGEM/EIXO', value: block.querySelector('.field-unidades').value },
                { label: 'HABILIDADES', value: block.querySelector('.field-habilidades').value },
                { label: 'EXPECTATIVAS DE APRENDIZAGEM (OBJETIVOS)', value: block.querySelector('.field-objetivos').value },
                { label: 'OBJETOS DO CONHECIMENTO / CONTEÚDO', value: block.querySelector('.field-objetos').value },
                { label: 'ESTRATÉGIAS METODOLÓGICAS', value: block.querySelector('.field-metodologia').value },
                { label: 'RECURSOS', value: block.querySelector('.field-recursos').value },
                { label: 'ADAPTAÇÕES CURRICULARES', value: block.querySelector('.field-adaptacoes').value },
                { label: 'AVALIAÇÃO DAS APRENDIZAGENS', value: block.querySelector('.field-avaliacao').value },
                { label: 'RECUPERAÇÃO PARALELA (OBJETIVOS PRIORITÁRIOS)', value: block.querySelector('.field-recuperacao').value },
                { label: 'REFERÊNCIAS', value: block.querySelector('.field-referencias').value }
            ];

            sections.forEach((section) => {
                // Check for page break
                if (currentY > 260) {
                    doc.addPage();
                    currentY = 15;
                }

                // Draw Section Header (Blue)
                doc.setFillColor(185, 233, 255);
                doc.setDrawColor(0, 86, 179);
                doc.rect(marginX, currentY, contentWidth, 7, 'FD');
                doc.setTextColor(0, 86, 179);
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(section.label, 105, currentY + 4.5, { align: 'center' });
                currentY += 7;

                // Draw Value (if any)
                if (section.value) {
                    doc.setTextColor(0);
                    doc.setFont('Helvetica', 'normal');
                    const textLines = doc.splitTextToSize(section.value, contentWidth - 4);
                    const textHeight = (textLines.length * 4) + 4;
                    
                    // Check if value fits on page
                    if (currentY + textHeight > 285) {
                        doc.addPage();
                        currentY = 15;
                    }

                    doc.rect(marginX, currentY, contentWidth, textHeight, 'S');
                    doc.text(textLines, marginX + 2, currentY + 5);
                    currentY += textHeight;
                } else {
                    // Empty box for PERÍODO or if value is empty
                    doc.rect(marginX, currentY, contentWidth, 8, 'S');
                    currentY += 8;
                }
                currentY += 1; // small gap
            });
        }

        const fileName = `PLANO_DE_AULA_V3_${sanitizeFilename(prof)}.pdf`;
        doc.save(fileName);
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
    const componente = document.getElementById('componente').value || '/';
    const ano = document.getElementById('ano').value || '/';
    const sanitizeFilename = (str) => str.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
    const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();

    let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><style>
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; } 
            th, td { border: 1px solid black; padding: 8px; font-family: Arial; font-size: 10pt; }
            th { background-color: #b9e9ff; color: #0056b3; font-weight: bold; text-align: center; text-transform: uppercase; }
            .page-break { page-break-before: always; }
            .header-info { margin-bottom: 20px; }
            .title { text-align: center; font-weight: bold; font-size: 14pt; margin: 10px 0; border-top: 2px solid black; border-bottom: 2px solid black; padding: 5px 0; }
        </style></head>
        <body>
    `;

    blocks.forEach((block, idx) => {
        if (idx > 0) html += `<div class="page-break"></div>`;

        const weekNum = idx + 1;
        const data = {
            eixoSocioemocional: block.querySelector('.field-eixo-socioemocional').value,
            semanaLabel: block.querySelector('.field-semana-label').value,
            datas: block.querySelector('.field-datas').value,
            unidades: block.querySelector('.field-unidades').value,
            habilidades: block.querySelector('.field-habilidades').value,
            objetivos: block.querySelector('.field-objetivos').value,
            objetos: block.querySelector('.field-objetos').value,
            metodologia: block.querySelector('.field-metodologia').value,
            recursos: block.querySelector('.field-recursos').value,
            adaptacoes: block.querySelector('.field-adaptacoes').value,
            avaliacao: block.querySelector('.field-avaliacao').value,
            recuperacao: block.querySelector('.field-recuperacao').value,
            referencias: block.querySelector('.field-referencias').value
        };

        html += `
            <h2 style="text-align:center; font-size: 12pt; margin: 0;">PREFEITURA MUNICIPAL DE ALTOS-PI</h2>
            <h3 style="text-align:center; font-size: 11pt; margin: 0;">SECRETARIA MUNICIPAL DE EDUCAÇÃO-SEMED</h3>
            <h3 style="text-align:center; font-size: 11pt; margin: 0;">COORDENAÇÃO DE ENSINO E APRENDIZAGEM</h3>
            
            <div class="title">PLANEJAMENTO SEMANAL - 6º ao 9º ano do Ensino Fundamental</div>
            
            <div class="header-info">
                <p><b>COMPONENTE CURRICULAR:</b> ${componente.toUpperCase()}</p>
                <p><b>ANO:</b> ${ano.toUpperCase()} &nbsp;&nbsp;&nbsp; <b>PROFESSOR(A):</b> ${prof.toUpperCase()}</p>
            </div>

            <table>
                <tr><th>EIXO INTEGRADOR SOCIOEMOCIONAL</th></tr>
                <tr><td>${data.eixoSocioemocional.replace(/\n/g, '<br>')}</td></tr>
                
                <tr><th>PERÍODO: ${weekNum}ª SEMANA (${data.semanaLabel.toUpperCase()})</th></tr>
                <tr><td>&nbsp;</td></tr>

                <tr><th>DATAS IMPORTANTES DA SEMANA</th></tr>
                <tr><td>${data.datas.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>UNIDADES TEMÁTICAS/PRÁTICAS DE LINGUAGEM/EIXO</th></tr>
                <tr><td>${data.unidades.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>HABILIDADES</th></tr>
                <tr><td>${data.habilidades.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>EXPECTATIVAS DE APRENDIZAGEM (OBJETIVOS)</th></tr>
                <tr><td>${data.objetivos.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>OBJETOS DO CONHECIMENTO / CONTEÚDO</th></tr>
                <tr><td>${data.objetos.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>ESTRATÉGIAS METODOLÓGICAS</th></tr>
                <tr><td>${data.metodologia.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>RECURSOS</th></tr>
                <tr><td>${data.recursos.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>ADAPTAÇÕES CURRICULARES</th></tr>
                <tr><td>${data.adaptacoes.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>AVALIAÇÃO DAS APRENDIZAGENS</th></tr>
                <tr><td>${data.avaliacao.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>RECUPERAÇÃO PARALELA (OBJETIVOS PRIORITÁRIOS)</th></tr>
                <tr><td>${data.recuperacao.replace(/\n/g, '<br>')}</td></tr>

                <tr><th>REFERÊNCIAS</th></tr>
                <tr><td>${data.referencias.replace(/\n/g, '<br>')}</td></tr>
            </table>
        `;
    });

    html += `</body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = `PLANO_DE_AULA_V3_${sanitizeFilename(prof)}.doc`;
    link.download = fileName;
    link.click();
};


// 7. Floating Buttons
document.getElementById('float-pdf-btn').onclick = () => document.getElementById('gerar-pdf-btn').click();
document.getElementById('float-word-btn').onclick = () => document.getElementById('gerar-word-btn').click();
document.getElementById('float-resumo-btn').onclick = () => document.getElementById('gerar-resumo-btn').click();

// 8. Summary Generator Logic
const summaryModal = document.getElementById('summary-modal');
const summaryBody = document.getElementById('summary-body');
const closeModalBtn = document.querySelector('.close-modal');
const gerarResumoBtn = document.getElementById('gerar-resumo-btn');
const copySummaryBtn = document.getElementById('copy-summary-btn');

gerarResumoBtn.onclick = () => {
    const blocks = Array.from(weeksContainer.querySelectorAll('.week-block')).reverse();
    if (blocks.length === 0) return alert("Adicione pelo menos uma semana para gerar o resumo.");

    let summaryText = "";
    blocks.forEach((block) => {
        const period = block.querySelector('.field-semana-label').value.trim() || "Período não definido";
        const unidades = block.querySelector('.field-unidades').value.trim();
        const objetos = block.querySelector('.field-objetos').value.trim();
        const metodologia = block.querySelector('.field-metodologia').value.trim();

        if (unidades || objetos || metodologia) {
            summaryText += `---------------------------\nPERÍODO: ${period.toUpperCase()}\n---------------------------\n`;
            if (unidades) summaryText += "UNIDADES: " + unidades + "\n\n";
            if (objetos) summaryText += "OBJETOS: " + objetos + "\n\n";
            if (metodologia) summaryText += "METODOLOGIA: " + metodologia + "\n\n";
        }
    });

    if (!summaryText.trim()) summaryText = "Nenhum conteúdo encontrado nos campos de Objetos de Conhecimento ou Metodologia.";
    
    summaryBody.innerHTML = `<div class="summary-box">${summaryText.trim()}</div>`;
    summaryModal.style.display = 'block';
};

closeModalBtn.onclick = () => summaryModal.style.display = 'none';
window.onclick = (event) => {
    if (event.target == summaryModal) summaryModal.style.display = 'none';
    if (!event.target.matches('#theme-btn') && !event.target.closest('.theme-dropdown')) {
        themeDropdown.classList.remove('show');
    }
};

copySummaryBtn.onclick = () => {
    const text = summaryBody.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copySummaryBtn.innerText;
        copySummaryBtn.innerText = "Copiado!";
        setTimeout(() => copySummaryBtn.innerText = originalText, 2000);
    }).catch(err => {
        alert("Erro ao copiar: " + err);
    });
};

// Start
(async () => {
    loadData();
    
    // Check if logos are still the default filenames or empty before applying SVG defaults
    const semedImg = document.getElementById('logo-semed');
    const escolaImg = document.getElementById('logo-escola');

    if (!logoSemedB64 && (semedImg.src.includes('semed_altos_logo.svg') || !semedImg.src)) {
        logoSemedB64 = await svgToBase64(SEMED_LOGO_DEFAULT);
        semedImg.src = logoSemedB64;
    }
    if (!logoEscolaB64 && (escolaImg.src.includes('zeca_marinha_logo.svg') || !escolaImg.src)) {
        logoEscolaB64 = await svgToBase64(ESCOLA_LOGO_DEFAULT);
        escolaImg.src = logoEscolaB64;
    }

    // Load Saved Theme
    const savedTheme = localStorage.getItem('semed_app_theme') || 'light';
    setTheme(savedTheme);
    
    // 9. View Mode Toggle
    const viewMobileBtn = document.getElementById('view-mobile-btn');
    const viewPcBtn = document.getElementById('view-pc-btn');

    if (viewMobileBtn && viewPcBtn) {
        viewMobileBtn.onclick = () => {
            if (document.body.classList.contains('view-mobile')) {
                setViewMode('auto');
            } else {
                setViewMode('mobile');
            }
        };
        viewPcBtn.onclick = () => {
            if (document.body.classList.contains('view-pc')) {
                setViewMode('auto');
            } else {
                setViewMode('pc');
            }
        };

        function setViewMode(mode) {
            document.body.classList.remove('view-mobile', 'view-pc');
            viewMobileBtn.classList.remove('active');
            viewPcBtn.classList.remove('active');
            
            if (mode === 'mobile') {
                document.body.classList.add('view-mobile');
                viewMobileBtn.classList.add('active');
            } else if (mode === 'pc') {
                document.body.classList.add('view-pc');
                viewPcBtn.classList.add('active');
            }
            
            localStorage.setItem('semed_app_view_mode', mode);
        }

        // Load Saved View Mode
        const savedViewMode = localStorage.getItem('semed_app_view_mode') || 'auto';
        if (savedViewMode !== 'auto') {
            setViewMode(savedViewMode);
        }
    }
})();
