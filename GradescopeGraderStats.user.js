/**
 * MIT License
 *
 * Copyright (c) 2021 David Harris
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
// ==UserScript==
// @name            Gradescope Grader Stats
// @namespace       https://greasyfork.org/en/users/238426-drharris
// @description     Displays per-grader statistics on submissions in Gradescope
// @version         1.1.1
// @author          drharris
// @copyright       2022, drharris (https://greasyfork.org/en/users/238426-drharris)
// @license         MIT
// @homepage        https://greasyfork.org/en/scripts/423266-sample-userscript-template
// @supportURL      https://greasyfork.org/en/scripts/423266-sample-userscript-template/feedback
// @match           https://www.gradescope.com/courses/*/questions/*/submissions
// @require         https://unpkg.com/mathjs@7.0.0/dist/math.min.js
// @require         https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @require         https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_addValueChangeListener
// @grant           GM_removeValueChangeListener
// @grant           GM_addStyle
// @grant           GM_registerMenuCommand
// @grant           GM_unregisterMenuCommand
// @grant           GM_setClipboard
// @grant           GM_xmlhttpRequest
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_download
// @grant           GM_openInTab
// @grant           GM_notification
// ==/UserScript==

// ==OpenUserScript==
// @author          drharris
// @collaborator    drharris
// ==/OpenUserScript==

/* jshint esversion: 6 */

$(document).ready(function () {
    if (!$('#question_submissions_wrapper .dataTable >tbody >tr')) return;
    var dict = {};
    var uniqueScores = [];
    // parse grade data
    $('#question_submissions_wrapper .dataTable >tbody >tr').each(function (index, tr) {
        var grader = tr.childNodes[2].textContent;
        var score = tr.childNodes[4].textContent;
        if (!uniqueScores.includes(score)) { uniqueScores.push(score); }
        if (!(grader in dict)) { dict[grader] = []; }
        dict[grader].push(score);
    });
    uniqueScores.sort((a, b) => (parseInt(a) - parseInt(b)));
    // build new table
    var table = $('<table>').addClass('table').css("margin", "3em auto 0").css("width", "80%").appendTo($('#question_submissions_filter'));
    var tr = $('<tr>').appendTo($('<thead>').appendTo(table));
    tr.append($('<th>Grader</th><th>Count</th><th>Mean</th><th>Median</th><th>StDev</th>'));
    var tbody = $('<tbody>').addClass('collapse').attr('id', 'gsgsTbody').appendTo(table);
    for (var ta in dict) {
        if (ta == '') continue;
        var grades_nonzero = dict[ta].filter(function(x){return x !== '0.0';});
        // make data summary row
        var row = $('<tr>').addClass('gsgsRow').css("cursor", "pointer").css("height", "32px").appendTo(tbody);
        row.append($('<td>').text(ta))
        row.append($('<td>').text(dict[ta].length));
        row.append($('<td>').text(math.round(math.mean(grades_nonzero), 2)))
        row.append($('<td>').text(math.round(math.median(grades_nonzero), 2)))
        row.append($('<td>').text(math.round(math.std(grades_nonzero), 2)))
        // make chart row
        var detailRow = $('<tr>').addClass('gsgsRowDetail').appendTo(tbody);
        var detailCell = $('<td colspan=5></td>').appendTo(detailRow);
        var chartContainer = $('<div style="display:inline-block;position:relative;width:100%;height:200px;padding-left:2em;padding-right:2em"></div>').appendTo(detailCell);
        let scoreCount = dict[ta].reduce(function ( c, v ) { return ( c[v] ? ++c[v] : (c[v] = 1), c ); }, {});
        new Chart($('<canvas></canvas>').appendTo(chartContainer), {
            type: 'bar',
            data: { labels: uniqueScores, datasets: [ { label:ta, data: scoreCount, backgroundColor: 'rgba(92, 60, 146, 0.5)' } ] },
            options: { plugins: { legend: { display: false, } }, responsive: true, maintainAspectRatio:false }
        });
        detailRow.toggle();
    }
    // add chart collapse ability
    $('tr.gsgsRow').click(function () {
        $(this).nextUntil('tr.gsgsRow').slideToggle(100);
    });
});
