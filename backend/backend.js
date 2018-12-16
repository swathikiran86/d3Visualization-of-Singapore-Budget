var mysqldb = require('./mysqldb.js');
var queryString;

//Query to fetch total yearly expenditure based on sectors
var getYearlyExpenditure = function(request,response){
    queryString = " SELECT financial_year,sector,SUM(amount) AS total_amount FROM gov_total_exp WHERE financial_year between 1999 AND 2018 GROUP BY financial_year, sector ORDER BY financial_year ; ";
    //queryString = " SELECT financial_year,sector,SUM(amount) AS total_amount FROM gov_total_exp WHERE exp_type = '" +  + "' GROUP BY financial_year, sector ORDER BY financial_year ; ";
    mysqldb.query(queryString,function(error,result,fields){
        if(error){
            console.log("error "+ JSON.stringify(error));
        }else{
            response.send(JSON.stringify(result));
            //response.sendStatus(200);
        }
    });
};

//Query to fetch the ministry wise expenditure per sector per year
var getSectorMinistryExpenditure = function(request,response){
    //console.log(request.body);
    //queryString = " SELECT ministry, SUM(amount) as total_ministry_amount FROM gov_total_exp WHERE financial_year = "+ request.body.year + " AND sector = '" + request.body.sector + "' GROUP BY ministry ; ";
    queryString = " SELECT ministry, exp_type, amount FROM gov_total_exp WHERE financial_year = "+ request.body.year + " AND sector = '" + request.body.sector + "' GROUP BY ministry, exp_type, amount ORDER BY ministry, exp_type;  ";
    mysqldb.query(queryString,function(error,result,fields){
        if(error){
            console.log("error "+ JSON.stringify(error));
        }else{
            var results = [];
            for(var i=0; i<result.length; i+=2){
                var temp = {}, key1, key2;
                if(result[i].ministry == result[i+1].ministry){
                    temp.ministry = result[i].ministry;
                    key1 = result[i].exp_type;
                    key2 = result[i+1].exp_type;
                    temp[key1] = result[i].amount;
                    temp[key2] = result[i+1].amount;
                    //temp.total = result[i].amount + result[i+1].amount
                }
                results.push(temp);
            }
            response.send(JSON.stringify(results));
            //response.sendStatus(200);
        }
    });
};


/* SELECT financial_year,  ministry, SUM(amount)
FROM gov_total_exp
WHERE  financial_year BETWEEN 2014 AND 2018 AND sector like "Government Administration"
GROUP BY financial_year, ministry
ORDER BY financial_year;
 */

//Query to fetch the ministry wise expenditure for five years based on type
var getTypeMinistryExpenditure = function(request,response){
    queryString = " SELECT financial_year,  ministry, exp_type, amount FROM gov_total_exp WHERE  financial_year BETWEEN " + (request.body.year - 4) + " AND " + request.body.year + " AND sector like '" + request.body.sector  + "' GROUP BY financial_year, ministry, exp_type, amount ORDER BY financial_year;  ";
    mysqldb.query(queryString,function(error,result,fields){
        if(error){
            console.log("error "+ JSON.stringify(error));
        }else{
            var results = [];
            for(var i=0; i<result.length; i+=2){
                var temp = {}, key1, key2, key3, total;
                if(result[i].ministry == result[i+1].ministry){
                    temp.financial_year = result[i].financial_year;
                    temp.ministry = result[i].ministry;
                    key1 = result[i].exp_type;
                    key2 = result[i+1].exp_type;
                    temp[key1] = result[i].amount;
                    temp[key2] = result[i+1].amount;
                    total = result[i].amount + result[i+1].amount;
                    temp.total = total;
                    key3 = result[i].ministry;
                    temp[key3] = total;
                }
                results.push(temp);
            }
            response.send(JSON.stringify(results));
            //response.sendStatus(200);
        }
    });
};





module.exports = {
    getYearlyExpenditure : getYearlyExpenditure,
    getSectorMinistryExpenditure : getSectorMinistryExpenditure,
    getTypeMinistryExpenditure : getTypeMinistryExpenditure
}