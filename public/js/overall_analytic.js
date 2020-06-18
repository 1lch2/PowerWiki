google.charts.load('current', { packages: ['corechart'] });

// set title for chart
function setChartTitle(title) {
    return {
        'title': title,
        'width': 1000,
        'height': 800,
    }
}

function scrollToTop() {
    $('html,body').scrollTop(0);
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
        graphData.addRow([val._id.year, val.admin, val.anonymous, val.bot, val.regular]);
    });
    // chart title
    var options = setChartTitle('Distribution by user type');
    var chart = new google.visualization.ColumnChart($(selector)[0])
    chart.draw(graphData, options);
}

$(document).ready(function() {
    
    $('#titlenum').keypress(() => { return (/[\d]/.test(String.fromCharCode(event.keyCode))) })

    viewAnalytics();

    $('#userYearDistributionBar').click(columnChart)
    $('#userDistributionPie').click(pieChart)

    $("#numOfTitle").click(viewAnalytics);

    // materialize initialization method
    $('.materialboxed').materialbox();
    $('select').formSelect();

    // tabs
    $('#overall_part').css('display', 'none');
    $('#individual_part').css('display', 'none');
    $('#author_part').css('display', 'none');

    $('#logo').click(function() {
        $('#main').css('display', '');
        $('#overall_part').css('display', 'none');
        $('#individual_part').css('display', 'none');
        $('#author_part').css('display', 'none');
    })

    $('#overall').click(function() {
        scrollToTop()
        $('#main').css('display', 'none');
        $('#overall_part').css('display', '');
        $('#individual_part').css('display', 'none');
        $('#author_part').css('display', 'none');
    })

    $('#individual').click(function() {
        scrollToTop()
        $('#main').css('display', 'none');
        $('#overall_part').css('display', 'none');
        $('#individual_part').css('display', '');
        $('#author_part').css('display', 'none');
    })

    $('#author').click(function() {
        scrollToTop()
        $('#main').css('display', 'none');
        $('#overall_part').css('display', 'none');
        $('#individual_part').css('display', 'none');
        $('#author_part').css('display', '');
    })
});

// Change the top number displayed by analytics.
function viewAnalytics() {
    var num = parseInt($("#titlenum").val());
    var formdata = { "topnum": num };

    $.ajax({
        type: "GET",
        url: "/analytic/view_overall",
        dataType: "JSON",
        data: formdata,
        success: function(res) {
            fillTableRevision(res.top_revision, num);
            fillTableEdit(res.top_edit, num);
            fillTableHistory(res.top_history, num);
        },
        error: function(xhr) {
            M.toast({ html: "Error in viewAnalytics: " + xhr.status + " " + xhr.statusText })
        }
    });
}

function fillTableRevision(res, num) {
    var table_head = "<table><thead><tr><th>Article</th><th>Revisions</th></tr></thead><tbody>"
    var table_end = "</tbody></table>"
    var table_row = ""

    var highest_articles = res.highest;
    var highest_revisions = res.highest;
    var lowest_articles = res.lowest;
    var lowest_revisions = res.lowest;

    // Build HTML elements and append to the page.
    for (var i = 0; i < num; i++) {
        table_row += `<tr><td>${highest_articles[i]['_id']}</td><td>${highest_revisions[i]['count']}</td></tr>`
    }
    $("#highestRev tbody").empty();
    $("#highestRev").html(table_head);
    $("#highestRev tbody").append(table_row + table_end);

    table_row = ""; // Clear the string
    for (i = 0; i < num; i++) {
        table_row += `<tr><td>${lowest_articles[i]['_id']}</td><td>${lowest_revisions[i]['count']}</td></tr>`
    }
    $("#lowestRev tbody").empty();
    $("#lowestRev").html(table_head);
    $("#lowestRev tbody").append(table_row + table_end)
}

function fillTableEdit(res, num) {
    var table_head = "<table class=''><thead>" +
        "<tr><th>Article</th><th>Edits</th></tr></thead><tbody>"
    var table_end = "</tbody></table>"
    var table_row = ""

    var largest_articles = res.largest;
    var largest_edits = res.largest;
    var smallest_articles = res.smallest;
    var smallest_edits = res.smallest;

    console.log(largest_articles)

    // Build HTML elements and append to the page.
    for (var i = 0; i < num; i++) {
        table_row += `<tr><td>${largest_articles[i]["_id"]['title']}</td><td>${largest_edits[i]["count"]}</td></tr>`
    }
    $("#largestGroup tbody").empty();
    $('#largestGroup').html(table_head);
    $("#largestGroup tbody").append(table_row + table_end);

    table_row = ""; // Clear the string
    for (i = 0; i < num; i++) {
        table_row += `<tr><td>${smallest_articles[i]["_id"]['title']}</td><td>${smallest_edits[i]["count"]}</td></tr>`
    }
    $("#smallestGroup tbody").empty();
    $('#smallestGroup').html(table_head);
    $("#smallestGroup tbody").append(table_row + table_end)
}

function fillTableHistory(res, num) {
    var table_head = "<table><thead>" +
        "<tr><th>Article</th><th>History</th></tr></thead><tbody>"
    var table_end = "</tbody></table>"
    var table_row = ""

    var longest_articles = res.longest;
    var longest_history = res.longest;
    var shortest_articles = res.shortest;
    var shortest_history = res.shortest;

    console.log(longest_articles);

    // Build HTML elements and append to the page.
    for (var i = 0; i < num; i++) {
        table_row += `<tr><td>${longest_articles[i]["_id"]["title"]}</td><td>${longest_history[i]["daysSinceCreatedTime"]}</td></tr>`
    }
    $("#longestAge tbody").empty();
    $("#longestAge").html(table_head);
    $("#longestAge tbody").append(table_row + table_end);

    table_row = ""; // Clear the string
    for (i = 0; i < num; i++) {
        table_row += `<tr><td>${shortest_articles[i]["_id"]["title"]}</td><td>${shortest_history[i]["daysSinceCreatedTime"]}</td></tr>`
    }
    $("#shortestAge tbody").empty();
    $('#shortestAge').html(table_head);
    $("#shortestAge tbody").append(table_row + table_end)
}

// Get data from DB and display as charts.
function pieChart() {
    $.ajax({
        type: "GET",
        url: "/analytic/view_charts",
        dataType: "JSON",
        success: function(res) {
            drawPie(res.by_usertype, '#overallChart')
        },
        error: function(xhr) {
            M.toast({ html: "Error in chartSummary: " + xhr.status + " " + xhr.statusText })
        }
    })
}

function columnChart() {
    $.ajax({
        type: "GET",
        url: "/analytic/view_charts",
        dataType: "JSON",
        success: function(res) {
            drawBar(res.by_year, '#overallChart')
        },
        error: function(xhr) {
            M.toast({ html: "Error in chartSummary: " + xhr.status + " " + xhr.statusText })
        }
    })
}
