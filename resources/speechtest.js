function setupReadings() {
  var mydropdown = document.getElementById('ListeningTests');
  document.getElementById('audioPlayer').style.visibility = 'hidden';

  //var audio = document.getElementById('audioPlayer');
  //var audioPlayer = $('#audioPlayer');
  var video = videojs('audioPlayer');
  myPlayer = video;
  var currentTime = 0;
  myPlayer.on("seeking", function (event) {
    if (currentTime > myPlayer.currentTime()) {
      myPlayer.currentTime(currentTime);
    }
  });

  myPlayer.on("seeked", function (event) {
    if (currentTime > myPlayer.currentTime()) {
      myPlayer.currentTime(currentTime);
    }
  });

  setInterval(function () {
    if (!myPlayer.paused()) {
      currentTime = myPlayer.currentTime();
    }
  }, 1000);
  // });
  $.ajax({
    url: "getReadings",
    success: function (result) {
      for (var i = mydropdown.options.length - 1; i >= 1; i--) {
        mydropdown.remove(i);
      }
      //alert(JSON.stringify(result))
      for (var i = 0; i < result.length; i++) {
        var key = result[i].key;
        globalReadings[key] = result[i];
        var completed = result[i].Completed;
        var option = new Option(key);
        if (completed) {
          option.setAttribute("disabled", "disabled");
        }
        mydropdown.options[mydropdown.options.length] = option;
      }
      mydropdown.selectedIndex = 0;
      mydropdown.onchange();
    }
  });

  mydropdown.onchange = function () {
    $("#scorePanel").hide();
    var key = this.value;
    var reading = globalReadings[key]
    questionNo = 0;
    listningScore = 0;
    if (reading != null) {
      document.getElementById('qtitle').innerHTML = reading.title;
      //var source = document.getElementById('audioSource');

      video.src('resources/audio/' + reading.Audio);
      //source.src = 'resources/audio/'+reading.Audio;
      video.on("ended", funcName = function () {
        $("#playerPanel").hide();
        saveReadings(key, true, 0, false);
        showQuestions(reading.questions, questionNo);
        document.getElementById('audioPlayer').style.visibility = 'hidden';
      }, false);
      clearOptions();
      if (reading.AudioComplete) {
        document.getElementById('altaudiotext').innerHTML = 'You have heard the audio already';
        document.getElementById('audioPlayer').style.visibility = 'hidden';
        showQuestions(reading.questions, questionNo);
      } else {
        document.getElementById('altaudiotext').innerHTML = 'Click play button to listen to the audio clip.';
        document.getElementById('audioPlayer').style.visibility = 'visible';
      }
      //audio.load(); //call this to just preload the audio without playing     
      $("#playerPanel").show();
    }
  }
}

function clearOptions() {
  var foo = document.getElementById("options");
  //Remove the options from the old question
  while (foo.firstChild) {
    foo.removeChild(foo.firstChild);
  }
}
function showQuestions(questions, i) {
  document.getElementById('question').innerHTML = questions[i].question;
  document.getElementById('answer').value = questions[i].answer;
  clearOptions();
  var foo = document.getElementById("options");
  for (var option in questions[i].options) {
    var element = document.createElement("input");
    element.setAttribute("type", 'radio');
    element.setAttribute("value", option);
    element.setAttribute("name", 'option');
    //element.setAttribute("id", 'r' + i);
    foo.appendChild(element);

    element = document.createElement("label");
    element.setAttribute("for", 'r' + i);
    element.innerHTML = "&nbsp" + option + ". " + questions[i].options[option];
    foo.appendChild(element);

    var br = document.createElement('br');
    foo.appendChild(br);
  }
  document.getElementById("submitAns").disabled = false;
  var key = document.getElementById('ListeningTests').value;
  var totalQuestions = globalReadings[key].questions.length;
  if (questionNo + 1 == totalQuestions) { //last question
    //Change the next button to submit 
    $("#submitAns").html('Submit'); //versions newer than 1.6
  }
  $("#questions").show();
}

function submitAns() {
  var userAns = $("input[name=option]:checked").val();
  var answer = document.getElementById("answer").value;
  var key = document.getElementById('ListeningTests').value;

  if (userAns == answer) {
    listningScore++;
  }
  var totalQuestions = globalReadings[key].questions.length;
  if (++questionNo < totalQuestions) {
    nextQuestion();
  } else {
    saveModule2Score(key, listningScore);
  }
}

function saveModule2Score(key, listningScore) {
  alert("Saving Module 2 score " + listningScore);
  saveReadings(key, true, listningScore, true)
}

function nextQuestion() {
  key = document.getElementById('ListeningTests').value;
  questions = globalReadings[key].questions;
  showQuestions(questions, questionNo);
}

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

  //Module specific actions
  switch (moduleName) {
    case 'module2':
      setupReadings();
      break;
    default:
  }

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

/* function to create a text2 from text1 with wrong words marked with red underline*/
function markAsWrong(sword, htmlText1, htmlText2) {
  spat1 = new RegExp(sword, "i")
  rpat1 = "<u>" + sword + "</u>"
  newWSize = rpat1.length
  segmentRight = htmlText2.replace(spat1, rpat1);
  $("#p2").html(htmlText1 + segmentRight);
  voiceHtml = segmentLeft + segmentRight
}

function getScores() {
  $.get("/savescore", function (data) {
    //alert(data);
    renderScores(data);

  });
}

function saveReadings(key, audioComplete, score, completed) {
  $.get("/saveReadings?audioComplete=" + audioComplete + "&key=" + key + "&score=" + score + "&completed=" + completed, function (data) {
    if (completed) {
      clearOptions();
      showScore(data);
      //Disable current test 
      var currentKey = document.getElementById('ListeningTests').value;
      //            $('#dropdown option[value="'+currentKey+'"]').prop('disabled', 'disabled');
      $('#ListeningTests option:contains("' + currentKey + '")').attr("disabled", "disabled");

    }
  });
}

function showScore(data) {
  $("#questions").hide();
  var currentScore;
  var currentKey = document.getElementById('ListeningTests').value;
  var tests = data.ReadingTests;
  var size = tests.length;
  for (var i = 0; i < size; i++) {
    var entity = tests[i];
    key = entity.TestKey;
    if (currentKey == key) {
      currentScore = entity.Score;
    }
  }
  var totalQuestions = globalReadings[key].questions.length;
  var pct = Math.round(currentScore * 100 / totalQuestions);
  var result;
  var color = pct < pass ? (result = 'failed', 'red') : (result = 'passed', 'green');

  $("#scorePanel").html('You <font color="' + color + '"><b>' + result + '!</b></font>.<br>Your score for test <b>' + currentKey + '</b> is <font color="' + color + '"><b>' + pct + '</b></font>');
  $("#scorePanel").show();
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
  if (data.Scores == null) {
    return
  }
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
  if (!isChrome()) {
    alert("This is browser is not supported yet. Please use Google Chrome.");
    $("#vrec").attr("disabled", "disabled");
    $("#rst").attr("disabled", "disabled");
    $("#save").attr("disabled", "disabled");
    $("#sp").attr("disabled", "disabled");
    $("#textToRead").attr("disabled", "disabled");

  }
  document.getElementById("defaultOpen").click();
  getScores();

  $("#save").click(function () {
    $.post("/savescore?score=" + $("#vpercent").text(), function (data) {
      renderScores(data);
    });
  });

  var mytextbox = document.getElementById('textToRead');
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

  function getWordsFromParagraph(paragraph) {
    words = paragraph.split(/[\s,.;]+/);
    length = words.length;
    if (words[length - 1].trim() == "") {
      return words.slice(0, length - 2);
    } else {
      return words;
    }
  }
  // The main task: We need to compare Typed text and voice text strings. 
  // Split the text into array of words using delimiters space, comma, period, questionmark, parenthesis, etc., and trim/remove blank elements
  // then take voice text words, compare word-for-word with typed text words array to catch correct and wrong words.
  // Follow a logic and some index positions, keep counts for calculating scores	
  // It is possible that there are simpler codes to do the same job on sourceforge or github
  $("#sp").click(function () {
    thresoldWordCount = 3;
    correct = 0;
    misscount = 0;
    wrong = 0;
    currReadTextPosition = 0;
    currentSpokenPosition = 0;
    spokenText = $("#p2").text();
    $("#p2").html(spokenText);
    //Keep the spoken text as it is because later we need to make it rich by marking the wrong words
    voiceHtml = $("#p2").html();
    readText = $("#textToRead").val().toLowerCase() // It is easier to compare all lower case letters
    spokenWords = getWordsFromParagraph(spokenText);
    spokenWordsLength = spokenWords.length
    readWords = getWordsFromParagraph(readText);
    readWordsLength = readWords.length

    for (i = 0; i < spokenWordsLength; i++) {
      currentWord = spokenWords[i].trim()
      if (currentWord != "") {
        spokenWordLocation = voiceHtml.indexOf(currentWord, currentSpokenPosition);
        segmentLeft = voiceHtml.substring(0, spokenWordLocation);
        segmentRight = voiceHtml.substring(spokenWordLocation);
        readWordLocation = readText.indexOf(currentWord.toLowerCase(), currReadTextPosition);
        newWSize = currentWord.length
        if (readWordLocation != -1) {
          gapLength = readWordLocation - currReadTextPosition;
          gapText = readText.substring(currReadTextPosition, readWordLocation).trim();
          gapWords = gapText.split(/[\s,.;:\-]+/); 
          if (gapWords.length <= thresoldWordCount) {
            //The spoken word was found within the proximity of where it was in the original text read
            currReadTextPosition = readWordLocation + newWSize
            if (readText.charAt(currReadTextPosition).search(/[^\s,.;\-]/) == 0 || (readWordLocation > 0 && readText.charAt(readWordLocation - 1).search(/[^\s,.;\-]/) == 0)) {
              //If the found word is not having punctuation in both sites i.e. its just a prefix or postfix of other words
              //Then its not really a match, so mark it as wrong
              wrong++;
              markAsWrong(currentWord, segmentLeft, segmentRight)
              console.log("pre/post:" + currentWord + ":" + readWordLocation + ":" + currReadTextPosition);
              thresoldWordCount++
            } else {
              //Found a whole word match within proximity.
              currReadTextPosition++
              correct++;
              misscount = 0;
              thresoldWordCount = 3
            }
          } else {
            //The current spoken word was found but somwhere else far from actually where it should exists.
            wrong++;
            markAsWrong(currentWord, segmentLeft, segmentRight)
            console.log("Theshold:" + currentWord + ":" + readWordLocation + ":" + currReadTextPosition + ":" + gapText);
            misscount++
            thresoldWordCount++
          }
        } else {
          wrong++
          markAsWrong(currentWord, segmentLeft, segmentRight)
          console.log("word Not found:" + currentWord + ":" + readWordLocation + ":" + currReadTextPosition);
          thresoldWordCount++
        }
        //Next time serach the spoken word after the current word that was found, not from the begining.
        currentSpokenPosition = spokenWordLocation + newWSize + 1
      }
    }
    $("#vcount").text(spokenWordsLength);
    $("#ncorrect").text(correct);
    $("#nwrong").text(wrong);
    $("#tcount").text(readWordsLength);
    $("#vpercent").text(parseFloat((correct / readWordsLength) * 100).toFixed(2));
  });

});

var currReadTextPosition = 0;
var currentSpokenPosition = 0;
var listningScore = 0;
var questionNo = 0;
var globalReadings = [];
var pass = 80;