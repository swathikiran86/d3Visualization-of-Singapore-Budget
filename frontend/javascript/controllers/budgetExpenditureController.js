var budgetExpenditureApp = angular.module('budgetExpenditureApp', []);
budgetExpenditureApp.controller('budgetExpenditureController', ['$scope', '$http', function($scope, $http) {  

    //utility for plotting multi line graph
    function findExtent(data,key){
        var extent, extentArray = [], minMax = [];
        for(var i=0;i<data.length;i++){
            extent = d3.extent(data[i].values, function(d) {
                return d[key];
            });
            extentArray.push(extent);
        }
        minMax.push(d3.min(extentArray, function(array) {
            return d3.min(array);
        }));
        minMax.push(d3.max(extentArray, function(array) {
            return d3.max(array);
        }));
        return minMax;
    }
    
    //utility for plotting grouped bar chart
    function findBarExtent(data,key){
        var extent, extentArray = [], minMax = [];
        for(var i=0;i<data.length;i++){
            extent = d3.extent(data[i].values, function(d) {
                return d[d[key]];
            });
            extentArray.push(extent);
        }
        minMax.push(d3.min(extentArray, function(array) {
            return d3.min(array);
        }));
        minMax.push(d3.max(extentArray, function(array) {
            return d3.max(array);
        }));
        return minMax;
    }

    var fetchYearlyExpenditure = function(){
        $http({
            method: 'GET',
            url: '/yearlyExpenditure'
        }).then(function(response){
            $scope.yearlyExpenditures = response.data;
            plotMultiLineGraph($scope.yearlyExpenditures);
        });
    };
    fetchYearlyExpenditure();

    $scope.dataForSectorMinistryExpenditure = {};
    var fetchSectorMinistryExpenditure = function(){
        $http({
            method: 'POST',
            url: '/sectorMinistryExpenditure',
            data : $scope.dataForSectorMinistryExpenditure
        }).then(function(response){
            sectorMinistryExpenditure = response.data;
            plotHorizontalBarGraph(sectorMinistryExpenditure);
        });
    };

    $scope.yearGroupSelection = {
        model : 2018,
        yearsList : [{
            "name" : "2018 - 2014",
            "value" : 2018,
            "checked" : true
        },{
            "name" : "2013 - 2009",
            "value" : 2013,
            "checked" : false
        },{
            "name" : "2008 - 2004",
            "value" : 2008,
            "checked" : false
        },{
            "name" : "2003 - 1999",
            "value" : 2003,
            "checked" : false
        }]
    };
    
    var dataForTypeMinistryExpenditure = {
        "year" : 2018,
        "sector" : "Economic Development"
    };

    $scope.yearGroupChanged = function(){
        dataForTypeMinistryExpenditure.year = $scope.yearGroupSelection.model;
        $http({
            method: 'POST',
            url: '/typeMinistryExpenditure',
            data : dataForTypeMinistryExpenditure
        }).then(function(response){
            typeMinistryExpenditure = response.data;
            plotGroupedBarGraph(typeMinistryExpenditure);
        });
    }



    //Plotting multiple line graphs
    
    function plotMultiLineGraph(exp){ //plotMultiLineGraph START

        //data processing
        var sectorNest = d3.nest()
            .key(function (d) { return d.sector; })
            .entries(exp);
        var parseDate = d3.timeParse("%Y");
        sectorNest.forEach(function(d) { 
            d.values.forEach(function(d) {
                d.financial_year = parseDate(d.financial_year);
                d.total_amount = +d.total_amount;  
            });
        });

        //variables for svg
        var width = 1000, height = 800, margin = 30;

        //svg formation
        var svg = d3.select("#multiLineGraph").append("svg")
        .attr("width",width+margin).attr("height",height+margin)
        .append("g").attr("transform","translate("+margin+","+margin+")");

        //scale formation
        var totalAmtExtent = findExtent(sectorNest,"total_amount");
        var financialYearExtent = findExtent(sectorNest,"financial_year");

        var xScale = d3.scaleTime()
        .domain([financialYearExtent[0],financialYearExtent[1]])
        .range([0, width-100]);

        var yScale = d3.scaleLinear()
        .domain([0,totalAmtExtent[1]])
        .range([height/2, 0]);

        var x_axis = d3.axisBottom().scale(xScale);
         
        var y_axis = d3.axisLeft().scale(yScale);

        // line formation
        var color = d3.scaleOrdinal(d3.schemeDark2);

        var sectorFunctionOfTime = d3.line()
        .x(function(d) { return xScale(d.financial_year); })
        .y(function(d) { return yScale(d.total_amount); });

        //lines on hover
        var lineOpacity = "0.35";
        var lineOpacityHover = "0.85";
        var otherLinesOpacityHover = "0.1";
        var lineStroke = "1.5px";
        var lineStrokeHover = "2.5px";

        /* formation of point on line */
        var circleOpacity = '0.85';
        var circleOpacityOnLineHover = "0.25"
        var circleRadius = 3;
        var circleRadiusHover = 6; 
        
        var lines = svg.append('g')
        .attr('class', 'lines');

        lines.selectAll('.line-group')
        .data(sectorNest)
        .enter()
        .append('g')
        .attr('class', 'line-group') 
        .append('path')
        .attr('class', 'line') 
        .attr('id', function(d){ return d.key.replace(/ +/g, "");})  
        .attr('d', function(d){return sectorFunctionOfTime(d.values)})
        .style('stroke', function(d,i){ return color(i)})
        .style('opacity', lineOpacity)
        .on("mouseover", function(d,i) {
            d3.selectAll('.line')
            .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.circle')
            .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
            .style('opacity', lineOpacityHover)
            .style("stroke-width", lineStrokeHover)
            .style("cursor", "pointer");

            svg.append("text")
            .attr("class", "title-text")
            .style("fill", color(i))        
            .text(d.key)
            .attr("text-anchor", "middle")
            .attr("x", (width-margin)/2)
            .attr("y", 25);

            var k = d.key.replace(/ +/g, "");
            svg.selectAll('#legend_'+k).attr("font-size", "18px")
        })
        .on("mouseout", function(d,i) {
            d3.selectAll(".line")
            .style('opacity', lineOpacity);
            d3.selectAll('.circle')
            .style('opacity', circleOpacity);
            d3.select(this)
            .style("stroke-width", lineStroke)
            .style("cursor", "none");

            svg.select(".title-text").remove();

            var k = d.key.replace(/ +/g, "");
            svg.selectAll('#legend_'+k).attr("font-size", "14px")
        });

        legendSpace = (width)/sectorNest.length; // spacing for legend

        sectorNest.forEach(function(d,i){
        // Add the Legend
        svg.append("text")
        //.attr('data-key',d.key.replace(/ +/g, ""))
        .attr('id',"legend_"+d.key.replace(/ +/g, ""))
        .attr("font-size", "14px")
        .attr("x", (legendSpace/2)+(i*legendSpace - 40)) // spacing
        .attr("y", height - 325)
        .attr("class", "legend")    // style the legend
        .style("fill", function() { // dynamic colours
            return d.color = color(i); })
        .text(d.key)
        .on('mouseover',function(){
            d3.selectAll('.line')
            .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.circle')
            .style('opacity', circleOpacityOnLineHover);
            var k = d.key.replace(/ +/g, "");
            svg.selectAll('#'+k)
            .style('opacity', lineOpacityHover)
            .style("stroke-width", lineStrokeHover)
            .style("cursor","pointer");
        })
        .on('mouseout',function(){
            d3.selectAll(".line")
            .style('opacity', lineOpacity);
            d3.selectAll('.circle')
            .style('opacity', circleOpacity);
            var k = d.key.replace(/ +/g, "");
            svg.selectAll('#'+k).style('opacity', lineOpacity)
            .style("stroke-width", lineStroke)
            .style("cursor","none");
        })
        .on("click",function(){
            $('html, body').animate({
                scrollTop: $("#groupedBarGraph").offset().top
            }, 2000);
            dataForTypeMinistryExpenditure.sector = this.innerHTML;
            dataForTypeMinistryExpenditure.year = 2018;
            $scope.yearGroupChanged();
        })
        })
        
        //similar to axis
        d3.select(".lines").attr("transform", "translate(50, 10)");

        lines.selectAll(".circle-group")
        .data(sectorNest)
        .enter()
        .append("g")
        .style("fill", function(d,i){ return color(i)})
        .selectAll(".circle")
        .data(function(d){return d.values})
        .enter()
        .append("g")
        .attr("class", "circle")  
        .on("mouseover", function(d) {
            d3.select(this)     
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(d.total_amount)
                .attr("x", function(d){ return xScale(d.financial_year) + 5 })
                .attr("y", function(d){ return yScale(d.total_amount) - 10 });
            })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("cursor", "none")  
                .transition()
                .duration(200)
                .selectAll(".text").remove();
            })
        .append("circle")
        .attr("cx", function(d){ return xScale(d.financial_year)})
        .attr("cy", function(d){ return yScale(d.total_amount)})
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function(d) {
                d3.select(this)
                .transition()
                .duration(200)
                .attr("r", circleRadiusHover);
            })
        .on("mouseout", function(d) {
            d3.select(this) 
            .transition()
            .duration(200)
            .attr("r", circleRadius);  
        })
        .on("click",function(d,i){
            $scope.dataForSectorMinistryExpenditure.year = d.financial_year.getFullYear();
            $scope.dataForSectorMinistryExpenditure.sector = d.sector;
            fetchSectorMinistryExpenditure();
        });

        svg.append("g")
           .attr("transform", "translate(50, 10)")
           .call(y_axis)
           .append('text')
           .attr("y", 15)
           .attr("transform", "rotate(-90)")
           .attr("fill", "#000")
           .attr("font-weight", "bold")
           .text("Amount in Millions (SGD)");
        
        var xAxisTranslate = height/2 + 10;
        
        svg.append("g")
            .attr("transform", "translate(50, " + xAxisTranslate  +")")
            .call(x_axis)
            .append('text')
            .attr("x", width-150)
            .attr("y", 35)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .text("Financial Years");
        } //plotMultiLineGraph END

        
    
        function plotHorizontalBarGraph(graphData){ //plotHorizontalBarGraph START
            $("#horizontalBarGraph").empty();
            $('html, body').animate({
                scrollTop: $("#horizontalBarGraph").offset().top
            }, 2000);
            var tooltip = d3.select(".second-placeholder").append("div").attr("class", "toolTip");
            //variables for svg
            var width = 800, height = 500;// margin = 200;
            var margin = {top: 120, right: 20, bottom: 120, left: 150};
            //svg formation
            var svg = d3.select("#horizontalBarGraph").append("svg");
            svg.attr("width",width+margin.right+margin.left).attr("height",height+margin.top+margin.bottom)
            var g = svg.append("g").attr("transform","translate("+margin.left+","+margin.top+")");
    
            // set the ranges
            var y = d3.scaleBand()
            .rangeRound([0,height])
            .paddingInner(0.05)
            .align(0.1);
            var x = d3.scaleLinear()
            .rangeRound([0, width]);
            var z = d3.scaleOrdinal()
            .range(["#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00","#98abc5", "#8a89a6"]);
            //var z = ["blue","yellow"];
    
            var keys = ["Development","Operating"];
    
            y.domain(graphData.map(function(d){
                return d.ministry;
            }));
            /* x.domain([0,d3.max(graphData,function(d){
                return d.Development + d.Operating;
            })]); */
            x.domain([0,15000]); // fixing scale to understand the graphs better
            z.domain(keys);
    
            graphData = graphData.sort(function(a,b){
                return ((b.Development + b.Operating)-(a.Development + a.Operating))
            })
    
            var stackData = d3.stack().keys(keys).order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)(graphData);
    
            g.append("g").selectAll("g")
            .data(stackData).enter()
            .append("g").attr("fill",function(d){
                return z(d.key);
            })
            .selectAll("rect")
            .data(function(d){
                return d;
            })
            .enter()
            .append("rect")
            .attr("y",function(d){return y(d.data.ministry);})
            .attr("x",function(d){return x(d[0]);})
            .attr("width",function(d){return x(d[1]-d[0]); })
            .attr("height",y.bandwidth())
            .on("mouseover",function(d){
                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("display", "inline-block")
                    .html(d[1]-d[0]);
            }).on("mouseout", function(d){ 
                tooltip.style("display", "none");
            });
    
            g.append("g").attr("class","axis")
            .attr("transform","translate(0,0)").call(d3.axisLeft(y))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
    
            g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0,"+height+")")				
            .call(d3.axisBottom(x).ticks(null, "s"))					
            .append("text")
            .attr("y", 38)												
            .attr("x", x(x.ticks().pop()) + 0.5) 						
            .attr("dy", "0.32em")
            .attr("dx","1.5em")								
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Amount in Millions (SGD)")
            .attr("transform", "translate("+ (-width) +",-10)");   	
    
            var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { 
                return "translate(0," + (i * 20 - 100) + ")"; 
            });
    
            legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);
    
            legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });
        } //plotHorizontalBarGraph END

        function plotGroupedBarGraph(graphData){ //Grouped graph START
            $("#groupedBarGraph").empty();
    
            var tooltip = d3.select(".third-placeholder").append("div").attr("class", "toolTip");
    
            //variables for svg
            var width = 800, height = 500;// margin = 200;
            var margin = {top: 100, right: 100, bottom: 30, left: 40};
            //svg formation
            var svg = d3.select("#groupedBarGraph").append("svg");
            svg.attr("width",width+margin.right+margin.left).attr("height",height+margin.top+margin.bottom)
            var g = svg.append("g").attr("transform","translate("+margin.left+","+margin.top+")");
    
            var timeMinistryNest = d3.nest()
                .key(function (d) { return d.financial_year; })
                .entries(graphData);
    
            var x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);
    
            var x1 = d3.scaleBand()
            .padding(0.05);
    
            var y = d3.scaleLinear()
            .rangeRound([height, 0]);
    
            var z = d3.scaleOrdinal(d3.schemeSet1);
    
            var keys = [], timeKeys = [];
            timeMinistryNest.forEach(function(tmn){ 
                timeKeys.push(tmn.key);
            });
            for(i =0;i<timeMinistryNest[0].values.length; i++){
                keys.push(timeMinistryNest[0].values[i].ministry)
            }
    
            x0.domain(timeKeys);
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            //y.domain([0,findBarExtent(timeMinistryNest,"ministry")[1]]).nice();
            y.domain([0,15000]).nice();
    
            g.append("g")
            .selectAll("g")
            .data(timeMinistryNest)
            .enter().append("g")
            .attr("transform", function(d) { 
                return "translate(" + x0(d.key) + ",0)"; 
            })
            .selectAll("rect")
            .data(function(d) { 
                return d.values
            })
            .enter()
            .append("rect")
            .attr("x", function(d) { 
                return x1(d.ministry);
            }) 
            .attr("y", function(d) { 
                return y(d[d.ministry]);
            })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) { 
                return height - y(d[d.ministry]); 
            })
            .attr("fill", function(d) { 
                return z(d.ministry); 
            })
            .on("mouseover",function(d){
                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("display", "inline-block")
                    .html(d.total);
            }).on("mouseout", function(d){ 
                tooltip.style("display", "none");
            });;
    
            g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));
    
            g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Amount in Millions (SGD)");
    
            var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(100," + (i * 20 - 100) + ")"; });
    
            legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);
    
            legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });
    
        } //Grouped graph END

}]);
