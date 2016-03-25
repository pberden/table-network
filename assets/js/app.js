//////////////// GraphView ////////////////
// set up the D3 visualisation in the specified element
function GraphView(el) {
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

  var svg = d3.select(el).append("svg:svg")
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

  // enter, update, exit
  this.update = function () {

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
      }));

      link.exit().remove();

      var node = nodeGroup.selectAll("g.node")
          .data(nodes, function(d) { return d.id;});

      var nodeEnter = node.enter().append("g")
          .attr("class", "node")
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
    // console.log("dragstarted");
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
    // console.log("dragended");
  }

  // Make it all go
  this.update();
  // return {"nodes": nodes, "links": links};
}


//////////////// GraphModel ////////////////
// add, delete nodes and links
function GraphModel (d) {
  var nodes = d.nodes,
      links = d.links;

  // Set selection parameter to empty, this is where selected nodes / links are kept
  var selection = null;

  // Add and remove elements on the graph object
  this.addNode = function (d) {
      nodes.push({"id":d.id, "fixed":d.fixed, "px":d.x, "py":d.y});
      graph.update();
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
          graph.update();
      }
  };

  this.addLink = function (sourceId, targetId) {
      var sourceNode = findNode(sourceId);
      var targetNode = findNode(targetId);

      //Avoid nodes to self
      if (sourceNode === targetNode) return null;
      // avoid link duplicates
      if (findLink(sourceId, targetId)) return null;
      // when nodes exist add link
      if((sourceNode !== undefined) && (targetNode !== undefined)) {
          links.push({"source": sourceNode, "target": targetNode});
          graph.update();
      }
  };

  this.removeLink = function (sourceId, targetId) {
        var i = findLink(sourceId, targetId);
        if(i) links.splice(i,1);
        graph.update();
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

  var findLink = function(sourceId, targetId) {
      var sourceNode = findNode(sourceId);
      var targetNode = findNode(targetId);

      var i = 0;
      while (i < links.length) {
          if ((links[i].source === sourceNode)&&(links[i].target == targetNode)) return i; //links[i];
          if ((links[i].target === sourceNode)&&(links[i].source == targetNode)) return i; //links[i];
          else i++;
      }
  };

}

// Buttons for interacting with the rest of the page
function Interaction() {
  d3.select("#buttonAdd")
    .on("click", function(d){
      var id = prompt("Enter ID:");
      graph.addNode({"id": id, "px": w/2, "py": h/2});        
    });
}

// html form for displaying / editing node and link data
function DetailView() {
  //
}

graph = new GraphView("#graph");
model = new GraphModel(graph);

d3.json("graph.json", function(error, data) {
  if (error) throw error;
  data.nodes
    .forEach(function(d){
      model.addNode(d);
    });
  data.links
    .forEach(function(d){
      model.addLink(d.source, d.target);
    });
});

