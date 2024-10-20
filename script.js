

document.getElementById('simplify-button').addEventListener('click', function () {
    const booleanExpression = document.getElementById('boolean-expression').value.trim();

    if (!booleanExpression) {
        alert("Please enter a Boolean expression!");
        return;
    }

    if (!validateExpression(booleanExpression)) {
        alert("Invalid characters in expression! Please use only A-Z, 0-1, ., +, !, and ()");
        return;
    }

    fetch('http://127.0.0.1:5000/simplify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expression: booleanExpression })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Network response was not ok') });
        }
        return response.json();
    })
    .then(data => {
        console.log('Simplified expression:', data);

        document.getElementById('simplified-result').textContent = data.simplified_expression;

        const kmapSteps = getKmapSteps(data.simplified_expression);
        document.getElementById('kmap-steps').innerHTML = kmapSteps;

        
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred: " + error.message);
    });
});

function validateExpression(expression) {
    const validRegex = /^[A-Za-z01.+!()]+$/;
    return validRegex.test(expression);
}

function evaluateBooleanExpression(expr, A, B) {
    const safeEval = new Function('A', 'B', `return ${expr};`);
    return safeEval(A, B) ? 1 : 0;
}

function generateTruthTable(expression) {
    const values = [];
    for (let A of [0, 1]) {
        for (let B of [0, 1]) {
            const expr = expression.replace(/A/g, A).replace(/B/g, B);
            try {
                const result = evaluateBooleanExpression(expr, A, B);
                values.push(result);
            } catch (error) {
                console.error("Error evaluating expression:", error);
                values.push('E');
            }
        }
    }
    return values;
}

function getKmapSteps(expression) {
    const svgWidth = 200;
    const svgHeight = 200;
    const cellWidth = 100;
    const cellHeight = 100;

    const values = generateTruthTable(expression);

    const svg = `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${cellWidth}" height="${cellHeight}" fill="${values[0] ? '#cfe2f3' : '#ffffff'}" stroke="#000" />
            <rect x="${cellWidth}" y="0" width="${cellWidth}" height="${cellHeight}" fill="${values[1] ? '#cfe2f3' : '#ffffff'}" stroke="#000" />
            <rect x="0" y="${cellHeight}" width="${cellWidth}" height="${cellHeight}" fill="${values[2] ? '#cfe2f3' : '#ffffff'}" stroke="#000" />
            <rect x="${cellWidth}" y="${cellHeight}" width="${cellWidth}" height="${cellHeight}" fill="${values[3] ? '#cfe2f3' : '#ffffff'}" stroke="#000" />
            <text x="50" y="50" text-anchor="middle">${values[0]}</text>
            <text x="150" y="50" text-anchor="middle">${values[1]}</text>
            <text x="50" y="150" text-anchor="middle">${values[2]}</text>
            <text x="150" y="150" text-anchor="middle">${values[3]}</text>
        </svg>
    `;

    return svg;
}
