let svgWidth = 1000;
svgHeight = 700;

let margin = {
    top:50,
    right: 50,
    bottom: 100,
    left: 70
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper that holds chart and shifts by the defined margins
let svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Append SVG group
let chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

// Initial axis params
let chosenXAxis = 'income';
let chosenYAxis = 'obesity';

// Update x scale on click
function xScale(healthData, chosenXAxis) {

    let xLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d[chosenXAxis]))
        .range([0, width]);
        
    return xLinearScale;
};

// Update y scale on click
function yScale(healthData, chosenYAxis) {

    let yLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d[chosenYAxis]))
        .range([height, 0]);
    
    return yLinearScale;
};

//Update x axis on axis label click
function renderXAxis(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

//Update y axis on axis label click
function renderYAxis(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};

// Update circle location
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[chosenXAxis]))
        .attr('cy', d => newYScale(d[chosenYAxis]) - 5);
        

    return circlesGroup;

    //Possibly add if statment so it doesn't attempt to update both
};
// Update state label location
function renderStates(statesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    statesGroup.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]));
        

    return statesGroup
};

// Update tooltip with new axis data
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, statesGroup) {
    // Alias axis labels for code readability
    let xLabel = chosenXAxis;
    let yLabel = chosenYAxis;

    // Define tooltip
    let toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([50, -70])
        .html(function(d) {
            return (`${d.state}
                <br>
                ${xLabel}: ${d[xLabel]}
                <br>
                ${yLabel}: ${d[yLabel]}`);
        });
        
        circlesGroup.call(toolTip);
        statesGroup.call(toolTip);
        

    // Show and hide tooltip on mouse events
    circlesGroup
        .on('mouseover', function(d) {
            toolTip.show(d, this);
        })
        .on('mouseout', function(d) {
            toolTip.hide(d, this);
        });
    
    statesGroup
        .on('mouseover', function(d) {
            toolTip.show(d, this);
        })
        .on('mouseout', function(d) {
            toolTip.hide(d, this);
        });
    
    return circlesGroup;
    
    
};

// Retrieve data and execute
d3.csv('assets/data/data.csv').then(function(healthData) {
    
    //console.log(err)
    
    // Convert data to floats
    healthData.forEach(element => {
        // X
        element.income = +element.income;
        element.age = +element.age;
        // Y
        element.smokes = +element.smokes;
        element.obesity = +element.obesity;

    });
    console.log(healthData);

    // linear scale functions
    let xLinearScale = xScale(healthData, chosenXAxis);
    let yLinearScale = yScale(healthData, chosenYAxis);

    // Initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append axes
    let xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    let yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    // Append initial data
    let dataPoint = chartGroup.selectAll('circle')
        .data(healthData)
        .enter()
        .append('g');

    let circlesGroup = dataPoint.append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 20)
        .attr('class', 'stateCircle');
    
    // Append state abbreviations to circles
    let statesGroup = dataPoint.append('text')
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]) + 5)
        .text(d => d.abbr)
        .attr('class', 'stateText');

    // Create group for x axis labels
    let labelsXGroup = chartGroup.append('g')
        .attr('transform', `translate(${width /2}, ${height + 20})`);

    let incomeXLabel = labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'income')
        .classed('active', true)
        .text('Income ($)');

    let ageXLabel = labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'age')
        .classed('inactive', true)
        .text('Age (years)');

    // Create group for y axis labels
    let labelsYGroup = chartGroup.append('g')
        .attr('transform', 'rotate(-90)');

    let obesityYLabel = labelsYGroup.append('text')
        .attr('y', 20 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .classed('active', true)
        .attr('value', 'obesity')
        .text('% Obese');

    let smokesYLabel = labelsYGroup.append('text')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .classed('inactive', true)
        .attr('value', 'smokes')
        .text('% Smokes');

    // Update tooltip
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, statesGroup);
    
    // X axis labels event listener
    labelsXGroup.selectAll('text')
        .on('click', function() {
            // Get selection value
            let value = d3.select(this).attr('value');
            
            if (value !== chosenXAxis) {
                // Replace x axis value
                chosenXAxis = value;
                
                // Update x axis scale
                xLinearScale = xScale(healthData, chosenXAxis);

                // Update data point values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update data point labels
                statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // Update x axis with transitions
                xAxis = renderXAxis(xLinearScale, xAxis);

                // Update tooltip info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, statesGroup);

                // Change text highlighting to reflect selected data
                if (chosenXAxis === 'income') {
                    ageXLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeXLabel
                        .classed('active', true)
                        .classed('inactive', false);
                } else {
                    ageXLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeXLabel
                        .classed('active', false)
                        .classed('inactive', true);
                };
            };
        });
        
    labelsYGroup.selectAll('text')
        .on('click', function() {
            // Get selection value
            let value = d3.select(this).attr('value');
            
            if (value !== chosenYAxis) {
                // Replace y axis value
                chosenYAxis = value;
                
                // Update y axis scale
                yLinearScale = yScale(healthData, chosenYAxis);

                // Update data point values
                circlesGroup = renderCircles(circlesGroup, 
                    xLinearScale, chosenXAxis, 
                    yLinearScale, chosenYAxis);

                // Update data point labels
                statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // Update y axis with transitions
                yAxis = renderYAxis(yLinearScale, yAxis);

                // Update tooltip info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, statesGroup);

                // Change text highlighting to reflect selected data
                if (chosenYAxis === 'obesity') {
                    obesityYLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    smokesYLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else {
                    obesityYLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesYLabel
                        .classed('active', true)
                        .classed('inactive', false);  
                };
            };
        });      
});