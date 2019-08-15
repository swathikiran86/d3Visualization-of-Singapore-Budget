# d3v5Visualization

Visualization of budget expenditure of Singapore (known to be the quickest nation to develop in a short span) using D3 JS, AngularJS, NodeJS and MySQL. This study is to analyze their budget expenditures for over the last 2 decades; not just with the numbers but also in specific areas where the money was/is being invested.
The below are the questions I would like to investigate by visualizing their budget expenditure data.
1) Which is the most funded sector amongst all the sectors and why?
2) Any drastic changes in their expenditure in recent years?
3) Which is the most funded ministry and why?

Dataset
Singapore budget expenditure data is available on Singapore Government data website. The dataset has been picked up from the below link: https://data.gov.sg/dataset/government-fiscal-position-annual?resource_id=7b4af397- 3e8f-40de-9208-90d168afc810

Results:

Screenshots available in the Results folder for each graph.

1. Graph One - Multiple-Line graph
This graph illustrates the growth of expenditures in million Singapore Dollars (SGD) within its major sectors for past 20 years. Each line in the graph represents a sector. On hovering over the Sector line, the Sector’s Name is highlighted on both top and bottom, and on hovering on the sector’s name in the bottom the respective line is highlighted. By clicking on the sector’s name, you will be redirected to “Graph two”.
Also, each circular data point represents the amount spent on each sector on that particular year. On hovering over this circular point, the value is highlighted and will be redirected to “Graph three” when clicked.

2. Graph two - Grouped Bar chart
This chart shows the amount spent in various ministries under each sector over 5 years of period. This chart provides the comparison between investments in made by each ministry under selected sector. There is a dropdown menu present on the left side of the graph to change the time scale for comparison. This graph is viewed when we click on the sector legend that is seen in the “graph one”

3. Graph three - Stacked Bar graph
The idea of this graph is to present in detail of the amount in each ministry under the selected sector for any particular selected year. This graph can be viewed when the selection of particular point is made in the “graph one”. Stacked Bar graph is used to here to describe the relationship between the components(type) of the components(ministries). Legend color specifies the type of expenditure in each ministry.
