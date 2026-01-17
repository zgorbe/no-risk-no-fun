(() => {
    const fileInput = document.getElementById('file');
    const radiusInput = document.getElementById('radius');
    const calculateBtn = document.getElementById('calculateBtn');
    const result = document.getElementById('result');
    const logContainer = document.getElementById('logContainer');
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

    function appendToLog(message, useHTML = false) {
        const logElement = document.createElement('div');
        logElement.style.marginBottom = '10px';
        if (useHTML) {
            logElement.innerHTML = message;
        } else {
            logElement.textContent = message;
        }
        logContainer.appendChild(logElement);
    }

    // Returns all possible pairs from the array of numbers flattened
    function getPairsFromRow(row) {
        return row.map((value, index) => {
            return row.slice(index + 1).map(value2 => [value, value2]);
        }).flat();
    }

    function getSurroundingNumbers(data, pair, radius) {
        const allRowsIndicesWithPair = data.reduce((acc, row, rowIndex) => {
            if (row.includes(pair[0]) && row.includes(pair[1]) && rowIndex > 0) {
                acc.push(rowIndex);
            }
            return acc;
        }, []);

        appendToLog(`Pair: ${pair.join(', ')} - Row: ${allRowsIndicesWithPair.join(', ')}`);

        const surroundingNumbersDict = {};

        allRowsIndicesWithPair.forEach(rowIndex => {
            const surroundingNumbers = new Set();
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
            surroundingNumbers.forEach(number => {
                surroundingNumbersDict[number] = (surroundingNumbersDict[number] || 0) + 1;
            });
        });

        return surroundingNumbersDict;
    }

    function keepSurroundingNumbersWithGreaterThan1(surroundingNumbersDict) {
        Object.keys(surroundingNumbersDict).forEach(number => {
            if (surroundingNumbersDict[number] <= 1) {
                delete surroundingNumbersDict[number];
            }
        });
    }

    function getTopNSurroundingNumbers(surroundingNumbersDict, n) {
        return Object.keys(surroundingNumbersDict)
            .sort((a, b) => surroundingNumbersDict[b] - surroundingNumbersDict[a]).slice(0, n).map(Number);
    }

    function appendSurroundingNumbersToLog(surroundingNumbersDict) {
        const formattedDict = Object.entries(surroundingNumbersDict)
            .sort((a, b) => b[1] - a[1])
            .map(([number, count]) => `<div style="margin-left: 20px;">${number}: <strong>${count}</strong></div>`)
            .join('');
        appendToLog(`<div><strong>Surrounding numbers dict (${Object.keys(surroundingNumbersDict).length}):</strong>${formattedDict}</div>`, true);
    }

    function appendSurroundingNumbersSideBySideToLog(surroundingNumbersDict1, surroundingNumbersDict2) {
        const formatDict = (dict) => {
            return Object.entries(dict)
                .sort((a, b) => b[1] - a[1])
                .map(([number, count]) => `<div style="margin-left: 20px;">${number}: <strong>${count}</strong></div>`)
                .join('');
        };

        const formattedDict1 = formatDict(surroundingNumbersDict1);
        const formattedDict2 = formatDict(surroundingNumbersDict2);

        const html = `
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <strong>Surrounding numbers dict (${Object.keys(surroundingNumbersDict1).length}):</strong>
                    ${formattedDict1}
                </div>
                <div style="flex: 1;">
                    <strong>Surrounding numbers dict (${Object.keys(surroundingNumbersDict2).length}):</strong>
                    ${formattedDict2}
                </div>
            </div>
        `;
        appendToLog(html, true);
    }

    function mergeDicts(dict1, dict2) {
        const allKeys = new Set([...Object.keys(dict1), ...Object.keys(dict2)]);
        return Array.from(allKeys).reduce((acc, number) => {
            acc[number] = (dict1[number] || 0) + (dict2[number] || 0);
            return acc;
        }, {});
    }

    calculateBtn.addEventListener('click', () => {
        const data = fileContent.split('\n').map(line => line.split(/,|;/).map(Number));
        const pairsFromFirstRow = getPairsFromRow(data[0]);
        const surroundingNumbersDict = {};

        pairsFromFirstRow.forEach(pair => {
            const numbersDict = getSurroundingNumbers(data, pair, radius);
            Object.keys(numbersDict).forEach(number => {
                surroundingNumbersDict[number] = (surroundingNumbersDict[number] || 0) + numbersDict[number];
            });
        });

        const surroundingNumbersDictForLastItemInFirstRow = {};
        const lastItemInFirstRow = data[0][data[0].length - 1];
        console.log(lastItemInFirstRow);
        const numbersDict = getSurroundingNumbers(data, [lastItemInFirstRow, lastItemInFirstRow], radius);
        Object.keys(numbersDict).forEach(number => {
            surroundingNumbersDictForLastItemInFirstRow[number] = (surroundingNumbersDictForLastItemInFirstRow[number] || 0) + numbersDict[number];
        });

        keepSurroundingNumbersWithGreaterThan1(surroundingNumbersDict);
        keepSurroundingNumbersWithGreaterThan1(surroundingNumbersDictForLastItemInFirstRow);

        appendSurroundingNumbersSideBySideToLog(surroundingNumbersDict, surroundingNumbersDictForLastItemInFirstRow);

        const mergedDict = mergeDicts(surroundingNumbersDict, surroundingNumbersDictForLastItemInFirstRow);
        appendSurroundingNumbersToLog(mergedDict);
        // result.innerHTML = `Ordered numbers: ${topNSurroundingNumbers.join(', ')}`;
    });
})();