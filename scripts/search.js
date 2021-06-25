var search = d3.select("body").append('center').append('form').attr('onsubmit', 'return false;');
var box = search.append('input')
		.attr('type', 'text')
		.attr('id', 'searchTerm')
		.attr('placeholder', 'Type to search...');

var button = search.append('input').attr('type', 'button').attr('value', 'Search')
		   .attr('class', 'btn')
		   .on('click', function () { searchNodes(); });

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
