const visObject = {
    // Configuration for visualisation
    options: {
        chart_title: {
            type: "string",
            label: "Chart Title",
            default: "Employee Data"
        }
    },

    // Calls visualisation
    create: function(element) {
        element.innerHTML = "<h1>Ready to render!</h1>";
        const script = document.createElement('script');
        script.src = 'https://d3js.org/d3.v4.min.js';
        script.async = true;
        document.body.appendChild(script);
    },

    // Calls function when data or configuration is changed
    updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
        if (!data || !data.length) return;
        console.log(data[0]);

        // Check if D3 library is loaded
        let intervalId = setInterval(() => {
            if (typeof d3 !== 'undefined') {
                clearInterval(intervalId);
                renderVisualisation(data, element, doneRendering);
            }
        }, 100);
    }
};

// Render visualisation
function renderVisualisation(data, element, doneRendering) {
    const margin = { top: 50, right: 50, bottom: 30, left: 120 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);

    element.innerHTML = "";

    const svg = d3.select(element)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const employeeData = processData(data);
    setDomains(x, y, employeeData);

    drawBars(svg, x, y, employeeData);
    addLabels(svg, x, y, employeeData);
    addCategoryHeaders(svg, x, y, employeeData);

    doneRendering();
}

// Process data to required format for the visualisation
function processData(data) {
    const dataMap = {};

    data.forEach(item => {
        const job_level = item.job_level.value;
        const employee_status = item.employee_status.value;

        if (!dataMap[job_level]) {
            dataMap[job_level] = {
                job_level: job_level,
                headcount: 0,
                new_hires: 0,
                leavers: 0
            };
        }

        if (employee_status === 'existing') dataMap[job_level].headcount++;
        else if (employee_status === 'new_hire') dataMap[job_level].new_hires++;
        else if (employee_status === 'leaver') dataMap[job_level].leavers++;
    });

    return Object.values(dataMap);
}

// Set scales for x and y axis
function setDomains(x, y, data) {
    const total = d3.sum(data, d => d.headcount + d.new_hires + d.leavers);
    x.domain([0, 1]);
    y.domain(data.map(d => d.job_level));
}


// Draw bars on SVG for new hire, headcount and leavers
function drawBars(svg, x, y, data) {
    const total = d3.sum(data, d => d.headcount + d.new_hires + d.leavers);

    // Add new hires bars
    svg.selectAll(".new-hires-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "new-hires-bar")
        .attr("style", "fill: #D0F0C0;")
        .attr("x", 0)
        .attr("y", d => y(d.job_level))
        .attr("width", d => x(d.new_hires / total))
        .attr("height", y.bandwidth() / 2);

    // Add headcount bars
    svg.selectAll(".headcount-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "headcount-bar")
        .attr("style", "fill: #8fa9dc;")
        .attr("x", d => x(0.5 - (d.headcount / total) / 2))
        .attr("y", d => y(d.job_level))
        .attr("width", d => x(d.headcount / total))
        .attr("height", y.bandwidth() / 2);

    // Add leavers bars
    svg.selectAll(".leavers-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "leavers-bar")
        .attr("style", "fill: #e74c3c;")
        .attr("x", d => x(1 - d.leavers / total))
        .attr("y", d => y(d.job_level))
        .attr("width", d => x(d.leavers / total))
        .attr("height", y.bandwidth() / 2);
}

// Add percentage label
function addLabels(svg, x, y, data) {
    const total = d3.sum(data, d => d.headcount + d.new_hires + d.leavers);

    function addPercentageLabels(selection, property, xOffset, widthFactor) {
        selection.data().forEach(d => {
            svg.append('text')
                .attr('x', x(xOffset(d)) + x(widthFactor(d)) / 2)
                .attr('y', y(d.job_level) + y.bandwidth() / 4)
                .attr('font-size', '12px')
                .attr('text-anchor', 'middle')
                .text(((d[property] / total) * 100).toFixed(1) + '%');
        });
    }

    addPercentageLabels(svg.selectAll('.new-hires-bar'), 'new_hires', d => 0, d => 0.04);
    addPercentageLabels(svg.selectAll('.headcount-bar'), 'headcount', d => 0.5 - (d.headcount / total) / 2, d => d.headcount / total);
    addPercentageLabels(svg.selectAll('.leavers-bar'), 'leavers', d => 1 - d.leavers / total, d => d.leavers / total);
}

// Add headers for different categories
function addCategoryHeaders(svg, x, y, data) {
    const total = d3.sum(data, d => d.headcount + d.new_hires + d.leavers);

    const gap = 10;
    svg.selectAll(".category-rect")
        .data(data)
        .enter().append("rect")
        .attr("class", "category-rect")
        .attr("fill", "none")
        .attr("stroke", "#8fa9dc")
        .attr("x", -120 + gap)
        .attr("y", d => y(d.job_level))
        .attr("width", 120 - 2 * gap)
        .attr("height", y.bandwidth() / 2);

    svg.selectAll(".category-label")
        .data(data)
        .enter().append("text")
        .attr("class", "category-label")
        .attr("x", -60)
        .attr("y", d => y(d.job_level) + y.bandwidth() / 4)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("style", "fill: black;")
        .text(d => d.job_level);

    function addCategoryLabel(xOffset, widthFactor, label) {
        svg.append('text')
            .attr('x', x(xOffset) + x(widthFactor) / 2)
            .attr('y', -15)
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text(label);
    }

    const headcountWidthFactor = data[0].headcount / total;

    addCategoryLabel(0, 0, 'New Hires');
    addCategoryLabel(0.5 - headcountWidthFactor / 2, headcountWidthFactor, 'Headcount');
    addCategoryLabel(1 - data[0].leavers / total, 0, 'Leavers');
}

// Register visualisation on Looker
looker.plugins.Visualisations.add(visObject);
