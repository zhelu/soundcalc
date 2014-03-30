function secondsToFormattedString(totalSeconds) {
  var absSeconds = Math.abs(totalSeconds);
  var seconds = absSeconds % 60;
  var minutes = Math.floor(absSeconds / 60);
  return (totalSeconds < 0 ? "-" : "") + ("" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds).match("\\d+:\\d\\d(\\.\\d)?(\\d)?")[0];
}

var Global = new Object();
Global.i = 0;
$(document).ready(
// prepare document
function() {
  $("#addNewRow").click(function() {
    var j = Global.i;
    $("#rowContainers").append("<div class=\"rowContainer\"><span style=\"display: inline-block\"><p name=\"time\" id=\"time" + j + "\" time=0 style=\"min-width: 100px;\"></p></span><input id=\"file" + j + "\" type=\"file\" accept=\"audio/*\"/><audio id=\"audio" + j + "\"/></div>");

    $("#file" + j).change(function() {
      var k = j;
      var file = $("#file" + k)[0].files[0];
      var objectUrl = URL.createObjectURL(file);
      $("#audio" + k).prop("src", objectUrl);
    });

    $("#audio" + j).on("canplaythrough", function() {
      var seconds = $(this)[0].duration;
      var k = j;
      $("#time" + k).attr("time", seconds);
      $("#time" + k).text(secondsToFormattedString(seconds));
      totalTime();
    })

    Global.i++;
  });

  $("#refresh").click(refresh);

  $("#addNewTime").click(function() {
    var j = Global.i;
    var userTime = window.prompt("Enter a time", "0:00");
    var timePieces = userTime.match("(\\d*):(\\d+)");
    if (timePieces === null || timePieces.length == 0) {
      return;
    }
    var time = Number(timePieces[1]) * 60 + Number(timePieces[2]);

    $("#rowContainers").append("<div class=\"rowContainer\"><input type=\"text\" name=\"time\" id=\"time" + j + "\" time=\"" + time + "\"/><input id=\"refreshManual" + j + "\" type=\"button\" value=\"Refresh\"/></div>");
    $("#time" + j).val(secondsToFormattedString(time));
    $("#refreshManual" + j).click(function() {
      var k = j;
      var userTime = $("#time" + k).val();
      var timePieces = userTime.match("(\\d*):(\\d+)");
      if (timePieces === null || timePieces.length == 0) {
        return;
      }
      var time = Number(timePieces[1]) * 60 + Number(timePieces[2]);
      $("#time" + k).attr("time", time);
      totalTime();
    });
    totalTime();

    Global.i++;

  });
});

function totalTime() {
  var total = 0;
  $("[name='time']").each(function() {
    total += Number($(this).attr("time"));
  });
  $("#total").text(secondsToFormattedString(total));
  $("#total").attr("time", total);
}

function refresh() {
  var targetTimeText = $("#targetTime").val().split(":");
  var targetMinutes = targetTimeText[0];
  var targetSeconds = targetTimeText[1];
  var targetTotal = Number(targetMinutes) * 60 + Number(targetSeconds);
  var difference = Number($("#total").attr("time")) - targetTotal;
  if (!isNaN(difference)) {
    $("#difference").text(secondsToFormattedString(Math.abs(difference)) + (difference < 0 ? " under" : " over"));
  }
}