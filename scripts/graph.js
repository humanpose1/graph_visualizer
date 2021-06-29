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
var svg = d3.select("#graphsvg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Call zoom for svg container.
svg.call(d3.zoom().on('zoom', zoomed));
var simulation;
var data;
var tableCut = {}; // a dictionnary to know if we keep a link or not
var newLink = []; // an array to store the new links added by the user

var currentData;

var toggle = 0;

var linkedByIndex = {};
var redLink = {};
function initLinkedByIndex(){
  linkedByIndex = {};
  console.log(data);
  currentData.links.forEach(function(d) {

    linkedByIndex[d.source.id + ',' + d.target.id] = 1;
    linkedByIndex[d.target.id + ',' + d.source.id] = 1;
  });
}


// init variable
// read json in the call back draw
// draw: 1) create svg 2) create graph 3) create simulation

function loadGraph(path, initialize=true) {
  d3.json(path, function(error, _graph) {
    if (error) throw error;
    data = _graph;
    if(initialize){
      tableCut = {};
      linkedByIndex = {};
      redLink = {};
      newLink = [];
    }
    currentData = filterGraphByWeight(_graph, thresh);
    currentData = filterGraphByCut(currentData);
    currentData.links = currentData.links.concat(newLink);
    draw(sizeVar, forceProperties);
  });
}

function draw(sizeVar, forceProperties) {
  // createSVG(sizeVar.width, sizeVar.height);
  // console.log(tableCut);
  createGraph();
  createSimulation(forceProperties, sizeVar.width, sizeVar.height);
}





function createGraph() {
  // A function to test if two nodes are neighboring.
  function neighboring(a, b) {
    return linkedByIndex[a + ',' + b];
  }
  container =
    svg.append("g");
  link = container.append("g")
		  .attr("class", "links")
		  .selectAll("line")
		  .data(currentData.links)
		  .enter().append("line").on('click', function(d, i) {
		    if(toggle == 1 && redLink[d.source.id +","+d.target.id] && activatedCut) {

		      tableCut[d.source.id +","+d.target.id] = 1;
		      tableCut[d.target.id +","+d.source.id] = 1;
		      currentData = filterGraphByCut(currentData);
		      d3.select(this).remove();
		      initLinkedByIndex();

		    }
		  }
		  );

  // set the data and properties of node circles
  node = container.append("g")
		  .attr("class", "nodes")
		  .selectAll("circle")
		  .data(currentData.nodes)
		  .enter().append("circle")
		  .on('click', function(d, i) {

		    if (toggle == 0) {
		      // Ternary operator restyles links and nodes if they are adjacent.
		      d3.selectAll('line').style('stroke-opacity', function (l) {
			return l.target == d || l.source == d ? 1 : 0.1;
		      }).style('stroke', function (l) {
			return l.target == d || l.source == d ? "#f00" : "#000";})
			.style('stroke-width', function (l) {
			  return l.target == d || l.source == d ? "3.0px" : "1.5px";});
		      d3.selectAll('circle').style('opacity', function (n) {
			return neighboring(d.id, n.id) ? 1 : 0.1;
		      });
		      d3.select(this).style('opacity', 1).style("stroke", "#fff");
		      toggle = 1;
		      d3.select('#text').append('div').attr("id", "textNode").append("p").text("\n Selected Node: " + d.id+"\n");

		      var txt = "Neighbors:\n";
		      currentData.nodes.forEach(function(n){
			if(neighboring(n.id, d.id)){
			  redLink[d.id + "," + n.id] = 1;
			  redLink[n.id + "," + d.id] = 1;
			  txt += (n.id +",");
			}
		      });
		      d3.select("#textNode").append("p").text(txt);


		      console.log(linkedByIndex);
		      console.log(redLink);
		    }
		    else {
		      // Restore nodes and links to normal opacity.
		      d3.selectAll('line')
			.style('stroke-opacity', '0.6')
			.style('stroke', "#999")
			.style('stroke-width', "1.5px");
		      d3.selectAll('circle').style('opacity', '1').style("stroke", "#315");
		      toggle = 0;
		      changeCut();
		      redLink = {};
		      d3.select("#textNode").remove();
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
  toggle = 0;
  changeCut();
  redLink = {};
  d3.select("#textNode").remove();
}


function createSimulation(forceProperties, width, height) {
  simulation = d3.forceSimulation();
  simulation.nodes(currentData.nodes);
  initializeForces(forceProperties, width, height);
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
  initLinkedByIndex();
}
// update size-related forces

function initializeForces(forceProperties, width, height){
  simulation
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide())
    .force("center", d3.forceCenter())
    .force("forceX", d3.forceX())
    .force("forceY", d3.forceY());

  updateForces(forceProperties, width, height);

}

function updateForces(forceProperties, width, height) {
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
            .links(fp.link.enabled ? currentData.links : []);

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
  currentData = filterGraphByWeight(data, thresh);
  currentData = filterGraphByCut(currentData);
  currentData.links = currentData.links.concat(newLink);
  // console.log(currentData);
  removeGraph();
  draw(sizeVar, forceProperties);
}


function filterGraphByWeight(dat, thresh=0.5) {
  let copy = Object.assign({}, dat);
  copy.links = [];
  // for (let i = 0; i < data.links.length; i++) {
  //  if (data.links[i].weight > thresh) {
  //    copy.links.push(data.links[i]);
  //  }
  // }
  dat.links.forEach(function(d) {
    if ((d.weight > thresh)) {
      copy.links.push(d);
    }
  });

  return copy;
}


function filterGraphByCut(dat) {
  let copy = Object.assign({}, dat);
  copy.links = [];

  dat.links.forEach(function(d) {
    if (!tableCut[d.source.id + "," + d.target.id] && !tableCut[d.target.id + "," + d.source.id]) {
      copy.links.push(d);
    }
  });
  return copy;
}



// GRAPH EDITOR
