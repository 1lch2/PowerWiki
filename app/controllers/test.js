const request = require('request');
const querystring = require('querystring');
// var model = require('../models/models')


// var wiki_url = "https://en.wikipedia.org/w/api.php";
// var parameter = "action=query&format=json&prop=revisions&"+
//     `titles=${reqdata.article}&rvstart=${result.last_date.toISOString()}`+
//     "&revir=newer&rvprop=timestamp|userid|user|ids&rvlimit=max";
// var url = wiki_url + "?" + parameter;

function testRequest(title) {
    const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=" +
        querystring.escape(title) +
        "&rvend=2020-04-20T04:04:02Z&rvlimit=10&revir=newer&rvprop=timestamp|userid|user|ids";
    var updated_list = [];

    request(url, function (error, response, data) {
        if(error){
            console.log(error)
        }else if(response.statusCode != 200){
            console.log(response.statusCode)
        }else {
            var pages = JSON.parse(data).query.pages
            var rev_list = pages[Object.keys(pages)[0]].revisions;
            if (rev_list.length > 0){
                for (let i=0; i< rev_list.length; i++){
                    var single_rev = rev_list[i]
                    var current_time = new Date();
                    var rev_time = new Date(single_rev.timestamp)

                    // Skip the same revision
                    if (single_rev.timestamp == "2020-02-20T04:04:02Z") {
                        continue;
                    }

                    // Build the revision data
                    var temp_rev = {
                        "title": querystring.escape(title),
                        "timestamp": single_rev.timestamp,
                        "user": single_rev.user,
                    }
                    updated_list.push(temp_rev)
                }
                console.log(updated_list)
            }
        }
    });
}

function testAjaxDone() {
    $.ajax({
        url: 'www.google.com',
        type: 'GET',
        dataType: 'html',
        success: function (res) {
            console.log(res)
        }
    }).done(function () {
        console.log("done")
    })
}

function testReddit() {
    var url = "https://www.reddit.com/r/news/search.json?q="
        + "Australia"
        + "&restrict_sr=on&sort=top&t=all&limit=3"
    request(url, function (error, response, data) {
        if(error){
            console.log(error)
        }else if(response.statusCode != 200){
            console.log(response.statusCode)
        }else {
            var posts = JSON.parse(response.body).data.children

            for (var s of posts){
                console.log(s.data.title)
            }
        }
    });
}

// // DB test script
// $.get({url: "/analytic/view_overall"})
// testRequest()
// db.revisions.aggregate([
//     {
//         $match: { "title": "U2", "user": "Merbabu" }
//     },
//     {
//         $group: {
//             _id: { year: { $year: "$date" } },
//             count: { $sum: 1 }
//         }
//     },
//     {
//         $sort: { "_id": 1 }
//     }
// ])

// $project : {
//     title: "$title",
//         timestamp: "$timestamp"
// }

function testFindJSNO(jsonlist) {
    var newArr = jsonlist.filter(function(p){
        return p._id.title === "Australia";
    });
    console.log(newArr)
}

// testFindJSNO([
//     { "_id" : { "title" : "Australia" }, "count" : 16245 },
//     { "_id" : { "title" : "Barack Obama" }, "count" : 27532 },
//     { "_id" : { "title" : "Bob Dylan" }, "count" : 16137 },
//     { "_id" : { "title" : "Canada" }, "count" : 21338 },
//     { "_id" : { "title" : "Chelsea F.C." }, "count" : 18269 },
//     { "_id" : { "title" : "Elvis Presley" }, "count" : 19010 }
// ])
testRequest("Australia")
