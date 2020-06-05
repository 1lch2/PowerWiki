var model = require('../models/models')
var request = require('request')
var querystring = require('querystring')

/*-----------------------------------
    Overview analytics
------------------------------------*/
async function DBQueryExtremeRevisions(limit, returns) {
    let _ = await Promise.all([
        model.revisions.findArticlesAndRevisionNumber(-1, limit).then((result) => {
            returns.top_revision.highest = result
        }),
        model.revisions.findArticlesAndRevisionNumber(1, limit).then((result) => {
            returns.top_revision.lowest = result
        }),
        model.revisions.findArticlesAndRevisionNumberFromRegisteredUsers(-1, limit).then((result) => {
            returns.top_edit.largest = result
        }),
        model.revisions.findArticlesAndRevisionNumberFromRegisteredUsers(1, limit).then((result) => {
            returns.top_edit.smallest = result
        }),
        model.revisions.findArticlesWithHistoryAndDuration(1, limit).then((result) => {
            returns.top_history.longest = result
        }),
        model.revisions.findArticlesWithHistoryAndDuration(-1, limit).then((result) => {
            returns.top_history.shortest = result
        })
    ])
    return returns
}

function viewOverall(req, res) {
    let reqdata = req.query;

    var returns = {
        "top_revision": {},
        "top_edit": {},
        "top_history": {}
    };

    var limit = parseInt(reqdata.topnum);
    DBQueryExtremeRevisions(limit, returns).then((result) => {
        res.send(result)
    })
}

async function DBQueryDistribution(returns) {
    let _ = await Promise.all([
        model.revisions.getRevisionNumberByUserType().then((result) => {
            returns.by_usertype = result
        }),
        model.revisions.getRevisionNumberByYearAndByUserType().then((result) => {
            if (result[0]._id.year == null) {
                returns.by_year = result.slice(1,)
            } else {
                returns.by_year = result
            }

        })
    ])
    return returns
}

// Send query to DB and get the distribution of users.
function viewDistribution(req, res) {
    var returns = {
        "by_usertype": [],
        "by_year": []
    }
    DBQueryDistribution(returns).then((result) => {
        res.send(result)
    })
}

/*-----------------------------------
    Individual article analytics
------------------------------------*/

// Get all articles
function getAllArticlesAndRevisions(req, res) {
    model.revisions.getAllAvaliableArticlesTitle().then((result) => {
        res.send(result)
    })
}

// Get information for the selected article.
function getArticleInfo(req, res) {
    let reqdata = req.query;
    const DAY_MILISEC = 1000 * 60 * 60 * 24;
    var returns = {}

    model.revisions.isArticleUpToDate(reqdata.title).then((result) => {
        var current_time = new Date();
        var last_rev_time = new Date(result[0].timestamp);
        if ((current_time - last_rev_time) / DAY_MILISEC > 1) {
            returns.is_uptodate = false;
        } else {
            returns.is_uptodate = true;
        }
        returns.title = result[0].title
        returns.timestamp = result[0].timestamp
        return returns
    }).then((result) => {
        res.send(result)
    })
}

async function DBUpdateRevisions(revisions) {
    let _ = await Promise.all([
        model.revisions.insertRevisions(revisions)
    ])
    return {"updateStat": "success"}
}

// Update article`s revisions by calling Wikipedia`s API.
function updateArticle(req, res) {
    let reqdata = req.query;
    const wiki_url = "https://en.wikipedia.org/w/api.php";

    // // Test case
    // var url = "https://en.wikipedia.org/w/api.php" +
    //     "?action=query&format=json&prop=revisions&titles=Australia&rvlimit=5&rvprop=timestamp|userid|user|ids"

    var parameter = "action=query&format=json&prop=revisions&" +
        `titles=${querystring.escape(reqdata.title)}&rvend=${reqdata.timestamp}` +
        "&revir=newer&rvprop=timestamp|userid|user|ids&rvlimit=max";

    var updated_list = [];
    request(wiki_url + "?" + parameter, function (error, response, data) {
        if (error) {
            console.log(error)
        } else if (response.statusCode != 200) {
            console.log(response.statusCode)
        } else {
            var pages = JSON.parse(data).query.pages
            var rev_list = pages[Object.keys(pages)[0]].revisions;
            if (rev_list.length > 0) {
                for (let i = 0; i < rev_list.length; i++) {
                    var single_rev = rev_list[i]
                    var current_time = new Date();
                    var rev_time = new Date(single_rev.timestamp)

                    // Skip the same revision
                    if (single_rev.timestamp == reqdata.timestamp) {
                        continue;
                    }

                    // Build the revision data
                    var temp_rev = {
                        "title": reqdata.title,
                        "timestamp": single_rev.timestamp,
                        "user": single_rev.user,
                        "usertype": "regular"
                    }
                    updated_list.push(temp_rev)
                }
                // Update revisions in DB
                DBUpdateRevisions(updated_list).then((result) => {
                    model.revisions.updateNewRevisions(reqdata.title)
                })
                // Send updated length
                res.send({"updated_num": updated_list.length})
            }
        }
    });
}

async function DBQuerySingleArticle(title, returns) {
    let _ = await Promise.all([
        model.revisions.getAllAvaliableArticlesTitle().then((result) => {
            var single = result.filter(function (p) {
                return p._id.title === title;
            });
            returns.revision_num = single[0].count
        }),
        model.revisions.topFiveUsersOfOneArticleRankedByRevisionNumbers(title).then((result) => {
            returns.top5_user = result
        })
    ])
    return returns
}

// Show the summary information for the selected article
function viewArticleSummary(req, res) {
    var reqdata = req.query;
    var returns = {
        "revision_num": 0,
        "top5_user": []
    }

    DBQuerySingleArticle(reqdata.title, returns).then((result) => {
        res.send(returns)
    })
}

// Call Reddit API to get top 3 rated posts
function getRedditPosts(req, res) {
    var reqdata = req.query
    var url = "https://www.reddit.com/r/news/search.json?q=" +
        reqdata.title +
        "&restrict_sr=on&sort=top&t=all&limit=3"

    var returns = []

    request(url, function (error, response, data) {
        if (error) {
            console.log(error)
        } else if (response.statusCode != 200) {
            console.log(response.statusCode)
        } else {
            var posts = JSON.parse(response.body).data.children
            for (var s of posts) {
                var temp = {
                    "title": s.data.title,
                    "url": s.data.url
                }
                returns.push(temp)
            }
        }
        res.send(returns)
    })
}

async function DBQueryIndividualDistribution(title, user, returns) {
    let _ = await Promise.all([
        model.revisions.getYearAndUsertypeDistributionOfOneArticle(title).then((result) => {
            if (result[0]._id.year == null) {
                returns.bar_year_and_usertype = result.slice(1,)
            } else {
                returns.bar_year_and_usertype = result
            }
        }),
        model.revisions.getUsertypeDistributionOfOneArticle(title).then((result) => {
            returns.pie_usertype = result
        }),
        model.revisions.getRevisionDistributionByYearMadeFromOneUserToOneArticle(title, user).then((result) => {
            returns.bar_year_top5 = result
        })
    ])
    return returns
}

// Get distribution for individual article
function viewIndividualDistribution(req, res) {
    var title = req.query.title;
    var user = req.query.user;

    var returns = {
        "bar_year_and_usertype": [],
        "pie_usertype": [],
        "bar_year_top5": []
    }

    DBQueryIndividualDistribution(title, user, returns).then((result) => {
        res.send(result)
    })
}

/*-----------------------------------
          Author analytics
------------------------------------*/

// Get all authors
function getAllAuthors(req, res) {
    model.revisions.getAllAuthors().then((result) => {
        res.send(result.slice(2, -1))
    })
}

// Get articles and revision numbers by the selected author.
function viewArticleChangedByAuthor(req, res) {
    var reqdata = req.query;
    var returns = [{
        "title": "",
        "timestamps": [], // Timestamps of all revisions for this article
        "revision_num": 0
    }];

    model.revisions.getAllArticlesAndNumberMadeByAuthor(reqdata.author).then((result) => {
        res.send(result)
    })
}


module.exports = {
    viewOverall,
    viewDistribution,
    getAllArticlesAndRevisions,
    getArticleInfo,
    updateArticle,
    viewArticleSummary,
    getRedditPosts,
    viewIndividualDistribution,
    getAllAuthors,
    viewArticleChangedByAuthor
};