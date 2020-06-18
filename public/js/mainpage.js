google.charts.load('current', { packages: ['corechart'] });

// distribution pie chart
function drawPie() {

}

// distribution bar charts
function drawBar() {

}

$(function() {

    // initialization of image
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
        $('#main').css('display', 'none');
        $('#overall_part').css('display', '');
        $('#individual_part').css('display', 'none');
        $('#author_part').css('display', 'none');
    })

    $('#individual').click(function() {
        $('#main').css('display', 'none');
        $('#overall_part').css('display', 'none');
        $('#individual_part').css('display', '');
        $('#author_part').css('display', 'none');
    })

    $('#author').click(function() {
        $('#main').css('display', 'none');
        $('#overall_part').css('display', 'none');
        $('#individual_part').css('display', 'none');
        $('#author_part').css('display', '');
    })
})
