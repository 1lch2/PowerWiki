var db = require('./db.js');
var fs = require('fs');
var readline = require('readline');

//User schema for storing and varifing user infomation
var userSchema = db.Schema({
    emailAddress: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    securityQuesion: {
        type: String,
        required: true
    },
    answerForSecurityQuestion: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, {
    versionKey: false
})

//User sign up
userSchema.statics.signUp = function(signUpData) {
    var newUser = {
            emailAddress: signUpData.email,
            firstName: signUpData.firstname,
            lastName: signUpData.lastname,
            securityQuesion: signUpData.question,
            answerForSecurityQuestion: signUpData.answer,
            password: signUpData.pwd
        }
        //Use create instead of insert or insertOne, since mongoose doesn't have these two
    return this.create(newUser)
}

//User sign in
userSchema.statics.signIn = function(signInData) {
    var user = {
        emailAddress: signInData.email,
        password: signInData.pwd
    }
    console.log(this.find(user).exec());
    return this.find(user).exec();
}

//User reset the PWD
userSchema.statics.resetPWD = function(resetData) {
    var query = {
        "emailAddress": resetData.email,
        "securityQuesion": resetData.question,
        "answerForSecurityQuestion": resetData.answer,
        "password": resetData.old_pwd
    }
    var update = {
        $set: { "password": resetData.new_pwd }
    }
    var options = {
        new: true,
        rawResult: true
    }

    return this.findOneAndUpdate(
        query,
        update,
        options,
        function(err, doc) {
            if (err) {
                console.log("FindOneAndUpdat: " + err);
            } else {
                console.log(JSON.stringify(doc))
            }
        }
    )
}

var user = db.model('User', userSchema, 'users');

//Wiki_pedia user schema
// var botUserSchema = new db.Schema(
//     {
//         user: String,
//         usertype: String
//     },
//     {
//         versionKey: false
//     }
// );

// var botUser = db.model('BotUser', botUserSchema)


// var adminUserSchema = db.Schema(
//     {
//         user: String,
//         usertype: String
//     },
//     {
//         versionKey: false
//     }
// );

// var adminUser = db.model('AdminUser', adminUserSchema)

// function addTextToModel(model, text, type){
//     const fileStream = fs.createReadStream(text);

//     const rl = readline.createInterface({
//         input: fileStream,
//         console: false
//     })

//     rl.on('line',function(line){
//         //console.log(line);
//         model.create(JSON.parse("{\"user\" :\"" + line.toString() + "\"," +
//         "\"usertype\" :\"" + type.toString() + "\"}" ));
//     })
// }

// addTextToModel(botUser, "../../public/data/Dataset_22_March_2020/bots.txt", "bot")
// addTextToModel(adminUser, "../../public/data/Dataset_22_March_2020/administrators.txt", "admin")

//Revision Schema for revision record
var revisionSchema = new db.Schema({
    anon: Boolean,
    user: String,
    timestamp: String,
    title: String,
    usertype: String,
    date: Date
}, {
    versionKey: false
});

/*-----------------------------------
         Overview Analytics
------------------------------------*/

// The top two articles with the highest number of revisions and their number of revisions.
// The top two articles with the lowest number of revisions and their number of revisions.
revisionSchema.statics.findArticlesAndRevisionNumber = function(direction = 1, limits = 2, callback) {
    pipeline = [{
            $group: { _id: "$title", count: { $sum: 1 } }
        },
        {
            $sort: { count: direction }
        },
        {
            $limit: limits
        }
    ]
    return this.aggregate(pipeline).exec(callback);
}

// The top two articles edited by the largest group of registered users (non bots) and their group size. 
// Each wiki article is edited by a number of users, some making multiple revisions. 
// The number of unique users is a good indicator of an article’s popularity.
// The top two articles edited by the smallest group of registered users and their group size.
revisionSchema.statics.findArticlesAndRevisionNumberFromRegisteredUsers = function(direction = 1, limits = 2, callback) {
    pipeline = [
    {    
        $match: { usertype: { $not: { $eq: "bot" }}}
    },
    {
        $match: { usertype: { $not: { $eq: "anonymous" }}}
    },
    {
        $group: {
            _id: { title: "$title" },
            count: { $sum: 1 }
        }
    },
    {
        $sort: { count: direction }
    },
    {
        $limit: limits
    }
    ]
    return this.aggregate(pipeline).exec(callback);
}



// The top two articles with the longest history (measured by age) and and their age (in days). 
// For each article, the revision with the smallest timestamp is the first revision,
// indicating the article’s creation time.
// An article’s age is the duration between now and the article's creation time.
// The top two articles with the shortest history (measured by age) and their age (in days).
revisionSchema.statics.findArticlesWithHistoryAndDuration = function(direction = 1, limits = 2, callback) {
        pipeline = [{
                $group: {
                    _id: { title: "$title" },
                    createdTime: { $min: "$date" }
                }
            },
            {
                $sort: { createdTime: direction }
            },
            {
                $limit: limits
            },
            {
                $project: {
                    title: "$title",
                    daysSinceCreatedTime: {
                        $trunc: { $divide: [{ $subtract: [new Date(), "$createdTime"] }, 1000 * 60 * 60 * 24] }
                    }
                }
            }
        ]
        return this.aggregate(pipeline).exec(callback);
    }
    // The user should be provided with a way to change the number of top articles shown, e.g. for highest and lowest number of revisions. The selected number should be applied to all categories above

//A bar chart of revision number distribution by year and by user type across the whole dataset. 
//There should also be an option to switch between bar chart and line chart.
revisionSchema.statics.getRevisionNumberByYearAndByUserType = function(callback) {
    pipeline = [{
            $group: {
                _id: { year: { $year: "$date" } },
                regular: {
                    $sum: { $cond: [{ $eq: ["$usertype", "regular"] }, 1, 0] }
                },
                anonymous: {
                    $sum: { $cond: [{ $eq: ["$usertype", "anonymous"] }, 1, 0] }
                },
                admin: {
                    $sum: { $cond: [{ "$eq": ["$usertype", "admin"] }, 1, 0] }
                },
                bot: {
                    $sum: { $cond: [{ "$eq": ["$usertype", "bot"] }, 1, 0] }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]
    return this.aggregate(pipeline).exec(callback);
}

//A pie chart of revision number distribution 
//by user type across the whole data set
revisionSchema.statics.getRevisionNumberByUserType = function(callback) {
    pipeline = [{
        $group: {
            _id: { usertype: "$usertype" },
            count: { $sum: 1 }
        }
    }]
    return this.aggregate(pipeline).exec(callback);
}


/*-----------------------------------
    Individual article analytics
------------------------------------*/
//Get all available articles title in the data set
//also show total number of revisions, next to the article title in the drop-down list
revisionSchema.statics.getAllAvaliableArticlesTitle = function(callback) {
    pipeline = [{
            $group: {
                _id: { title: "$title" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]
    return this.aggregate(pipeline).exec(callback);
}

//Once an end user selects an article, your application needs to check 
//if the history of that article in the database is up to date. 
//Return the most recent date, i.e. last modified date in the database
revisionSchema.statics.isArticleUpToDate = function(title, callback) {
    pipeline = [{
            $match: { "title": title }
        },
        {
            $sort: { "date": -1 }
        },
        {
            $limit: 1
        },
        {
            $project: {
                title: "$title",
                timestamp: "$timestamp"
            }
        }
    ]
    return this.aggregate(pipeline).exec(callback);
}

//This is for inserting the new revisions accquired from querrying wiki-API
//These revisions will have the same title
revisionSchema.statics.insertRevisions = function(revisionList, callback) {
    //Ordered is false, therefore it will try to insert any records instead of failling the whole process when encountering an error
    options = { "ordered": false }
    return this.insertMany(revisionList, options, callback)
}

revisionSchema.statics.updateNewRevisions = function(title){
    return this.updateMany({
        "title": title,
        "date": { $exists: false }
    },
    [ 
    {
        $set: {
            "date": {
                $dateFromString: { dateString: "$timestamp" }
            }
        }
    }
    ],
    function(err){
        if(err){
            console.log(err);
        }
    }
    )
}

/*-----------------------------------------------------------*/
//For the selected article, display the following summary information:

//The title (see above .getAllAvaliableArticlesTitle())

//The total number of revisions (see above .getAllAvaliableArticlesTitle())

//The top 5 regular users ranked by total revision numbers on this article, 
//and the respective revision numbers
revisionSchema.statics.topFiveUsersOfOneArticleRankedByRevisionNumbers = function(title, callback) {
    pipeline = [{
            $match: { "title": title, "usertype": "regular" }
        },
        {
            $group: {
                _id: { user: "$user" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "count": -1 }
        },
        {
            $limit: 5
        }
    ]
    return this.aggregate(pipeline).exec(callback)
}

//The top 3 news about the selected individual article obtained using Reddit API. 
//You need to show the top 3 posts 
//from r/news
//from "all time" by showing the titles and the correspond links. 
//For example. if the selected individual article is "Australia", 
//then you need to search for "Australia" in the subreddit r/news 
//and show a list like this:


//A bar chart of revision number 
//distributed by year and by user type for this article.
revisionSchema.statics.getYearAndUsertypeDistributionOfOneArticle = function(title, callback) {
    var pipeline = [{
            $match: { "title": title }
        },
        {
            $group: {
                _id: { year: { $year: "$date" } },
                regular: {
                    $sum: { $cond: [{ $eq: ["$usertype", "regular"] }, 1, 0] }
                },
                anonymous: {
                    $sum: { $cond: [{ $eq: ["$usertype", "anonymous"] }, 1, 0] }
                },
                admin: {
                    $sum: { $cond: [{ $eq: ["$usertype", "admin"] }, 1, 0] }
                },
                bot: {
                    $sum: { $cond: [{ $eq: ["$usertype", "bot"] }, 1, 0] }
                }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]
    return this.aggregate(pipeline).exec(callback)
}

//A pie chart of revision number 
//distribution based on user type for this article.
revisionSchema.statics.getUsertypeDistributionOfOneArticle = function(title, callback) {
    var pipeline = [{
            $match: { "title": title }
        },
        {
            $group: {
                _id: { usertype: "$usertype" },
                count: { $sum: 1 },
            }
        }
    ]
    return this.aggregate(pipeline).exec(callback)
}

//A bar chart of revision number distributed by year made by one of the top 5 regular users 
//for this article. 
//For this chart, you need provide a way to select a user from the top 5 list.
revisionSchema.statics.getTopFiveRegularUsers = function(title, callback) {
    var pipeline = [{
            $match: { "title": title }
        },
        {
            $group: {
                _id: { user: "$user" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 5
        }
    ]
    return this.aggregate(pipeline).exec(callback)
}

revisionSchema.statics.getRevisionDistributionByYearMadeFromOneUserToOneArticle = function(title, user, callback) {
    var pipeline = [{
            $match: { "title": title, "user": user }
        },
        {
            $group: {
                _id: { year: { $year: "$date" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]
    return this.aggregate(pipeline).exec(callback)
}

/*-----------------------------------
          Author analytics
------------------------------------*/
//Return all authors including admin, bot and regular users
revisionSchema.statics.getAllAuthors = function(callback) {
        pipeline = [{
                $group: {
                    _id: "$user",
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]
        return this.aggregate(pipeline).exec(callback)
    }
    //After selecting an author, return the articles made by the author with the revisions counts and timestamp
revisionSchema.statics.getAllArticlesAndNumberMadeByAuthor = function(author, callback) {
    var pipeline = [{
            $match: { "user": author }
        },
        {
            $group: {
                _id: { user: "$user", title: "$title" },
                count: { $sum: 1 },
                timestamp: { $addToSet: "$timestamp" }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]
    return this.aggregate(pipeline).exec(callback)
}

var revisions = db.model("Revision", revisionSchema);

function readTextAndUpdateUsertypeForRevison(file, type) {
    const fileStream = fs.createReadStream(file);

    const rl = readline.createInterface({
        input: fileStream,
        console: false
    })

    rl.on('line', function(line) {
        //console.log(line);
        let username = line.trim();
        revisions.updateMany({ user: username }, { $set: { usertype: type } }, { multi: true }).exec(function(err) {
            if (err) {
                console.log(err)
            }
        })
    })
}

// -----------------------------------------
// ------Disabled following for test--------
// -----------------------------------------

// Use abslout path here
readTextAndUpdateUsertypeForRevison("D:\\Workspace\\Github-workspace\\COMP5347_Assignment_2/public/data/Dataset_22_March_2020/administrators.txt", "admin")
readTextAndUpdateUsertypeForRevison("D:\\Workspace\\Github-workspace\\COMP5347_Assignment_2/public/data/Dataset_22_March_2020/bots.txt", "bot")

revisions.updateMany(
    {anon:{$exists:true}},
    { $set:{"usertype":"anonymous"}},
    function(err){
      if(err){
        console.error(err)
      }
    })

revisions.updateMany(
    { usertype:{$exists:false}},
    { $set:{"usertype":"regular"}},
    function(err){
      if(err){
        console.error(err)
      }
    })

revisions.updateMany(
    {},
    [
    {
        $set:
        {
            "date":
            {
                $dateFromString :{ dateString: "$timestamp"}
            }
        }
    }
    // {
    //     $unset : ["timestamp","revid","parentid","minor","userid","size","sha1","parsedocument"]
    // }
    ],
    function(err){
        if(err){
            console.error(err)
        }
    }
)

module.exports = { user, revisions };