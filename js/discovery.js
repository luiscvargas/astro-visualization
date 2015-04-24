//Set width and height of bars
var w = 1000;
var h = 300;
var barPadding = 0.5; 
var padding = 20;
    
//Placeholder website - to be replaced by discovery papers

var hrefdum = 'http://adsabs.harvard.edu/abs/2012AJ....144....4M';
//var "wiki" = 'http://adsabs.harvard.edu/abs/2012AJ....144....4M';

d3.csv("data/dwarfs.csv", function(d) {
    return {
    ra: parseFloat(d.ra),
    dec: parseFloat(d.dec),
    year: parseInt(d.year),
    url: d.url,
    objname: d.objname,
    };
}, function(error, dataset) {

    console.log(dataset);
                    
    var min_year = 1700;
    var max_year = 2015;
    var nbins = max_year - min_year + 1;

    //Set up histogram bins (one/year currently)

    var hist = new Array(nbins);

    for (var i = 0; i < nbins ; i++) { 
        hist[i] = {
            year: i + min_year,
            ngal: 0,
            meta: "<tr><td>Year: "+(i+min_year).toString()+"</td></tr>"
        }
    }

    //Aux function to calculate bin associated with each year
    var getbin = function(year) {
        return Math.floor(year - min_year);
    }

    //Calculate heights of histogram for each x-value
    //x = year; y = # galaxies discovered

    for (var i = 0; i < dataset.length ; i++) { 

        var bin = getbin(dataset[i].year);
        if (bin >= 0 && dataset[i].system != "bla" ) {
            hist[bin].ngal += 1;
            //hist[bin].meta += "<tr><td>" + dataset[i][3] + "</td></tr>"
            hist[bin].meta += "<tr><td><a  href='" + dataset[i].url + "' target='_blank'>" + dataset[i].objname + "</a></td></tr>"
        }

    }        

        //Set x/y mappings from data -> pixels

    var xScale = d3.scale.linear()
        .domain([min_year,max_year])
        .range([padding,w-padding]);

    var yScale = d3.scale.linear()
        .domain([0,d3.max(hist, function(d) {return d.ngal;})])
        .range([0,h]);

    //Set up x axis options 
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(5)
        .tickSize(8)
        .orient("bottom");

        //Create interactive legend
        var tip = d3.select("body")
            .append("div")
            .attr("id","tooltip")
            .style("opacity",0);


        //Create main SVG element
        var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h + 2*padding);

        //Create x-axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0,"+(h+padding)+")")
            .call(xAxis);

        //Create x-axis label
        svg.append("text")
            .attr("x",0.52 * w)
            .attr("y",h + 2 * padding)
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Year");
    
        //Plot histogram bars, and animate bars when mouse hovers
        svg.selectAll("rect")
                .data(hist)
                .enter()
                .append("rect")
                .attr("x", function(d) {return xScale(d.year); })
                .attr("y", function(d) {return h + padding - yScale(d.ngal); })
                .attr("width", function(d, i) {return  w / hist.length - barPadding;})
                .attr("height", function(d) {return yScale(d.ngal);})
                .attr("fill", function(d) { return "rgb(0,0,"+(d.ngal) + ")";})
                .on("mouseover", function(d) {
                    d3.select(this)
                        .attr("fill", function(d) { return "blue";});
                    tip.transition()
                        .duration(500)
                        .style("opacity", 0);
                    tip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tip .html("<table id='tiptable' class='legend'>" + d.meta + "</table>")
                        .style("left", ( d3.event.pageX - 30) + "px")
                        .style("top", ( h - yScale(d.ngal) + 2 ) + "px") ;
                })
                
                .on("mouseout",function() {
                    tip.transition()      
                        .delay(2000)
                        .duration(500)
                        .style("opacity",0);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr("fill", function(d) { return "rgb(0,0,"+(d.ngal) + ")";});
                });
        
        
});   //end of csv callback
