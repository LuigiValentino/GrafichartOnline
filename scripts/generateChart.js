const chartTypes = {
    chartjs: ['bar', 'line', 'pie', 'radar'],
    apexcharts: ['bar', 'line', 'pie', 'radar'],
    d3js: ['bar', 'line'],
    highcharts: ['bar', 'line', 'pie']
};

function updateChartTypeOptions(library) {
    const chartTypeSelect = document.getElementById('chartType');
    chartTypeSelect.innerHTML = ''; // Limpiar opciones anteriores

    chartTypes[library].forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = capitalizeFirstLetter(type);
        chartTypeSelect.appendChild(option);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.getElementById('library').addEventListener('change', function() {
    updateChartTypeOptions(this.value);
});

function getChartConfig(library, chartType, chartLabels, chartData, chartColors, chartTitle, theme) {
    switch(library) {
        case 'chartjs':
            return {
                type: chartType,
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'My Dataset',
                        data: chartData,
                        backgroundColor: chartColors,
                        borderColor: chartColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: chartTitle
                        }
                    }
                }
            };
        case 'apexcharts':
            return {
                chart: {
                    type: chartType,
                    theme: { mode: theme }
                },
                series: [{ name: 'My Dataset', data: chartData }],
                xaxis: { categories: chartLabels },
                title: { text: chartTitle },
                colors: chartColors
            };
        case 'd3js':
            return {
                type: 'd3js',
                chartData: chartData,
                chartColors: chartColors,
                theme: theme
            };
        case 'highcharts':
            return {
                chart: {
                    type: chartType,
                    backgroundColor: theme === "dark" ? "#333" : "#fff"
                },
                title: { text: chartTitle },
                xAxis: { categories: chartLabels },
                series: [{
                    name: 'My Dataset',
                    data: chartData,
                    colorByPoint: true,
                    colors: chartColors
                }]
            };
    }
}

function generateChart() {
    const library = document.getElementById('library').value;
    const chartType = document.getElementById('chartType').value;
    const chartLabels = document.getElementById('chartLabels').value.split(',');
    const chartData = document.getElementById('chartData').value.split(',').map(Number);
    const chartColors = document.getElementById('chartColors').value.split(',');
    const chartTitle = document.getElementById('chartTitle').value || 'My Chart';
    const theme = document.getElementById('theme').value;

    if (!chartLabels.length || !chartData.length || !chartColors.length) {
        alert("Por favor, complete todos los campos necesarios para generar el gráfico.");
        return;
    }

    const config = getChartConfig(library, chartType, chartLabels, chartData, chartColors, chartTitle, theme);

    // Clear the chart preview area before rendering a new chart
    document.getElementById('chartContainer').innerHTML = '<canvas id="chartPreview" class="max-w-full"></canvas>';

    if (library === 'chartjs') {
        const ctx = document.getElementById('chartPreview').getContext('2d');
        new Chart(ctx, config);
        document.getElementById('generatedCode').value = `
            <canvas id="myChart"></canvas>
            <script>
            const ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, ${JSON.stringify(config, null, 2)});
            </script>
        `;
    } else if (library === 'apexcharts') {
        const chart = new ApexCharts(document.getElementById('chartContainer'), config);
        chart.render();
        document.getElementById('generatedCode').value = `
            <div id="myChart"></div>
            <script>
            const options = ${JSON.stringify(config, null, 2)};
            const chart = new ApexCharts(document.querySelector("#myChart"), options);
            chart.render();
            </script>
        `;
    } else if (library === 'd3js') {
        const svg = d3.select("#chartContainer").append("svg")
            .attr("width", 500)
            .attr("height", 300)
            .style("background", theme === "dark" ? "#333" : "#fff");

        svg.selectAll("rect")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * (500 / chartData.length))
            .attr("y", d => 300 - d * 10)
            .attr("width", 500 / chartData.length - 2)
            .attr("height", d => d * 10)
            .attr("fill", (d, i) => chartColors[i]);

        document.getElementById('generatedCode').value = `
            <script src="https://d3js.org/d3.v7.min.js"></script>
            <script>
            const svg = d3.select("body").append("svg")
                .attr("width", 500)
                .attr("height", 300);

            svg.selectAll("rect")
                .data(${JSON.stringify(chartData)})
                .enter()
                .append("rect")
                .attr("x", (d, i) => i * (500 / ${chartData.length}))
                .attr("y", d => 300 - d * 10)
                .attr("width", 500 / ${chartData.length} - 2)
                .attr("height", d => d * 10)
                .attr("fill", "${chartColors[0]}");
            </script>
        `;
    } else if (library === 'highcharts') {
        Highcharts.chart('chartContainer', config);
        document.getElementById('generatedCode').value = `
            <div id="myChart"></div>
            <script src="https://code.highcharts.com/highcharts.js"></script>
            <script>
            Highcharts.chart('myChart', ${JSON.stringify(config, null, 2)});
            </script>
        `;
    }
}

// Inicializar el tipo de gráfico basado en la biblioteca seleccionada por defecto
document.addEventListener('DOMContentLoaded', function() {
    updateChartTypeOptions(document.getElementById('library').value);
});

document.getElementById('generateChart').addEventListener('click', generateChart);

document.getElementById('copyCode').addEventListener('click', function() {
    const codeText = document.getElementById('generatedCode');
    codeText.select();
    document.execCommand('copy');
    alert('¡Código copiado al portapapeles!');
});

document.getElementById('downloadImage').addEventListener('click', function() {
    const chartCanvas = document.getElementById('chartPreview');
    const image = chartCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = image;
    link.click();
});
