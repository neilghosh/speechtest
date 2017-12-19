function plot(data, pastDates) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: pastDates,
            datasets: [{
                label: "Your previous attempts",
                //new option, type will default to bar as that what is used to create the scale
                type: "line",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: data
            }, {
                label: "",
                //new option, type will default to bar as that what is used to create the scale
                type: "bar",
                fillColor: "rgba(220,20,220,0.2)",
                strokeColor: "rgba(220,20,220,1)",
                pointColor: "rgba(220,20,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: data
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function openModule(evt, moduleName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(moduleName).style.display = "block";
    //$('#module1').style.display = "none";
    evt.currentTarget.className += " active";
}
function isChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
    return true;
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  } else { 
    return false;
  }
}

function markAsWrong(sword, htmlText1, htmlText2) {
    spat1 = new RegExp(sword, "i")
    rpat1 = "<u>" + sword + "</u>"
    newWSize = rpat1.length
    htmlP2 = htmlText2.replace(spat1, rpat1);
    $("#p2").html(htmlText1 + htmlP2);
    voiceHtml = htmlP1 + htmlP2
}

function getScores() {
    $.get("/savescore", function (data) {
        //alert(data);
        renderScores(data);

    });
}

function toggle() {
    var x = document.getElementById('myChart');
    var y = document.getElementById('scores');

    if (x.style.display === 'none') {
        x.style.display = 'block';
        y.style.display = 'none';
    } else {
        x.style.display = 'none';
        y.style.display = 'flex'
    }

}

function renderScores(data) {
    $('#scores').find('tbody').empty();

    $((data.Scores).reverse()).each(function (index, element) {
        var date = new Date(element.EntryTime);
        $('#scores').find('tbody').append('<tr><td> ' + date.toUTCString() + ' </td> <td> ' + element.Score + ' </td></tr>');
    })

    pastScores = [];
    pastDates = [];
    var coloredScores = "<b>Previous scores : ";
    for (var score in data.Scores.reverse()) {
        scoreEntry = Math.round(data.Scores[score].Score);
        if (scoreEntry < 60) {
            coloredScores = coloredScores + '<span style="color: red;">' + scoreEntry + '</span>&nbsp'
        } else {
            coloredScores = coloredScores + '<span style="color: green;">' + scoreEntry + '</span>&nbsp'
        }
        pastScores.push(scoreEntry);
        var date = new Date(data.Scores[score].EntryTime);
        pastDates.push((date.getMonth() + 1).toString() + "/" + date.getDate().toString());
    }
    $('#pastScores').html(coloredScores + '</b>');
    plot(pastScores, pastDates);

}

$(document).ready(function () {
    //Check browser 
    if(!isChrome()){
        alert("This is browser is not supported yet. Please use Google Chrome."); 
        $("#vrec").attr("disabled", "disabled");
        $("#rst").attr("disabled", "disabled");
        $("#save").attr("disabled", "disabled");
        $("#sp").attr("disabled", "disabled");
        $("#t1").attr("disabled", "disabled");

    }
    document.getElementById("defaultOpen").click();
    getScores();
    /*
     $("#t1").keypress(function(){
     //$("#p2").html($("#t1").val());
     }) */

    $("#save").click(function () {
        // if ($.isNumeric($("#vpercent"))) {
        $.post("/savescore?score=" + $("#vpercent").text(), function (data) {
            renderScores(data);
        });
        //}
    });

    var mytextbox = document.getElementById('t1');
    var mydropdown = document.getElementById('dropdown');

    mydropdown.onchange = function () {
        mytextbox.innerHTML = this.value;
    }

    $("#rst").click(function () {
        $("#p2").text("");
        $("#vcount").text(0);
        $("#ncorrect").text(0);
        $("#nwrong").text(0);
        $("#tcount").text("-");
        $("#vpercent").text("-");
    });

    $("#sp").click(function () {
        thresoldWordCount = 3;
        correct = 0;
        wrong = 0;
        currTPos = 0;
        currVPos = 0;
        voiceText = $("#p2").text();
        $("#p2").html(voiceText);
        voiceHtml = $("#p2").html();
        //pText=$("#p1").text();
        pText = $("#t1").val().toLowerCase()
        voiceWords = voiceText.split(/[\s,.;]+/)
        vl = voiceWords.length
        textWords = pText.split(/[\s,.;:\-]+/)
        tl = textWords.length
        if (textWords[tl - 1].trim() == "") tl = tl - 1;
        if (voiceWords[vl - 1].trim() == "") vl = vl - 1;

        for (i = 0; i < vl; i++) {
            currentWord = voiceWords[i].trim()
            if (currentWord != "") {
                wordVLocation = voiceHtml.indexOf(currentWord, currVPos);
                htmlP1 = voiceHtml.substring(0, wordVLocation);
                htmlP2 = voiceHtml.substring(wordVLocation);
                wordTLocation = pText.indexOf(currentWord.toLowerCase(), currTPos);
                newWSize = currentWord.length
                if (wordTLocation != -1) {
                    gapLength = wordTLocation - currTPos;
                    gapText = pText.substring(currTPos, wordTLocation).trim();
                    gapWords = gapText.split(/[\s,.;:\-]+/);
                    if (gapWords.length <= thresoldWordCount) {
                        currTPos = wordTLocation + newWSize
                        if (pText.charAt(currTPos).search(/[^\s,.;\-]/) == 0 || (wordTLocation > 0 && pText.charAt(wordTLocation - 1).search(/[^\s,.;\-]/) == 0)) {
                            wrong++;
                            markAsWrong(currentWord, htmlP1, htmlP2)
                            console.log("pre/post:" + currentWord + ":" + wordTLocation + ":" + currTPos);
                            thresoldWordCount++
                        } else {
                            currTPos++
                            correct++;
                            misscount = 0;
                            thresoldWordCount = 3
                        }
                    } else {
                        wrong++;
                        markAsWrong(currentWord, htmlP1, htmlP2)
                        console.log("Theshold:" + currentWord + ":" + wordTLocation + ":" + currTPos + ":" + gapText);
                        misscount++
                        thresoldWordCount++
                    }
                } else {
                    wrong++
                    markAsWrong(currentWord, htmlP1, htmlP2)
                    console.log("word Not found:" + currentWord + ":" + wordTLocation + ":" + currTPos);
                    thresoldWordCount++
                }
                currVPos = wordVLocation + newWSize + 1
            }
        }
        $("#vcount").text(vl);
        $("#ncorrect").text(correct);
        $("#nwrong").text(wrong);
        $("#tcount").text(tl);
        $("#vpercent").text(parseFloat((correct / tl) * 100).toFixed(2));
    });

})
;
currTPos = 0;
currVPos = 0;