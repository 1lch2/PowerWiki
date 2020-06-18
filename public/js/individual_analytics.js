google.charts.load('current', { packages: ['corechart'] });

$(document).ready(function() {
    $('select').on('contentChanged', function() {
        $(this).formSelect();
    });
    $('#selectUser').css('display', 'none');
    updateDropdown();
    $("#searchArticle").click(displaySummary);
    $('#showDistributionBar').click(showDistributionBar);
    $('#showDistributionPie').click(showDistributionPie);
    $('#distributionBarByUser').click(showTop5UserBar);
})

// Fill the dropdown list with articles and their revision numbers
function updateDropdown() {
    var article_list = []
    $.ajax({
        type: 'GET',
        url: '/analytic/get_all_articles',
        dataType: 'JSON',
        success: function(res) {
            article_list = res
        },
        error: function(xhr) {
            M.toast({ html: "Error in updateDropdown: " + xhr.status + " " + xhr.statusText })
        }
    }).done(function() {
        for (s of article_list) {
            var title = s._id.title;
            var rev_num = s.count;
            var option = `<option value="${title}">${title} (${rev_num})</option>`;
            $('#selected_article').append(option);
            $("#selected_article").trigger('contentChanged');
        }
    })
}

// Check if the selected article is up-to-date
function checkArticle() {
    var formdata = {
        "title": $("#selected_article").val()
    }

    $.ajax({
        type: 'GET',
        url: '/analytic/view_individual',
        data: formdata,
        dataType: 'JSON',
        success: function(res) {
            if (!res.is_uptodate) {
                updateArticle(res);
            } else {
                M.toast({ html: "Article is up-to-date." })
            }
        },
        error: function(xhr) {
            M.toast({ html: "Error in checkArticle: " + xhr.status + " " + xhr.statusText })
        }
    });
}

// Update revision for the selected article
function updateArticle(formdata) {
    var update_num = 0;

    $.ajax({
        type: 'GET',
        url: '/analytic/update_article',
        data: formdata,
        dataType: 'JSON',
        success: function(res) {
            update_num = res.updated_num;
        },
        error: function(xhr) {
            M.toast({ html: "Error in updateArticle: " + xhr.status + " " + xhr.statusText })
        }
    }).done(function() {
        if (update_num > 0) {
            var message = "Updated " + update_num + " revisions, refresh to see new article list.";
            // $('#updateData').html(`<h6 class="teal-text">${message}</h6>`);
            M.toast({ html: message });
        } else {
            M.toast({ html: "No new revisions on wiki." });
        }
    })

}

// Display summary imformation for the selected article.
function displaySummary() {
    var formdata = { "title": $("#selected_article").val() }
    var summary = {
        "title": formdata.title,
        "revision_num": 0,
        "top5_user": [],
        "top5_user_rev": []
    }

    $.ajax({
        type: 'GET',
        url: '/analytic/view_article_summary',
        data: formdata,
        dataType: 'JSON',
        success: function(res) {
            checkArticle();
            summary.revision_num = res.revision_num;
            summary.top5_user = res.top5_user;
            summary.top5_user_rev = res.top5_user_rev;
        },
        error: function(xhr) {
            M.toast({ html: "Error in displaySummary: " + xhr.status + " " + xhr.statusText })
        }
    }).done(function() {
        $('#individualChart').empty();

        var table_element = "<table><thead><tr><th>Title</th><th>Total number of revisions</th></tr></thead><tbody>"
        var table_body = `<tr><td>${formdata.title}</td><td>${summary.revision_num}</td></tr>`

        $("#titleplace").empty();
        $("#titleplace").append(table_element + table_body + "</tbody></table>");

        var table_head = "<table><thead><tr><th>Top 5 users</th><th>Number of revisions</th></tr></thead><tbody>"
        for (var s of summary.top5_user) {
            var table_temp = `<tr><td>${s._id.user}</td><td>${s.count}</td></tr>`
            table_head += table_temp
        }

        $("#topFiveUser").empty();
        $("#topFiveUser").append(table_head + "</tbody></table>")

    }).then(function() {
        getRedditPosts(formdata);
        updateUserName();
        $('#selectUser').css('display', '');
    })
}

// Call Reddit API
function getRedditPosts(formdata) {
    var posts = []

    $.ajax({
        method: 'GET',
        url: '/analytic/get_reddit_posts',
        data: formdata,
        dataType: 'JSON',
        success: function(res) {
            posts = res
        },
        error: function(xhr) {
            M.toast({ html: "Error in getRedditPosts: " + xhr.status + " " + xhr.statusText })
        }
    }).done(function(posts) {
        $("#posts").empty();
        var table_head = "<table><thead><tr><th>Reddit r/news</th></tr></thead><tbody>";

        if (posts.length == 0) {
            table_head += '<tr><td>No reddits news found</td>'
        } else {
            for (each of posts) {
                var table_body = `<tr><td><a href="${each.url}">${each.title}</a></td></tr>`;
                table_head += table_body
            }
        }

        table_head += "</tbody></table>"

        $("#posts").append(table_head);
    })
}

function updateUserName() {
    $('#select_top_user').empty();
    var formdata = { "title": $("#selected_article").val() }
    $.get('/analytic/view_article_summary', formdata, (res) => {
        for (each of res.top5_user) {
            $('#select_top_user').append(`<option value="${each._id.user}">${each._id.user}</option>`);
            $('#select_top_user').trigger('contentChanged');
        }
    })
}

function showDistributionBar() {
    var formdata = { "title": $("#selected_article").val(), "user": $("select_top_user").val() }
    $.get('/analytic/get_individual_chart', formdata, (res) => {
        drawBar(res.bar_year_and_usertype, '#individualChart');
    })
}

function showDistributionPie() {
    var formdata = { "title": $("#selected_article").val(), "user": $("select_top_user").val() }
    $.get('/analytic/get_individual_chart', formdata, (res) => {
        drawPie(res.pie_usertype, '#individualChart');
    })
}

function showTop5UserBar() {
    var formdata = { "title": $("#selected_article").val(), "user": $("#select_top_user :selected").val() }
    $.get('/analytic/get_individual_chart', formdata, res => {
        var graphData = new google.visualization.DataTable();
        graphData.addColumn('string', 'Year');
        graphData.addColumn('number', 'Revisions');
        $.each(res.bar_year_top5, function(key, val) {
            graphData.addRow([val._id.year.toString(), val.count]);
        });
        // chart title
        var options = setChartTitle('User revisions by year');
        var chart = new google.visualization.ColumnChart($('#individualChart')[0])
        chart.draw(graphData, options);
    })
}

// set title for chart
function setChartTitle(title) {
    return {
        'title': title,
        'width': 1000,
        'height': 800,
    }
}

// distribution pie chart
function drawPie(data, selector) {
    var graphData = new google.visualization.DataTable();
    graphData.addColumn('string', 'User');
    graphData.addColumn('number', 'Number');
    $.each(data, function(key, val) {
        graphData.addRow([val._id.usertype, val.count]);
    });

    // chart title
    var options = setChartTitle('Distribution of user type by year');
    var chart = new google.visualization.PieChart($(selector)[0])
    chart.draw(graphData, options);
}

// distribution bar charts
function drawBar(data, selector) {
    var graphData = new google.visualization.DataTable();
    graphData.addColumn('string', 'Year');
    graphData.addColumn('number', 'Admin user');
    graphData.addColumn('number', 'Anonymous user');
    graphData.addColumn('number', 'Bot user');
    graphData.addColumn('number', 'Regular user');
    $.each(data, function(key, val) {
        graphData.addRow([val._id.year.toString(), val.admin, val.anonymous, val.bot, val.regular]);
    });
    // chart title
    var options = setChartTitle('Distribution by user type');
    var chart = new google.visualization.ColumnChart($(selector)[0])
    chart.draw(graphData, options);
}