const { jsPDF } = window.jspdf;

// 1. Manage Weeks
const weeksContainer = document.getElementById('weeks-container');
const addWeekBtn = document.getElementById('add-week-btn');
const weekTemplate = document.getElementById('week-template');

function createWeek(index) {
    const clone = weekTemplate.content.cloneNode(true);
    const block = clone.querySelector('.week-block');
    block.querySelector('.week-num').textContent = index;
    
    // Auto-fill example
    const labelField = block.querySelector('.field-semana-label');
    if (labelField) labelField.value = `${index}ª SEMANA`;

    // Initialize Flatpickr for Start/End
    const startInput = block.querySelector('.field-date-start');
    const endInput = block.querySelector('.field-date-end');
    [startInput, endInput].forEach(inp => {
        if (inp) flatpickr(inp, { dateFormat: "d/m", locale: "pt" });
    });

    clone.querySelector('.remove-week-btn').onclick = () => {
        block.remove();
        updateWeekNumbers();
    };
    
    weeksContainer.appendChild(clone);
}

function updateWeekNumbers() {
    const numbers = weeksContainer.querySelectorAll('.week-num');
    numbers.forEach((num, idx) => {
        num.textContent = idx + 1;
    });
}

// Start with one week
createWeek(1);

addWeekBtn.onclick = () => {
    const count = weeksContainer.querySelectorAll('.week-block').length;
    createWeek(count + 1);
};

// 2. Data Extractor
function getPlanningData() {
    const tableRows = [];
    const weekBlocks = weeksContainer.querySelectorAll('.week-block');
    
    weekBlocks.forEach(block => {
        const label = block.querySelector('.field-semana-label').value;
        const start = block.querySelector('.field-date-start').value;
        const end = block.querySelector('.field-date-end').value;
        
        let fullDateStr = label;
        if (start && end) {
            fullDateStr += ` - ${start} a ${end}`;
        } else if (start || end) {
            fullDateStr += ` - ${start || end}`;
        }

        tableRows.push([
            fullDateStr,
            block.querySelector('.field-habilidades').value,
            block.querySelector('.field-objetivos').value,
            block.querySelector('.field-objetos').value,
            block.querySelector('.field-metodologia').value,
            block.querySelector('.field-avaliacao').value
        ]);
    });
    return tableRows;
}

// 3. PDF Generation (ONLY Table)
const gerarPdfBtn = document.getElementById('gerar-pdf-btn');

gerarPdfBtn.onclick = async () => {
    gerarPdfBtn.disabled = true;
    gerarPdfBtn.innerHTML = 'Processando...';

    try {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const tableData = getPlanningData();

        doc.autoTable({
            startY: 15,
            head: [['DATAS', 'HABILIDADES', 'OBJETIVOS', 'OBJETO DO CONHECIMENTO', 'METODOLOGIA', 'AVALIAÇÃO']],
            body: tableData.length > 0 ? tableData : [['', '', '', '', '', '']],
            theme: 'grid',
            headStyles: {
                fillColor: [220, 220, 220],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            styles: {
                font: 'Helvetica',
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 32 },
                1: { cellWidth: 44 },
                2: { cellWidth: 44 },
                3: { cellWidth: 44 },
                4: { cellWidth: 60 },
                5: { cellWidth: 43 }
            },
            margin: { horizontal: 15 }
        });

        doc.save(`Planejamento_Tabela.pdf`);
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao gerar PDF.');
    } finally {
        gerarPdfBtn.disabled = false;
        gerarPdfBtn.innerHTML = '<span class="btn-icon">📄</span> PDF';
    }
};

// 4. Word (Doc) Generation
const gerarWordBtn = document.getElementById('gerar-word-btn');

gerarWordBtn.onclick = () => {
    const data = getPlanningData();
    
    // Create HTML template for Word
    let tableHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Planejamento</title>
        <style>
            table { border-collapse: collapse; width: 100%; border: 1px solid black; }
            th, td { border: 1px solid black; padding: 8px; font-family: Arial; font-size: 11pt; }
            th { background-color: #dcdcdc; font-weight: bold; }
        </style>
        </head>
        <body style="mso-page-orientation: landscape;">
        <h3>PLANEJAMENTO SEMANAL</h3>
        <table>
            <thead>
                <tr>
                    <th>DATAS</th>
                    <th>HABILIDADES</th>
                    <th>OBJETIVOS</th>
                    <th>OBJETO DO CONHECIMENTO</th>
                    <th>METODOLOGIA</th>
                    <th>AVALIAÇÃO</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${cell.replace(/\n/g, '<br>')}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', tableHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Planejamento_Tabela.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
