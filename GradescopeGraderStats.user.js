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
// @version         1.0.0
// @author          drharris
// @copyright       2022, drharris (https://greasyfork.org/en/users/238426-drharris)
// @license         MIT
// @homepage        https://github.com/drharris/gradescope_grader_stats
// @supportURL      https://github.com/drharris/gradescope_grader_stats/issues
// @match           https://www.gradescope.com/courses/*/questions/*/submissions
// @require         https://unpkg.com/mathjs@7.0.0/dist/math.min.js
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
    if(!$('#question_submissions_wrapper .dataTable >tbody >tr')) return;
    var dict = {};
    $('#question_submissions_wrapper .dataTable >tbody >tr').each(function(index, tr) {
        if(!(tr.childNodes[2].textContent in dict)) {
            dict[tr.childNodes[2].textContent] = [];
        }
        dict[tr.childNodes[2].textContent].push(tr.childNodes[4].textContent);
    });
    var table = $('<table>').addClass('table').css("margin", "3em 0 0 6em").css("width", "80%").appendTo($('#question_submissions_filter'));
    var thead = $('<thead>').appendTo(table);
    var tr = $('<tr>').appendTo(thead);
    tr.append($('<th>Grader</th><th>Count</th><th>Mean</th><th>StDev</th>'));
    var tbody = $('<tbody>').addClass('collapse').attr('id', 'gsgsTbody').appendTo(table);
    for(var ta in dict) {
        if(ta == '') continue;
        var row = $('<tr>').css("height", "32px").appendTo(tbody);
        row.append($('<td>').text(ta))
        row.append($('<td>').text(dict[ta].length));
        row.append($('<td>').text(math.round(math.mean(dict[ta]), 3)))
        row.append($('<td>').text(math.round(math.std(dict[ta]), 3)))
    }
});
 
