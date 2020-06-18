$(document).ready(function() {
    $('.collapsible').collapsible();
    var elems = $('.autocomplete');
    var instance = M.Autocomplete.init(elems, { "limit": 10 });
    var instances = M.Autocomplete.getInstance(elems);
    updateAutoComplete(instances);

    $("#authorSearch").click(searchAuthor);
});

function searchAuthor() {
    var formdata = { "author": $("#username").val() }
    var articles = [];

    $.ajax({
        type: 'GET',
        url: '/analytics/view_author',
        data: formdata,
        dataType: 'JSON',
        success: function(res) {
            articles = res
        },
        error: function(xhr) {
            M.toast({ html: "Error in searchAuthor: " + xhr.status + " " + xhr.statusText })
        }
    }).done(function() {
        $("#collapsibleArticle").empty();

        var collapsible_end = '</ul>'
        var collapsible_body = []

        for (each of articles) {
            collapsible_body
                .push(`<li><div class="collapsible-header">Title: ${each._id.title}&nbsp;&nbsp;&nbsp;Revisions: ${each.count}</div>`)

            var time_list = []
            for (t of each.timestamp) {
                time_list.push(`<p>${t}</p>`)
            }
            var ts = time_list.join('');

            collapsible_body
                .push(`<div class="collapsible-body"><p>Revision time: </p>${ts}</div></li>`)
        }
        var body = collapsible_body.join('');
        $("#collapsibleArticle").append(body + collapsible_end);
    })
}

function updateAutoComplete(instances) {
    var author_list = {};
    $.ajax({
        type: 'GET',
        url: '/analytics/get_all_author',
        dataType: 'JSON',
        success: function(res) {
            for (var i in res) {
                author_list[res[i]['_id']] = null;
            }
        },
        error: function(xhr) {
            M.toast({ html: "Error in updateAutoComplete: " + xhr.status + " " + xhr.statusText })
        }
    }).done(function() {
        instances.updateData(author_list);
    })
}