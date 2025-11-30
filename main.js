let recovery, annotations;
const tooltipPadding = 15;

const setupVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0.1 * containerHeight,
        right: 0.01 * containerWidth,
        bottom: 0.05 * containerHeight,
        left: 0.01 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const stripWidth = height / 72;
    
    const scales = {};
    recovery.categories.forEach(category => {
        scales[category] = d3.scaleLinear().domain(d3.extent(recovery[category].flat(Infinity))).range([height / 6 - 2 * stripWidth, 2 * stripWidth]);
    });

    const categoryColours = {
        "weight": ["#ef476f", "#fad2e1"],
        "sleep": ["#03045e", "#8ecae6"],
        "steps": ["#004733", "#a5c1ae"],
        "rhr": ["#27187e", "#c8b6ff"],
        "intmin": ["#780116", "#df8080"],
        "stress": ["#e36414", "#ffbf69"]
    };

    const svg = d3.select("#visualization");

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const quiltColumns = chart.selectAll("g")
        .data(recovery.ordering)
        .join("g")
        .attr("transform", (_, i) => `translate(${i * width / 6}, 0)`);

    const quiltSquares = quiltColumns.selectAll("g")
        .data(d => d)
        .join("g")
        .attr("transform", (_, i) => `translate(0, ${i * height / 6})`);

    quiltSquares.selectAll(".quilt-background")
        .data(d => [d])
        .join("rect")
        .attr("class", "quilt-background")
        .attr("width", width / 6)
        .attr("height", height / 6)
        .attr("fill-opacity", 0.9)
        .attr("stroke-opacity", 1)
        .attr("stroke", "black")
        .attr("stroke-width", width / 500)
        .attr("stroke-dasharray", "10 10")
        .attr("rx", width * 0.002)
        .attr("ry", width * 0.002)
        .attr("fill", d => categoryColours[d.category][0]);

    quiltSquares.selectAll(".quilt-inner-background")
        .data(d => [d])
        .join("rect")
        .attr("class", "quilt-inner-background")
        .attr("width", width / 6 - 2 * stripWidth)
        .attr("height", height / 6 - 2 * stripWidth)
        .attr("fill", d => categoryColours[d.category][1])
        .attr("opacity", 1)
        .attr("rx", width * 0.006)
        .attr("ry", width * 0.006)
        .attr("transform", `translate(${stripWidth}, ${stripWidth})`);

    quiltSquares.selectAll(".quilt-line")
        .data(d => [[d.category, recovery[d.category][d.era]]])
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", width / 400)
        .attr("d", d => {
            return d3.line()
            .x((_, i) => {
                console.log(i);
                return d3.scaleLinear().domain([0, d[1].length - 1]).range([stripWidth, width / 6 - stripWidth])(i);
            })
            .y(j => {
                return scales[d[0]](j);
            })
            .curve(d3.curveCatmullRom.alpha(0.5))
            (d[1])
        });

    chart.selectAll(".quilt-text")
        .data(annotations)
        .join("text")
        .attr("text-multiplier", 0.4)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", d => `translate(${(d.cell[0] + 0.5) * width / 6}, ${(d.cell[1] + (d.bottom ? 0.8 : 0.2)) * height / 6})`)
        .text(d => d.text);

    chart.selectAll(".era-text")
        .data(["hospital", "home", "exercise", "no more checkups", "full time work", "stop recovery tasks"])
        .join("text")
        .attr("text-multiplier", 0.6)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", (_, i) => `translate(${(i + 0.5) * width / 6}, ${height + margin.bottom / 2})`)
        .text(d => d);

    svg.selectAll(".title")
        .data(["hospital", "home", "exercise", "no more checkups", "full time work", "stop recovery tasks"])
        .join("text")
        .attr("text-multiplier", 1.3)
        .attr("text-anchor", "left")
        .attr("dominant-baseline", "middle")
        .attr("transform", `translate(${3 * margin.left}, ${margin.top / 2})`)
        .text("Recovery Quilt");

    const legendItems = svg.selectAll(".quilt-legend")
        .data(recovery.categories)
        .join("g")
        .attr("transform", (_, i) => `translate(${margin.left + (2 * width / 5) + (i % 3) * 2 * width / 9}, ${margin.top / 5 + Math.floor(i / 3) * 2 * margin.top / 5})`);

    legendItems.selectAll(".legend-circle")
        .data(d => [d])
        .join("circle")
        .attr("r", margin.top / 5 / 2)
        .attr("fill", d => categoryColours[d][1])
        .attr("stroke", d => categoryColours[d][0])
        .attr("stroke-width", margin.top / 5 / 4)
        .attr("cx", margin.top / 5 / 4)
        .attr("cy", margin.top / 5 / 4);

    const categoryMap = {
        "weight": "body weight",
        "sleep": "sleep score",
        "steps": "steps taken",
        "rhr": "resting heart rate",
        "intmin": "intensity minutes",
        "stress": "stress score"
    };

    legendItems.selectAll(".legend-text")
        .data(d => [d])
        .join("text")
        .attr("text-multiplier", 0.6)
        .attr("text-anchor", "left")
        .attr("dominant-baseline", "middle")
        .attr("transform", (_, i) => `translate(${margin.top / 4}, ${margin.top / 5 / 4})`)
        .text(d => categoryMap[d]);
};

const renderVisualization = () => {
    setupVisualization();
};

const resizeAndRender = () => {
    d3.selectAll("svg > *").remove();

    d3.selectAll("#visualization")
        .attr("height", "60vh")
        .attr("width", "100%");

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("visualization").clientHeight });
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/recovery.json'), d3.json('data/annotations.json')]).then(([_recovery, _annotations]) => {
    recovery = _recovery;
    annotations = _annotations;

    recovery.ordering = recovery.ordering.map((column, i) => {
        return column.map(cell => {
            return { "category": cell, "era": i };
        });
    });

    resizeAndRender();
});