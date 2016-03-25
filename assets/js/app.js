// Set selection parameter to empty, this is where selected nodes / links are kept
var selection = null;

function myGraph(el) {

  // Set action parameter to explore, this variable determines the event actions
  this.action = "explore";

  // Add and remove elements on the graph object
  this.addNode = function (d) {
      // set defaults
      var i = d.id,
          f = d.fixed ? d.fixed : false,
          x = d.x,
          y = d.y;
      // prevent duplicates
      if (findNode(i)) {
        return;
      }
      else{
        nodes.push({"id":d.id, "fixed":f, "x":x, "y":y});
        update();}
  };
  this.removeNode = function (id) {
      var i = 0;
      var n = findNode(id);
      while (i < links.length) {
          if ((links[i].source === n)||(links[i].target == n)) links.splice(i,1);
          else i++;
      }
      var index = findNodeIndex(id);
      if(index !== undefined) {
          nodes.splice(index, 1);
          update();
      }
  };
  this.addLink = function (sourceId, targetId) {
      var sourceNode = findNode(sourceId);
      var targetNode = findNode(targetId);
      if((sourceNode !== undefined) && (targetNode !== undefined)) {
          links.push({"source": sourceNode, "target": targetNode});
          update();
      }
  };
  var findNode = function (id) {
      for (var i=0; i < nodes.length; i++) {
          if (nodes[i].id === id)
              return nodes[i];
      }
  };
  var findNodeIndex = function (id) {
      for (var i=0; i < nodes.length; i++) {
          if (nodes[i].id === id)
              return i;
      }
  };


  // set up the D3 visualisation in the specified element
  var w = 960, //$(el).innerWidth(),
      h = 500; //$(el).innerHeight();
  var force = d3.layout.force()
      .charge(-500)
      .linkDistance(100)
      .size([w, h]);
  var zoom = d3.behavior.zoom()
      .scaleExtent([0.5, 10])
      .on("zoom", zoomed);
  var drag = force.drag()
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);
  var svg = this.svg = d3.select(el).append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .call(zoom);
  var rect = svg.append("rect")
      .attr("width", w)
      .attr("height", h)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("click", (function(d) {
          /* SELECTION */
          selection = null;
          d3.selectAll(".node").classed("selected", false);
          return d3.selectAll(".link").classed("selected", false);
        })
      );
  // container group for zooming and panning
  var container = svg.append("g");
  // link and node groups for correct ordering (nodes above links)
  var linkGroup = container.append("g")
      .attr("class", "links");
  var nodeGroup = container.append("g")
      .attr("class", "nodes");
  var nodes = force.nodes(),
      links = force.links();
  // for debugging:
  this.nodes = nodes;
  this.links = links;
  var update = function () {
      var link = linkGroup.selectAll("line.link")
          .data(links, function(d) { return d.source.id + "-" + d.target.id; });
      link.enter().insert("line")
          .attr("class", "link")
          .on("click", (function(d) {
              /* SELECTION */
              selection = d;
              d3.selectAll(".link").classed("selected", function(d2) {
                  return d2 === d;
              });
              return d3.selectAll(".node").classed("selected", false);
            })
          );
      link.exit().remove();

      var node = nodeGroup.selectAll("g.node")
          .data(nodes, function(d) { return d.id;});
      var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("class", function(d) {
              var c = "node";
              if(d.fixed) c += " fixed";
              return c;
            })
          .on("dblclick", function() { d3.event.stopPropagation(); })
          .on("dblclick.unfix", dblclick)
          .on("mousedown", function() { d3.event.stopPropagation(); })
          .on("click", (function(d) {
              /* SELECTION */
              selection = d;
              d3.selectAll(".node").classed("selected", function(d2) {
                  return d2 === d;
              });
              return d3.selectAll(".link").classed("selected", false); }))
          .call(force.drag);
      // add rectangles
      nodeEnter.append("rect")
          .attr("width", 60)
          .attr("height", 40)
          .attr("x", -30)
          .attr("y", -20)
          .attr("rx", 5)
          .attr("ry", 5);
      // add the text 
      nodeEnter.append("text")
          .attr("x", -25)
          .attr("y", -10)
          .text(function(d) { return d.id; });
      node.exit().remove();
      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
      // Restart the force layout.
      force.start();
  };
  function zoomed() {
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
    force.start();
  }
  function dragstarted(d) {
  }
  function dragged(d,i) {
    var grid = 50;
    var nx = Math.round(d3.event.x/grid)*grid;
    var ny = Math.round(d3.event.y/grid)*grid;
    d.px = nx;
    d.py = ny;
    d3.select(this).classed("fixed", d.fixed = true);
  }
  function dragended(d) {
  }
  // Make it all go
  update();
}

graph = new myGraph("#graph");
d3.json("graph.json", function(error, data) {
  if (error) throw error;
  data.nodes
    .forEach(function(d){
      graph.addNode(d);
    });
  data.links
    .forEach(function(d){
      graph.addLink(d.source, d.target);
    });
});

// Interactions 
(function() {
  // Bind addNode to button
  d3.select("#buttonAdd")
      .on("click", (function(d) {
        var id = prompt("Enter ID:");
        if (id) graph.addNode({"id": id});
      }));

  // Delete node on del key stroke
  // TODO add link delete action
  d3.select(window).on('keydown', function() {
      if (d3.event.keyCode === 46) {
        console.log(selection);
          if (selection !== null) {
              graph.removeNode(selection.id);
              selection = null;
          }
      }
  });
})();