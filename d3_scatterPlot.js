/////////////////////////////////////
///reusable code starts here
////////////////////////////////////

var Scatter_Plot = function(opt) {
  this.data = opt.data;
  this.element = opt.element;
  this.orientation = opt.orientation;
  this.width = opt.width;
  this.height = opt.height;
  this.r = opt.circleRadius;
  this.padding = opt.padding;
  this.speed = opt.speed;
  this.optionalColorPalette = opt.colorPalette;
  this.xTicksNum = opt.xTicksNum;
  this.yTicksNum = opt.yTicksNum;
  this.barPaddingInner = opt.barPaddingInner;
  this.fontSize = opt.fontSize;
  this.draw();
};






Scatter_Plot.prototype.draw = function() {
  this.padding = 50;

  var svg = d3.select(this.element).append('svg')
  .attr("padding",this.padding)
  .attr('viewBox',"0 0 "+this.width+" "+this.height)
  .attr("preserveAspectRatio","xMinYMin")

  this.plot = svg.append('g')
    .attr('class', 'Scatter_Plot_holder')
    .attr('transform', "translate(" + this.padding + "," + this.padding + ")");

  this.generateData();
  this.generateXScale();
  this.generateYScale();
  this.generateColorScale();
  this.addAxis();
  this.generateButtons();
  this.generateCircles();
  this.addReferenceLines();

};

Scatter_Plot.prototype.generateXScale = function() {
  if(this.orientation=='vertical'){
  this.xScale = d3.scaleLinear()
    .domain([0,d3.max(this.data,function(d) {
      return d.x;
    })*1.2])
    .range([0, this.width - 2 * this.padding])
  }else if (this.orientation=='horizontal'){
  this.xScale = d3.scaleLinear()
    .domain([0,d3.max(this.data,function(d){
      return d.y;
    })*1.2])
    .range([0, this.width - 2 * this.padding])
  };

  this.xAxis = d3.axisBottom().ticks(this.xTicksNum).scale(this.xScale);
};

Scatter_Plot.prototype.generateYScale = function() {
  if(this.orientation =='vertical'){
  this.yScale = d3.scaleLinear()
    .domain([0, d3.max(this.data, function(d) {
      return d.y ;
    }) * 1.2])
    .range([this.height - 2 * this.padding, 0])
}else if(this.orientation=='horizontal'){
  this.yScale = d3.scaleLinear()
    .domain(this.data.map(function(d) {
      return d.x;
    }))
    .range([this.height - 2 * this.padding, 0])
    .paddingInner(this.barPaddingInner);
}
    this.yAxis = d3.axisLeft().ticks(this.yTicksNum).scale(this.yScale);
};

Scatter_Plot.prototype.generateColorScale = function() {

  var that=this;

  this.colorPalette = [
    {
      "key":1,
      "color": "#1f77b4"
    },
    {
      "key":2,
      "color": "#ff7f0e"
    },
    {
      "key":3,
      "color": "#2ca02c"
    },
    {
      "key":4,
      "color": "#9467bd"
    },
    {
      "key":5,
      "color": "#8c564b"
    },
    {
      "key":6,
      "color": "#e377c2"
    },
    {
      "key":7,
      "color": "#7f7f7f"
    },
    {
      "key":8,
      "color": "#bcbd22"
    },
    {
      "key":9,
      "color": "#17becf"
    }
  ];

    this.optionalColorPalette.map(function(d){
      var curKey = d.key;
      var curColor = d.color;

      that.colorPalette.map(function(d){
        if(d.key == curKey){
          d.color = curColor;
        }
      }
      )

    });



  this.colorScale = d3.scaleOrdinal()
    .domain(this.data.map(function(d) {
      return d.x;
    }))
    .range(this.colorPalette.map(function(d) {
      return d.color;
    }));

}


Scatter_Plot.prototype.addAxis = function() {
  this.plot.append("g")
    .attr("id", "x-axisGroup")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + "0" + "," + (this.height - 2 * this.padding) + ")");

  this.plot.select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)

  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

}

Scatter_Plot.prototype.updateAxis = function() {
  this.plot.select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

}


Scatter_Plot.prototype.generateCircles = function() {

  if(this.orientation == 'vertical'){
      var that = this;

      var rect = this.plot.selectAll(".chartCircle")
        .data(this.data,function(d){return d.x});

      //remove any elements that don't have data
      rect.exit().remove();

      //update elements that do have Data
      rect
        .transition().duration(this.speed)
        .attr("cx", function(d) {
          return that.xScale(d.x);
        })
        .attr("cy", function(d) {
          return that.yScale(d.y);
        })
        .attr("r",this.r)

      //create new elements for data that is new
      rect.enter().append("circle")
        .attr("class","chartCircle")
        .attr("cx", function(d) {
          return that.xScale(d.x);
        })
        .attr("cy", function(d){
          return that.yScale(d.y);
        })
        .on("mouseover", function(d) {
          that.showToolTip(d)
        })
        .on("mouseout", function(d) {
          that.hideToolTip(d)
        })
        .transition().duration(this.speed) // start at "y=0" then transition to the top of the grpah while the height increases
        .attr("cx", function(d) {
          return that.xScale(d.x)
        })
        .attr("cy", function(d) {
          return that.yScale(d.y)
        })
        .attr("r", this.r)
        .attr("fill", function(d) {
          return that.colorScale(d.x)
        });


    }else if (this.orientation =='horizontal'){
      var that = this;

      var rect = this.plot.selectAll("rect")
        .data(this.data,function(d){return d.x});

      //remove any elements that don't have data
      rect.exit().remove();

      //update elements that do have Data
      rect
        .transition().duration(this.speed)
        .attr("x", 1)
        .attr("y", function(d) {
          return that.yScale(d.x)
        })
        .attr("height",this.yScale.bandwidth())
        .attr("width", function(d){
        return that.xScale(d.y);
        })

      //create new elements for data that is new
      rect.enter().append("rect")
        .attr("x", 1)
        .attr("y", function(d) {
          return that.yScale(d.x) + 5
        })
        .attr("height",this.yScale.bandwidth())
        .on("mouseover", function(d) {
          that.showToolTip(d)
        })
        .on("mouseout", function(d) {
          that.hideToolTip(d)
        })
        .transition().duration(this.speed) // start at "y=0" then transition to the top of the grpah while the height increases
        .attr("y", function(d) {
          return that.yScale(d.x)
        })
        .attr("height",this.yScale.bandwidth())
        .attr("width", function(d) {
          return that.xScale(d.y) ;
        })
        .attr("fill", function(d) {
          return that.colorScale(d.x)
        });

  }

};

Scatter_Plot.prototype.calculateDataParameters = function(){
  if(this.orientation == 'vertical'){

    this.avgX = d3.mean(this.data,function(d){return d.x});
    this.maxY = d3.max(this.data,function(d){return d.y})*1.2;
    this.avgY = d3.mean(this.data,function(d){return d.y});
    this.maxX = d3.max(this.data,function(d){return d.x});
    this.minX = d3.min(this.data,function(d){return d.x});

  };

  this.xRefLineData = [
    {x:this.avgX,
     y:0
    },
    {x:this.avgX,
     y:this.maxY
    },
  ];

  this.yRefLineData = [
    {x:0,
     y:this.avgY
    },
    {x:this.maxX*1.2,
     y:this.avgY
    },
  ];



};

Scatter_Plot.prototype.addReferenceLines = function(){

  this.calculateDataParameters();

  if(this.orientation == 'vertical'){
    var that = this;

    var refLineGenerator = d3.line()
      .x(function(d){
        return that.xScale(d.x)
      })
      .y(function(d){
        return that.yScale(d.y)
      });


    this.plot
      .append("path")
      .attr("d",refLineGenerator(this.xRefLineData))
      .attr("id","xRefLine")
      .attr("stroke","#a7a7a7")
      .attr("stroke-width","1px");


    this.plot
      .append("path")
      .attr("d",refLineGenerator(this.yRefLineData))
      .attr("id","yRefLine")
      .attr("stroke","#a7a7a7")
      .attr("stroke-width","1px");

  };

};

Scatter_Plot.prototype.updateReferenceLines = function(){

  this.calculateDataParameters();

  if(this.orientation == 'vertical'){

  var that=this;

  var refLineGenerator = d3.line()
    .x(function(d){
      return that.xScale(d.x)
    })
    .y(function(d){
      return that.yScale(d.y)
    });

  this.plot.selectAll("#xRefLine")
    .transition()
    .duration(this.speed)
    .attr("d",refLineGenerator(this.xRefLineData));


    this.plot.selectAll("#yRefLine")
      .transition()
      .duration(this.speed)
      .attr("d",refLineGenerator(this.yRefLineData));

};

Scatter_Plot.prototype.addKMeansClusters = function(){

  var that = this;
  this.k_means = new K_Means(this.data,5);
  this.clusterData = this.k_means.centroidList;

  this.plot.selectAll(".clusterCircle")
    .data(this.clusterData)
    .enter()
    .append("circle")
    .attr("class","clusterCircle")
    .attr("cx",function(d){return that.xScale(d.x);})
    .attr("cy",function(d){return that.yScale(d.y);})
    .attr("r",3)
    .attr("fill","Purple")

};


};

Scatter_Plot.prototype.greyColors = function(){

  this.plot.selectAll(".chartCircle")
    .transition()
    .duration(100)
    .attr("fill","#a7a7a7")
};

Scatter_Plot.prototype.updateColors = function(){

  var that=this;

  this.plot.selectAll(".chartCircle")
    .transition()
    .duration(100)
    .attr("fill",function(d){
      var key = d.cluster+1
      return that.colorScale(key);

    });


    this.plot.selectAll(".clusterCircle")
      .transition()
      .duration(100)
      .attr("cx",function(d){return that.xScale(d.x);})
      .attr("cy",function(d){return that.yScale(d.y);})
      .attr("r",5)
      .attr("fill","#000");

};



Scatter_Plot.prototype.updateBars = function() {
  this.generateXScale();
  this.generateYScale();
  this.generateColorScale();
  this.updateAxis();
  this.generateCircles();
  this.updateReferenceLines();

};

Scatter_Plot.prototype.boxMuller = function(mu,sigma,u1){
  //var u1 = Math.random();
  var u2 = Math.random();

  var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(Math.PI*2 * u2);
  //var z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(Math.PI*2 * u2);

  return z0 * sigma + mu

}

Scatter_Plot.prototype.generateData = function(){

  this.center1 = {
    x:10,
    y:20,
    mu:1,
    sigma:1
  };

  this.center2 = {
    x:10,
    y:10,
    mu:2,
    sigma:3
  };

  this.center3 = {
    x:4,
    y:7,
    mu:3,
    sigma:2
  };


  this.data.push(this.center1,this.center2,this.center3);

};

Scatter_Plot.prototype.updateData = function() {


  for(i=0;i<=20;i++){
    var u1 = Math.random();

    var newEntry = {
      x: this.center1.x + this.boxMuller(this.center1.mu,this.center1.sigma,u1),
      y: this.center1.y + this.boxMuller(this.center1.mu,this.center1.sigma,u1)
    };

    this.data.push(newEntry);

    var newEntry1 = {
      x: this.center2.x + this.boxMuller(this.center2.mu,this.center2.sigma,u1),
      y: this.center2.y + this.boxMuller(this.center2.mu,this.center2.sigma,u1)
    };

    this.data.push(newEntry1);

    var newEntry2 = {
      x: this.center3.x + this.boxMuller(this.center3.mu,this.center3.sigma,u1),
      y: this.center3.y + this.boxMuller(this.center3.mu,this.center3.sigma,u1)
    };

    this.data.push(newEntry2);

  };

  this.updateBars();


};

Scatter_Plot.prototype.showToolTip = function(d) {

  if (this.tooltipNode != undefined) {
    this.tooltipNode.remove()
  };

  this.tooltipNode = this.plot.append("g")


  this.tooltipNode.append("text")
    .attr("id","tooltiptext")
    .attr("opacity",1)
    .attr("x", "0.5em")
    .text(d.x + " | "+ d.y );

  var text_width = d3.select("#tooltiptext").node().getComputedTextLength()+15;
  if(this.orientation == 'vertical'){

    this.tooltipNode
      .attr("transform", "translate(" + (this.xScale(d.x) * 1 + 5) + "," + (this.yScale(d.y) * 1 - 10) + ")")
      .style("opacity", 0);
  }else if(this.orientation == 'horizontal'){
    this.tooltipNode
      .attr("transform", "translate(" + Math.min(this.xScale(d.y)+5,this.xScale(d.y)+5-text_width) + "," + (this.yScale(d.x) * 1 - 10) + ")")
      .style("opacity", 0);

  };

  this.tooltipNode
    .append("rect")
    .attr("width", text_width)
    .attr("height", "1.6em")
    .attr("y", "-1.25em")
    .attr("fill", "lightgray")
    .attr("rx", 4)
    .style("pointer-events", "none");

  this.tooltipNode.append("text")
    .attr("x", "0.5em")
    .style("opacity",0.9)
    .style("background", "lightgray")
    .text(d.x + " | "+ d.y);

  this.tooltipNode
    .transition().duration(200)
    .style("opacity", 1);

};

Scatter_Plot.prototype.hideToolTip = function() {
  var that = this;
  that.tooltipNode.remove();
};

Scatter_Plot.prototype.generateButtons = function() {
  var that = this;
  d3.select(".button-container").append("button")
    .text("Add Data")
    .on("click", function() {
      that.updateData()
    });
  d3.select(".button-container").append("button")
    .text("Initialize Clusters")
    .on("click", function() {
      that.addKMeansClusters();
      that.greyColors();
    });
  d3.select(".button-container").append("button")
    .text("KMeans Iteration")
    .on("click", function() {
      that.k_means.euclideanDistance();
      that.updateColors();
    });
};

Scatter_Plot.prototype.removeData = function() {
  this.data.pop();
  this.updateBars();

};


Scatter_Plot.prototype.rotateChart= function(){
  if(this.orientation=='vertical'){
    this.orientation='horizontal';
  }else{
    this.orientation='vertical';
  };
  this.updateBars();


};

/////////////////////////////////////
////New class for k means clustering
/////////////////////////////////


var K_Means = function(dataset,k){
  this.k = k;
  this.dataset = dataset;
  this.centroidList = [];

  this.xData = this.dataset.map(function(d){return d.x});
  this.yData = this.dataset.map(function(d){return d.y});

  for(i=0; i<this.k; i++){

    var centroid = {
      x:(i+1)*((Math.max.apply(null,this.xData) - Math.min.apply(null,this.xData))/(this.k)),
      y:(i+1)*((Math.max.apply(null,this.yData) - Math.min.apply(null,this.yData))/(this.k))
    };
    this.centroidList.push(centroid)
  };

};

K_Means.prototype.euclideanDistance = function(){

  this.xData = this.dataset.map(function(d){return d.x});
  this.yData = this.dataset.map(function(d){return d.y});
  this.center1xDiff = 0;
  this.center1yDiff = 0;
  this.center2Diff = 0;


  //iterate over each point
  for(i=0; i < this.dataset.length; i++){
     var pointDistanceList = [];
     for(k=0; k< this.centroidList.length; k++){
        var pointDistance = Math.sqrt(Math.pow((this.xData[i] - this.centroidList[k].x),2) + Math.pow((this.yData[i] - this.centroidList[k].y),2));
        pointDistanceList.push(pointDistance);
        };

     //find the arg min of the pointDistanceList
     var argMin = pointDistanceList.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];

     //assign point to cluster
     this.dataset[i].cluster = argMin;
   };

   //move the centroid to the average of it's data points;
   for(k=0; k<this.centroidList.length; k++){

     this.centroidList[k].x = d3.mean(this.dataset.filter(d=>d.cluster == k),function(d){return d.x});

     this.centroidList[k].y = d3.mean(this.dataset.filter(d=>d.cluster == k),function(d){return d.y});
   }
};
