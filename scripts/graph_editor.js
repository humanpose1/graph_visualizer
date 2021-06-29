
var activatedCut = false;

function changeCut() {
  if(toggle == 1) {
    activatedCut = !activatedCut;
    if(activatedCut){
      document.body.style.cursor = "crosshair";
    }
    else{
      document.body.style.cursor = "default";
    }
  }
  else {
    activatedCut = false;
    document.body.style.cursor = "default";
  }
}



function openForm(){
  d3.select('#popupForm').transition().duration(1000).style('display', 'block');
}

function closeForm(){
  d3.select('#popupForm').style('display', 'none');
}


function createLink(source, target, weight) {
  //removePopup();
  var link = {'source':source, 'target':target, weight: weight};
  console.log(currentData.links[0]);
  console.log(link);
  closeForm();
  newLink.push(link);
  updateAll(forceProperties, sizeVar, thresh);
}

function removePopup() {
  d3.select('#popupForm').remove();
}

function createPopUpLink() {


  console.log("CreatePopupLink");

  var popup = d3.select("body")
		.append('div')
		.attr('id', 'popupForm')
		.attr('class', 'formPopup')
		.style('display', 'none');

  popup.append('p').text('source:');
  var sourcePop = popup.append('input')
		       .attr('type', 'text')
		       .attr('id', 'sourcePopup');
  popup.append('p').text('target:');
  var targetPop = popup.append('input')
		       .attr('type', 'text')
		       .attr('id', 'targetPopup');
  popup.append('p').text('weight:');
  var weightPopOutput = popup.append('output')
			     .attr('id', 'WeightSliderOutput')
			     .text("0.99");

  var weightPop = popup.append('input')
		       .attr('type', 'range')
		       .attr('min', '0')
		       .attr('max', '1')
		       .attr('value', '0.99')
		       .attr('step', '0.01')
		       .on('input', function(){
			 d3.select('#WeightSliderOutput').text(+this.value);
		       });
  var submit = popup.append('center')
		    .append('input')
		    .attr('type', 'button')
		    .attr('class', 'btn')
		    .attr('value', 'Submit')
		    .on('click',
			function () {
			  var sourceVal= sourcePop.node().value;
			  var targetVal = targetPop.node().value;
			  var w = parseFloat(weightPop.node().value);
			  var sourceNode = currentData.nodes.filter(function(x){
			    return sourceVal == x.id;
			  });
			  var targetNode = currentData.nodes.filter(function(x){
			    return targetVal == x.id;
			  });
			  if (sourceNode.length != 1){
			    sourcePop
			      .style('border', '1.5px solid #ff3355');
			  }
			  if (targetNode.length != 1){
			    targetPop.style('border', '1.5px solid #ff3355');
			  }
			  if(sourceNode.length == 1 && targetNode.length == 1) {
			    createLink(sourceNode[0], targetNode[0], w);
			  }
			}
		    );

  popup.append('center')
       .append('input')
       .attr('type', 'button')
       .attr('class', 'btn')
       .attr('value', 'Cancel')
       .style('background', '#e33')
       .on('click', closeForm);
}


function exportJSONFile(dat, fileTitle) {
  jsonStr = JSON.stringify(dat);
  var exportedFilename = fileTitle + '.json' || 'new_graph.json';
  var blob = new Blob([jsonStr],  { type: 'data:application/json;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {

    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}


function downloadGraph() {
  console.log(data);
  downData = filterGraphByCut(data);
  downData.links = downData.links.concat(newLink);
  var links = [];
  downData.links.forEach(function(d){
    let new_D;
    if(d.source.id !== undefined && d.target.id !== undefined){
      new_D = {"source": d.source.id, "target": d.target.id, "weight": d.weight};
    }
    else {
      new_D = {"source": d.source, "target": d.target, "weight": d.weight};
    }
    links.push(new_D);
  });
  downData.links = links;
  exportJSONFile(downData, "new_graph");
}
