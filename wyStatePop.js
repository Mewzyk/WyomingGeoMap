/*
Global variable used to track the state of the color scheme.
*/
var toggleBorders = true;
var toggleState = true;
initSvg(true, true);

function initSvg(toggleColor){
	/*
	Svg Width and Height
	*/
	var width = 960,
    	height = 1100;
		
	var formatNumber = d3.format(",d");
	
	/*
	@projection: geoalbers projection centered around Wyoming
	*/
	var projection = d3.geo.albers()
		.center([0, 43.275094])
		.rotate([107.71, 0, 0])
		.parallels([40,45])
		.scale(9000)
		.translate([width / 2, height / 3]);
			
	var path = d3.geo.path().projection(projection);
	
	/*
	Retrieves the color scheme based on current state
	*/
	var colorScheme = getScheme(toggleColor);
	
	/*
	Scale and axis creation, primarily provided by Mike Bostock
	*/
	var color = d3.scale.threshold()
   		.domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
   		.range(colorScheme);

	var x = d3.scale.linear()
		.domain([0, 5100])
		.range([0, 480]);

	var xAxis = d3.svg.axis()
		.scale(x)
    	.orient("bottom")
    	.tickSize(13)
    	.tickValues(color.domain())
    	.tickFormat(function(d) { return d >= 100 ? formatNumber(d) : null; });

	var svg = d3.select("body").append("svg")
    	.attr("width", width)
    	.attr("height", height);

	var g = svg.append("g")
    	.attr("class", "key")
    	.attr("transform", "translate(110,40)");
	
	var borderPath = svg.append("rect")
       	.attr("x", 0)
       	.attr("y", 0)
       	.attr("height", height * (3/4))
       	.attr("width", width)
       	.style("stroke", "black")
       	.style("fill", "none")
       	.style("stroke-width", 1);
		
	/*
	Text to act as a button to toggle the color.
	*/
	svg.append("text")
		.attr("transform", "translate(600,50)")
		.text("Color")
		.attr("font-size", "1.5em")
		.classed("color", true)
		.on("click", function(){
			svg.remove();
			initSvg(!toggleColor);
		});
	
	/*
	Text to act as a button to toggle the census boundries.
	*/
	svg.append("text")
		.attr("transform", "translate(640,50)")
		.text(" - Census Boundries")
		.attr("font-size", "1.5em")
		.classed("census", true)
		.on("click", function(){
			if(toggleBorders){
				d3.selectAll('.tract')
					.style('stroke-opacity', '0.3');
				toggleBorders = !toggleBorders;
			}
			else{
				d3.selectAll('.tract')
					.style('stroke-opacity', '0');
				toggleBorders = !toggleBorders;
			}
		});
	
	/*
	Text to act as a button to toggle the census boundries.
	*/
	svg.append("text")
		.attr("transform", "translate(760,50)")
		.text("- State Boundries")
		.attr("font-size", "1.5em")
		.classed("census", true)
		.on("click", function(){
			if(toggleState){
				d3.selectAll('.state-border')
					.style('stroke-opacity', '0');
					toggleState = !toggleState;
			}
			else{
				d3.selectAll('.state-border')
					.style('stroke-opacity', '0.7');
				toggleState = !toggleState;
			}
		});
	
	/*
	Establishes the legend
	*/
	g.selectAll("rect")
    	.data(color.range().map(function(d, i) {
      		return {
        		x0: i ? x(color.domain()[i - 1]) : x.range()[0],
        		x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
        		z: d
      		};
    		}))
  		.enter().append("rect")
    	.attr("height", 8)
    	.attr("x", function(d) { return d.x0; })
    	.attr("width", function(d) { return d.x1 - d.x0; })
    	.style("fill", function(d) { return d.z; });

	g.call(xAxis).append("text")
    	.attr("class", "caption")
    	.attr("y", -6)
    	.text("Population per square mile");
			
	d3.json("wy.json", function(error, wy) {
  		if (error) throw error;
		
		/*
		Draws the svg tracts and counties to the screen. 
		The color is nested as the key for each datum.
		*/
		
  		var tract = topojson.feature(wy, wy.objects.tract);
		
		/*
		svg.append("defs").append("clipPath")
      		.attr("id", "clip-land")
    		.append("path")
      		.datum(topojson.feature(wy, wy.objects.county))
      		.attr("d", path);
			*/
		
		svg.append("g")
      		.attr("class", "tract")
      		.attr("clip-path", "url(#clip-land)")
    		.selectAll("path")
      		.data(d3.nest()
        	.key(function(d) { return color(d.properties.population / d.properties.area * 2.58999e6); })
        	.entries(tract.features.filter(function(d) { return d.properties.area; })))
    		.enter().append("path")
      		.style("fill", function(d) { return d.key; })
			.attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); });
		
		svg.append("path")
      		.datum(topojson.mesh(wy, wy.objects.county, function(a, b) { return a !== b; }))
      		.attr("class", "county-border")
      		.attr("d", path);
		
		svg.append("path")
      		.datum(topojson.mesh(wy, wy.objects.wyOutline, function(a, b) { return true; }))
      		.attr("class", "state-border")
      		.attr("d", path);
	});
			
		d3.select(self.frameElement).style("height", height + "px");
}

/*
Returns one of the two color schemes.
condition state variable is held within this script and is toggled upon call of toggleColor()
*/
function getScheme(toggleColor){
	if(toggleColor){
		return ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"];
		toggleColor = false;
	}
	else{
		return ['#fff7ec', '#EAC6DE', '#D597BF', '#cc6dab', '#cc6dab', '#9d407c', '#6D415E', '#4D1238', '#310321', '#180110'];
		toggleColor = true;
	}
}