var w_w2 = d3.select(".widget_2").style('width').slice(0, -2);
var h_w2 = d3.select(".widget_2").style('height').slice(0, -2);
var padding = 30;
var svg_w2 = d3.select(".widget_2")
var x_w2 = d3.scaleLinear().domain([0, 10]).range([padding, w_w2-padding]);
var y_w2 = d3.scaleLinear().domain([0, 10]).range([h_w2-padding, padding]);

//var svg_w2 = d3.select(".widget_2").append("rect").attr("width",w_w2).attr("height",h_w2).attr("fill", "black");

var xAxis = d3.axisBottom().scale(x_w2).ticks(4);//.tickValues([0,2,4,6,8,10]);tickSize(padding + padding - h_w2).
var yAxis = d3.axisLeft().scale(y_w2).tickSize(padding + padding - w_w2).ticks(4).tickSizeOuter([0]);//.tickValues([0,2,4,6,8,10]);

svg_w2.append("g")
        .attr("class", "axis")
        .call(xAxis)
        .attr("transform", "translate(0," + (h_w2 - padding) + ")");

//Create Y axis
g_yAxis = svg_w2.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + padding + ",0)")
	.call(yAxis);

// Remove last tick line
g_yAxis.selectAll(".tick:last-of-type").remove();//.attr("stroke-width", 0);//.select(".line").remove();//.attr("visibility","hidden");


//d3.select(g_yAxis.selectAll("g.tick")[0][0]).attr("visibility","hidden");

// g_yAxis.selectAll("g.tick").each(function(data) {
// 	if
//   var tick = d3.select(this);
//
//   // passed in "data" is the value of the tick, transform[0] holds the X value
//   console.log("each tick", data, tick);
// });


// data is created inside the function so it is always unique
function repeat () {
  //var data_y = d3.range(10).map(function(){return Math.random()*10})
	//var data_y = svg_w1.attr('data');

	//map previously drawn waveform to a domain between 0 and 10
	var scaleY = d3.scaleLinear().domain([d3.max(linearY), d3.min(linearY) ]).range([1, 9]);
  linearY = linearY.map(x => scaleY(x));
	lineData = [];
  for (let i = 0; i < linearY.length; ++i) {
     lineData.push({x: i/linearY.length*10, y: linearY[i], t:1000});
   }

	 console.log("test",  lineData);
	 var line = d3.line()
	   .x(function(d) {return x_w2(d.x);})
	   .y(function(d) {return y_w2(d.y);})
	   .curve(d3.curveNatural)

  // Clear the previously drawn line
  svg_w2.selectAll("path").remove();
	svg_w2.selectAll("circle").remove();
  // Set a light grey class on old paths
  //svg_w2.selectAll("path").attr("class", "old");


	var temp = [];
	var tottime = 0;
	var wait = {};
	var ipath = 0;

	 var circle = svg_w2.append("circle")
	    .attr("r", 8)
			.attr("transform", function () {return "translate(" + x_w2(lineData[0].x) + "," +y_w2(lineData[0].y) + ")";})
			.style("fill", d3.color("#6d9ffc"))
			.attr("stroke", "none");

	// Compute time in advance for animation and store them in "wait"
	for (var i = 0; i < lineData.length - 1; ++i) {
			temp[0] = lineData[ipath];
			temp[1] = lineData[ipath + 1];
			time = ((temp[1].x-temp[0].x)**2+(temp[1].y-temp[0].y)**2)**0.5/lineData[ipath].t*100000;//lineData[ipath].t //
			//console.log("t1", time);
			//console.log("i", i);
			wait[i] = tottime;
			tottime += time;
			ipath++;
	}

	//Execute the animation for each curve piece a times contained in "wait"
	ipath = 0;
	for (var i = 0; i < lineData.length - 1; ++i) {
		setTimeout(time_offset, wait[i]);
	}


function time_offset() {
		 temp[0] = lineData[ipath];
		 temp[1] = lineData[ipath + 1];
		 time = ((temp[1].x-temp[0].x)**2+(temp[1].y-temp[0].y)**2)**0.5/lineData[ipath].t*100000; //((temp[1].x-temp[0].x)**2+(temp[1].y-temp[0].y)**2)**0.5*100;
		//console.log("t2", time);

		var lineGraph = svg_w2.append("path")
			.attr("d", line(temp))
			.attr("stroke", "#6d9ffc")
			.attr("stroke-width", "4")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round");

		var totalLength = lineGraph.node().getTotalLength();

		//console.log(totalLength);
		//console.log(ipath + " " + temp[0].x + " " + temp[1].x + " " + time);

		lineGraph.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(time)
			.ease(d3.easeLinear)
			.attr("stroke-dashoffset", 0);

		circle.transition()
			.duration(time)
			.ease(d3.easeLinear)
			.attr("transform", function () {return "translate(" + x_w2(temp[1].x) + "," +y_w2(temp[1].y) + ")";});
		//console.log(ipath+": "+time+", "+wait);

		ipath++;
}

  // var path = svg_w2.append("path")
  //   .attr("d", line(data))
  //   .attr("stroke", "#6d9ffc")
  //   .attr("stroke-width", "4")
  //   .attr("fill", "none")
  //   .attr("stroke-linejoin", "round")
  //   .attr("stroke-linecap", "round");
	//
  // var totalLength = path.node().getTotalLength();
  // console.log("tl", line(data));
	//
	//
  // path.attr("stroke-dasharray", totalLength + " " + totalLength)
  //     .attr("stroke-dashoffset", totalLength)
  //     .transition()
  //     .duration(4000)
  //     .ease(d3.easeLinear)
  //     .attr("stroke-dashoffset", 0);
  //     //.on("end", repeat);
};
//repeat();


//console.log()
