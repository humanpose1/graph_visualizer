function autocomplete(parent) {
  var _nodes=null,
      _delay=0,
      _selection,
      _margin = {top: 5, right: 0, bottom: 20, left:0},
      _matches,
      _searchTerm,
      _lastSearchTerm,
      _currentIndex,
      _keys,
      _minLength=1,
      _dataField = "id";

  _selection = d3.select(parent);

  function search() {
    var str=_searchTerm;
    console.log("searching on " + _searchTerm);
    console.log("-------------------");

    if (str.length >= _minLength) {
      _matches = [];
      for (var i = 0; i < _keys.length; i++) {
        var match = false;
        match = match || (_keys[i][_dataField].toLowerCase().indexOf(str.toLowerCase()) >= 0);
        if (match) {
          _matches.push(_keys[i]);
          //console.log("matches " + _keys[i][_dataField]);
        }
      }
    }
  }
  function processResults() {

    var results = dropDown.selectAll('.bp-autocomplete-row').data(_matches, function(d){
      return d[_dataField];
    });
    results.enter()
	   .append("div")
	   .attr('class', 'bp-autocomplete-row')
	   .on('click', function(d, i) {row_onClick(d);})
	   .append('div').attr('class', 'bp-autocomplete-title')
	   .html(function(d) {
	     var re = new RegExp(_searchTerm, 'i');
	     var strPart = d[_dataField].match(re)[0];
	     return d[_dataField].replace(re, "<span class='bp-autocomplete-highlight'>"+strPart+"</span>");
	   });
  }
  function row_onClick() {
    hideDropDown();
    input.node().value = d[_dataField];
  }
}
