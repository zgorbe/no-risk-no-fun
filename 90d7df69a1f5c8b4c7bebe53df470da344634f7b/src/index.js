(() => {
    const fileInput = document.getElementById('file');
    const radiusInput = document.getElementById('radius');
    const calculateBtn = document.getElementById('calculateBtn');
    const result = document.getElementById('result');
    let fileContent = '';
    let radius = 2;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            fileContent = e.target.result;
        };
        reader.readAsText(file);
    });

    radiusInput.addEventListener('change', (e) => {
        radius = Number(e.target.value);
    });

    // Returns all possible pairs from the array of numbers flattened
    function getPairsFromRow(row) {
        return row.map((value, index) => {
            return row.slice(index + 1).map(value2 => [value, value2]);
        }).flat();
    }

    function getSurroundingNumbers(data, pair, radius) {
        const surroundingNumbers = new Set();
        const allRowsIndicesWithPair = data.reduce((acc, row, rowIndex) => {
            if (row.includes(pair[0]) && row.includes(pair[1]) && rowIndex > 0) {
                acc.push(rowIndex);
            }
            return acc;
        }, []);

        allRowsIndicesWithPair.forEach(rowIndex => {
            let rowsAbove, rowsBelow;
            if (rowIndex < radius) {
                rowsAbove = data.slice(0, rowIndex);
            } else {
                rowsAbove = data.slice(0, rowIndex).slice(-radius);
            }
            if (rowIndex + radius + 1 > data.length) {
                rowsBelow = data.slice(rowIndex + 1, data.length);
            } else {
                rowsBelow = data.slice(rowIndex + 1, rowIndex + radius + 1);
            }
            const row = data[rowIndex].filter(value => value !== pair[0] && value !== pair[1]);
            const allRows = [...rowsAbove, row, ...rowsBelow];
            allRows.forEach(row => {
                row.forEach(value => surroundingNumbers.add(value));
            });
        });

        return Array.from(surroundingNumbers);
    }

    function keepSurroundingNumbersWithGreaterThan1(surroundingNumbersDict) {
        Object.keys(surroundingNumbersDict).forEach(number => {
            if (surroundingNumbersDict[number] <= 1) {
                delete surroundingNumbersDict[number];
            }
        });
    }

    function getTop20SurroundingNumbers(surroundingNumbersDict) {
        return Object.keys(surroundingNumbersDict)
            .sort((a, b) => surroundingNumbersDict[b] - surroundingNumbersDict[a]).slice(0, 20).map(Number);
    }

    calculateBtn.addEventListener('click', () => {
        console.log(fileContent);
        console.log(radius);
        const data = fileContent.split('\n').map(line => line.split(/,|;/).map(Number));
        console.log(data);

        const pairsFromFirstRow = getPairsFromRow(data[0]);
        console.log(pairsFromFirstRow);

        const surroundingNumbersDict = {};
        pairsFromFirstRow.forEach(pair => {
            const surroundingNumbers = getSurroundingNumbers(data, pair, radius);
            surroundingNumbers.forEach(number => {
                surroundingNumbersDict[number] = (surroundingNumbersDict[number] || 0) + 1;
            });
        });
        keepSurroundingNumbersWithGreaterThan1(surroundingNumbersDict);
        const top20SurroundingNumbers = getTop20SurroundingNumbers(surroundingNumbersDict);
        console.log(surroundingNumbersDict);
        console.log(top20SurroundingNumbers);
        result.innerHTML = 'Creating pairs with: ' + top20SurroundingNumbers.join(', ');
    });
})();