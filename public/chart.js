const socket = io();
const domain = [];

const diameter = 1000,
    format = d3.format(",d");
color = d3.scaleOrdinal(d3.schemeCategory20c);

const margin = {
    top: 140,
    right: 30,
    bottom: 120,
    left: 30
};

const width = Math.max(Math.min(window.innerWidth, diameter), 500) - margin.left - margin.right - 20;
const height = window.innerHeight - margin.top - margin.bottom - 20;

const bubble = d3.pack()
    .size([width, height])
    .padding(5);

const svg = d3.select("#chart").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

const defs = svg.append("defs");


///////////////////////////////////////////////////////////////////////////
//////////// Get continuous color scale for the Rainbow ///////////////////
///////////////////////////////////////////////////////////////////////////

const colorsRainbow = ["#2c7bb6", "#00a6ca", "#00ccbc", "#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];
const colorRangeRainbow = d3.range(0, 1, 1.0 / (colorsRainbow.length - 1));
colorRangeRainbow.push(1);

//Create color gradient
const colorScaleRainbow = d3.scaleLinear()
    .domain(colorRangeRainbow)
    .range(colorsRainbow)
    .interpolate(d3.interpolateHcl);

// Needed to map the values of the dataSet to the color scale
const colorInterpolateRainbow = d3.scaleLinear()
    .domain([1,200])
    .range([0, 1]);
///////////////////////////////////////////////////////////////////////////
//////////////////// Create the Rainbow color gradient ////////////////////
///////////////////////////////////////////////////////////////////////////

//Calculate the gradient
defs.append("linearGradient")
    .attr("id", "gradient-rainbow-colors")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop")
    .data(colorsRainbow)
    .enter().append("stop")
    .attr("offset", function(d, i) {
        return i / (colorsRainbow.length - 1);
    })
    .attr("stop-color", function(d) {
        return d;
    });

function processData(root) {
    const classes = [];

    function recurse(name, node) {
        if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
        else classes.push({ packageName: node.name, className: node.name, value: node.size });
    }
    recurse(null, root);
    return { children: classes };
}

function drawBubbles(d) {
    const duration = 600;
    const delay = 0;

    const root = d3.hierarchy(processData(d))
        .sum(function(d) {
            return d.value;
        })
        .sort(function(a, b) {
            return b.value - a.value;
        });

    bubble(root);
    const node = svg.selectAll(".node")
        .data(root.children);

    node.transition()
        .attr("class", "node")
        .duration(duration)
        //.delay(function(d, i) { delay = i * 7;
        //    return delay; })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .style('opacity', 1);

    const nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    nodeEnter.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d) {
            return colorScaleRainbow(colorInterpolateRainbow(d.value));
        });
    nodeEnter.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.className.substring(0, d.r / 3);
        });
    nodeEnter.append("title")
        .text(function(d) {
            return d.data.className + ": " + format(d.value);
        });

    node.select("circle")
        .transition()
        .duration(duration * 1.2)
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d) {
            return colorScaleRainbow(colorInterpolateRainbow(d.value));
        });

    node.select("text")
        .transition()
        .duration(duration * 1.2)
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.className.substring(0, d.r / 3);
        });
    node.select("title")
        .transition()
        .duration(duration * 1.2)
        .text(function(d) {
            return d.data.className + ": " + format(d.value);
        });

    node.exit().remove();
}

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the legend ////////////////////////////////
///////////////////////////////////////////////////////////////////////////


const legendWidth = width * 0.6,
    legendHeight = 10;

//Color Legend container
const legendsvg = svg.append("g")
    .attr("class", "legendWrapper")
    .attr("transform", "translate(" + (width / 2 - 10) + "," + Math.min(diameter + 50, height + 50) + ")");

//Draw the Rectangle
legendsvg.append("rect")
    .attr("class", "legendRect")
    .attr("x", -legendWidth / 2)
    .attr("y", 10)
    //.attr("rx", legendHeight/2)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "none");

//Append title
legendsvg.append("text")
    .attr("class", "legendTitle")
    .attr("x", 0)
    .attr("y", -2)
    .text("Index");

svg.select(".legendRect")
    .style("fill", "url(#gradient-rainbow-colors)");

function getData() {
    socket.on('message', function(data) {
        const d = JSON.parse(data);
        console.log(d);
        drawBubbles(d);
    });

}

getData();
