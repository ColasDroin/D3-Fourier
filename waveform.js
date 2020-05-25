var h_w1 = d3.select(".widget_1").style('height').slice(0, -2);
var w_w1 = d3.select(".widget_1").style('width').slice(0, -2);

//Add flat line as baseline
var initialCoor_w1 =  [[0,h_w1/2],[w_w1,h_w1/2]];
var lineGenerator_w1 = d3.line().curve(d3.curveBasis);
var pathString_w1 = lineGenerator_w1(initialCoor_w1);
var linearY = [];
d3.select(".widget_1").append("path").attr('d', pathString_w1).attr("stroke", "#6d9ffc")
			.attr("stroke-width", "4")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round");

//Interactive line
var svg_w1 = d3.select(".widget_1")
    .call(d3.drag()
        .container(function() { return this; })
        .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
        .on("start", dragstarted)
        .on("end", correctCurve));

//how the line is plotted by the user.
function dragstarted() {
  svg_w1.selectAll("*").remove();
  var d = d3.event.subject,
      active = svg_w1.append("path"),//.datum(d),
      x0 = d3.event.x,
      y0 = d3.event.y;

  d3.event.on("drag", function() {
    var x1 = d3.event.x,
        y1 = d3.event.y,
        dx = x1 - x0,
        dy = y1 - y0;

    if ( !( (dx<0) && (d[1][0]-d[0][0]>0) ) &&  !( (dx>0) && (d[1][0]-d[0][0]<0) ) )  {
        if (dx * dx + dy * dy > 100) d.push([x0 = x1, y0 = y1]);
        else d[d.length - 1] = [x1, y1];
        active.attr("stroke", "#6d9ffc")
							.attr("stroke-width", "4")
							.attr("fill", "none")
							.attr("stroke-linejoin", "round")
							.attr("stroke-linecap", "round")
        			.attr("d", lineGenerator_w1(d));
    }
    else {
        active.attr("stroke", "#FFA500")
							.attr("stroke-width", "4")
							.attr("fill", "none")
							.attr("stroke-linejoin", "round")
							.attr("stroke-linecap", "round");
    }

  });
}

// Several steps:
// 1. Get line coordinates and add extrema
// 2. Interpolate new curve from individual line coordinates
// 3. Fourier transform the signal
// 4. Draw harmonics and signal
function correctCurve() {
	//////////////////////////////////////////
	// 1. Get line coordinates and add extrema
	//////////////////////////////////////////

    var dat = d3.event.subject;
    var arrayLength = dat.length;
    //dat[0] = [0,h_w1/2]

    if (dat[0][0]<dat[arrayLength-1][0]) {
        dat.unshift(  [ 0, dat[0][1]]   );
        dat.push([w_w1, dat[arrayLength-1][1]]);
    }
    else {
        dat.push(  [ 0, dat[arrayLength-1][1]]   );
        dat.unshift([w_w1, dat[0][1]]);
    }
    svg_w1.selectAll("*").remove();


	//////////////////////////////////////////
	// 2. Interpolate new curve from individual line coordinates
  //get individual coordinates
	//////////////////////////////////////////

    var xvalues = [];
    var yvalues = [];
    arrayLength = dat.length
    for (var i = 0; i < arrayLength; i++) {
        xvalues.push(dat[i][0]);
        yvalues.push(dat[i][1]);
    }

    var linearScale = d3.scaleLinear()
        .domain(xvalues)
        .range(yvalues);

    //define new curve interpolated from before
    var resInterp = 2**7;
    var linearX = makeArr(0., w_w1, resInterp);
    //var linearY = []//linearScale(linearX);
    var linCoor = [];
		linearY = []
    for (var i = 0; i < linearX.length; i++) {
        y = linearScale(linearX[i]);
        linearY.push(y);
        linCoor.push([ linearX[i], y ]);
    }
		// Store waveform for futur use
		//console.log("linY", linearY);
		//svg_w1.attr("data", linearY);

    //draw the new path
    //pathString_w1 = lineGenerator_w1(linCoor);
    //svg.select("path").attr("d", pathString_w1);

	//////////////////////////////////////////
    // 3. Fourier transform the signal
	//////////////////////////////////////////

    const f = new FFT(resInterp);
    const yIm = f.createComplexArray();
    const linearYComp = f.createComplexArray();
    f.realTransform(yIm, linearY);
    f.completeSpectrum(yIm)

    smooth = true;
    if (smooth) {
        //zero out everything but the first Fourier components
        for (var i = 5; i < resInterp/2; i++) {
            yIm[2*i] = 0;
            yIm[2*i+1] = 0;
            yIm[ (resInterp-i)*2] = 0;
            yIm[ (resInterp-i)*2+1] = 0;
        }
    }
  // Invert transform
  f.inverseTransform(linearYComp, yIm);
  linearY = f.fromComplexArray(linearYComp);
  var linCoorSmooth = [];
  for (var i = 0; i < linearX.length; i++) {
      linCoorSmooth.push([ linearX[i], linearY[i] ]);
  }
	var offset_signal = mean(linearY)-Math.min(...linearY);

	//console.log(linearY2);
  //Draw
  //pathString_w1 = lineGenerator_w1(linCoorSmooth);
  //svg.select("path").attr("d", pathString_w1);

	//////////////////////////////////////////
  // 4. Draw harmonics and signal
	//////////////////////////////////////////

  var ySum = Array.from(linearX);
  ySum.fill(0.);
	var mod0 = 	Math.sqrt(yIm[0]**2+yIm[1]**2)/linearX.length;
	var cum_offset = 0;
	var scale = 5/Math.sqrt(mod0);
  for (var i = 1; i < 16; i++) {
    let a = yIm[2*i]
    let b = yIm[2*i+1]

    var linCoorHarm = []
		var linCoorHarmShifted = []
    var phase = Math.atan2(b,a);

		var mod = Math.sqrt(a**2+b**2)/linearX.length*2;
		let modprev = Math.sqrt(yIm[2*(i-1)]**2+yIm[2*(i-1)+1]**2)/linearX.length*2;
		//console.log("mod", mod);
		//console.log("modprev", modprev);
		cum_offset = cum_offset + mod*scale + modprev*scale+1;
		if (i==1) cum_offset -=2*mod0*scale;
			//console.log("offset", cum_offset);
		for (var j = 0; j < linearX.length; j++) {
    		linCoorHarm.push([ linearX[j], mod0+mod*Math.cos(2*Math.PI*j*i/linearX.length+phase) ]);
				linCoorHarmShifted.push([ linearX[j],cum_offset+offset_signal+mod*Math.cos(2*Math.PI*j*i/linearX.length+phase)*scale ]);
    		ySum[j]+=mod*Math.cos(2*Math.PI*j*i/linearX.length+phase);
		}
    pathString_w1 = lineGenerator_w1(linCoorHarm);
		pathString_w1Shifted = lineGenerator_w1(linCoorHarmShifted);
    svg_w1.append("path").attr("d", pathString_w1).attr("stroke", "#6d9ffc")
			.attr("stroke-width", "2")
			.attr("stroke-opacity", "0.5")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.transition()
			.duration(500)
			.attr("d", pathString_w1Shifted);

  }

  //draw sum
  var linCoorSum = [];
	var linCoorSumShifted = [];
	var linearY3 = [];
	//offset_min = Math.min(...ySum);
  for (var j = 0; j < linearX.length; j++) {
      linCoorSum.push([ linearX[j], mod0+ySum[j] ]);
	linCoorSumShifted.push([ linearX[j], offset_signal*scale+ySum[j]*scale ]);
	linearY3.push(offset_signal*scale+ySum[j]*scale);
  }
	//console.log(ySum );
  pathString_w1 = lineGenerator_w1(linCoorSum);
	pathString_w1Shifted = lineGenerator_w1(linCoorSumShifted);
    svg_w1.append("path")
		.attr("d", pathString_w1)
		.attr("stroke", "#6d9ffc")
		.attr("stroke-width", "4")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("class", "waveform")
		.transition()
		.duration(500)
		.attr("d", pathString_w1Shifted)
		.attr('id', "drawn_line");

	function animate() {
	svg_w1.select("path")
		.transition()
		.duration(40)
		.attr("d", function() {
			linearY3 = arrayRotate(linearY3, false,1);
			linCoorSumShifted = []
			for (var j = 0; j < linearX.length; j++) {
				linCoorSumShifted.push([ linearX[j], linearY3[j] ]);
		    }
			pathString_w1Shifted = lineGenerator_w1(linCoorSumShifted);
			return pathString_w1Shifted; })
		.on("end", animate);
	}
	repeat();
	//animate();
}

//replace linspace
function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var currValue = startValue;
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(currValue + (step * i));
  }
  return arr;
}

//matrix of zeros
function zeroReals(size) {
    var result = new Float32Array(size);
    for (var i = 0; i < result.length; i++)
        result[i] = 0.0;
    return result;
}

// mean function
function mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}

//circular permutation on array of coordinates
function arrayRotate(arr, reverse, n) {
  for (let i=0; i<n;i++){
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
  }
  return arr;
}
