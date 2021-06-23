// set the dimensions and margins of the graph

// append the svg object to the body of the page
// Call zoom for svg container
// svg.call(d3.zoom().on('zoom', zoomed));
// svg objects
// load the data
//////////// FORCE SIMULATION ////////////

// force simulator





// values for all forces



// update the display positions after each simulation tick
var node;
var link;
var container;
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Call zoom for svg container.
svg.call(d3.zoom().on('zoom', zoomed));
var simulation;
var data;
var currentData;
var toggle = 0;

// init variable
// read json in the call back draw
// draw: 1) create svg 2) create graph 3) create simulation

function draw(data, sizeVar, forceProperties) {

  // createSVG(sizeVar.width, sizeVar.height);
  createGraph(data);
  createSimulation(data, forceProperties, sizeVar.width, sizeVar.height);
}





function createGraph(graph) {

  var linkedByIndex = {};
  graph.links.forEach(function(d) {
    linkedByIndex[d.source + ',' + d.target] = 1;
    linkedByIndex[d.target + ',' + d.source] = 1;
  });

  // A function to test if two nodes are neighboring.
  function neighboring(a, b) {
    return linkedByIndex[a.id + ',' + b.id];
  }
  container =
    svg.append("g");
  link = container.append("g")
		  .attr("class", "links")
		  .selectAll("line")
		  .data(graph.links)
		  .enter().append("line");

  // set the data and properties of node circles
  node = container.append("g")
		  .attr("class", "nodes")
		  .selectAll("circle")
		  .data(graph.nodes)
		  .enter().append("circle")
		  .on('click', function(d, i) {
		    if (toggle == 0) {
		      // Ternary operator restyles links and nodes if they are adjacent.
		      d3.selectAll('line').style('stroke-opacity', function (l) {
			return l.target == d || l.source == d ? 1 : 0.1;
		      }).style('stroke', function (l) {
			return l.target == d || l.source == d ? "#f00" : "#000";});
		      d3.selectAll('circle').style('opacity', function (n) {
			return neighboring(d, n) ? 1 : 0.1;
		      });
		      d3.select(this).style('opacity', 1).style("stroke", "#fff");
		      toggle = 1;
		    }
		    else {
		      // Restore nodes and links to normal opacity.
		      d3.selectAll('line').style('stroke-opacity', '0.6').style('stroke', "#999");
		      d3.selectAll('circle').style('opacity', '1').style("stroke", "#315");
		      toggle = 0;
		    }
		  })
		  .call(
		    d3.drag()
		      .on("start", dragstarted)
		      .on("drag", dragged)
		      .on("end", dragended));

  // node tooltip
  node.append("title")
      .text(function(d) { return d.id; });

  updateDisplay();
}
function removeGraph() {
  container.remove();
  link.remove();
  node.remove();
}


function createSimulation(data, forceProperties, width, height) {
  simulation = d3.forceSimulation();
  simulation.nodes(data.nodes);
  initializeForces(data, forceProperties, width, height);
  simulation.on(
    "tick",
    function(){
      link
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

      node
	.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; });
      d3.select('#alpha_value').style('flex-basis', (simulation.alpha()*100) + '%');
    }
  );

}
// update size-related forces

function initializeForces(data, forceProperties, width, height){
  simulation
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide())
    .force("center", d3.forceCenter())
    .force("forceX", d3.forceX())
    .force("forceY", d3.forceY());

  updateForces(data, forceProperties, width, height);

}

function updateForces(data, forceProperties, width, height) {
  var fp = forceProperties;
  simulation.force("center")
	    .x(width * fp.center.x)
	    .y(height * fp.center.y);
  simulation.force("charge")
	    .strength(fp.charge.strength * fp.charge.enabled)
	    .distanceMin(fp.charge.distanceMin)
	    .distanceMax(fp.charge.distanceMax);

  simulation.force("collide")
	    .strength(fp.collide.strength * fp.collide.enabled)
	    .radius(fp.collide.radius)
	    .iterations(fp.collide.iterations);
  simulation.force("forceX")
	    .strength(fp.forceX.strength * fp.forceX.enabled)
	    .x(width * fp.forceX.x);
  simulation.force("forceY")
	    .strength(fp.forceY.strength * fp.forceY.enabled)
	    .y(height * fp.forceY.y);
  simulation.force("link")
            .id(function(d) {return d.id;})
            .distance(fp.link.distance)
            .iterations(fp.link.iterations)
            .links(fp.link.enabled ? data.links : []);

  // updates ignored until this is run
  // restarts the simulation (important if simulation has already slowed down)
  simulation.alpha(1).restart();

}


function updateDisplay() {
  node
    .attr("r", forceProperties.collide.radius)
    .attr("stroke", forceProperties.charge.strength > 0 ? "blue" : "red")
    .attr("stroke-width", forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15);

  link
    .attr("stroke-width", forceProperties.link.enabled ? 1 : .5)
    .attr("opacity", forceProperties.link.enabled ? 1 : 0);
}



function searchNodes() {
  var term = document.getElementById('searchTerm').value;
  var selected = container.selectAll('circle').filter(function (d, i) {
    return d.id.toLowerCase().search(term.toLowerCase()) == -1;
  });
  selected.style('opacity', '0');

  link.style('stroke-opacity', '0');
  d3.selectAll('circle').transition()
    .duration(5000)
    .style('opacity', '1').style("stroke", "#315");
  d3.selectAll('line').transition().duration(5000).style('stroke-opacity', '0.6').style('stroke', "#999");
  toggle = 0;
}



//////////// UI EVENTS ////////////

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0.0001);
  d.fx = null;
  d.fy = null;
}

function zoomed() {
  container.attr("transform", "translate(" + d3.event.transform.x + ", " + d3.event.transform.y + ") scale(" + d3.event.transform.k + ")");
}

// convenience function to update everything (run after UI input)
function updateAll(forceProperies, sizeVar, thresh) {
  currentData = filterGraph(data, thresh);
  console.log(currentData);
  removeGraph();
  draw(currentData, sizeVar, forceProperties);
}


function filterGraph(data, thresh=0.5) {
  let copy = Object.assign({}, data);
  copy.links = [];
  for (let i = 0; i < data.links.length; i++) {
    if (data.links[i].weight > thresh) {
      copy.links.push(data.links[i]);
    }
  }
  return copy;
}
