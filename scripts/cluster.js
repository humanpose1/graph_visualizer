function BFS(graph, node, linkedById) {
  var results = [node];
  var fil = [node];
  var visited = {};
  visited[node.id] = true;
  while(fil.length > 0) {
    graph.nodes.forEach(function(n){
      if((linkedById[n.id + "," +fil[0].id]) && !visited[n.id]){
	visited[n.id] = true;
	fil.push(n);
	results.push(n);
      }
    });
    fil.shift();
  }
  return results;
}

function sortObj(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}

function findCluster(graph) {
  // function to find the cluster
  var linkedById = {};
  graph.links.forEach(function(d) {
    linkedById[d.source.id + ',' + d.target.id] = 1;
    linkedById[d.target.id + ',' + d.source.id] = 1;
  });
  var visited = {};
  graph.nodes.forEach(function(d){
    visited[d.id] = false;
  });
  var numCluster = 0;
  var clusters = {};
  for (var i=0; i < graph.nodes.length; i++) {
    if (!visited[graph.nodes[i].id]) {
      visited[graph.nodes[i].id] = true;
      var nameCluster = String(numCluster).padStart(4, '0');
      listCluster = BFS(graph, graph.nodes[i], linkedById);
      listCluster.forEach(function(d){
	visited[d.id] = true;
	clusters[d.id] = numCluster;
      });
      numCluster++;
    }
  }
  console.log(clusters);

  clusters = sortObj(clusters);
  return clusters;
}

function exportToCSV(clusters) {

  // column 0 : name of the coin
  // column 1 : name of cluster
  csv = 'name, die\n';
  for (let key in clusters) {
    csv += key + ','+ clusters[key] +'\n';
  }
  return csv;
}


function exportCSVFile(clusters, fileTitle) {

  csv = exportToCSV(clusters);
  var exportedFilename = fileTitle + '.csv' || 'cluster.csv';

  var blob = new Blob([csv],  { type: 'text/csv;charset=utf-8;' });
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


function downloadCluster() {
  clusters = findCluster(currentData);
  exportCSVFile(clusters, "cluster");
}
