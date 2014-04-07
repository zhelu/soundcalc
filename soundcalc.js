function secondsToFormattedString(totalSeconds) {
  var absSeconds = Math.abs(totalSeconds);
  var seconds = absSeconds % 60;
  var minutes = Math.floor(absSeconds / 60);
  return (totalSeconds < 0 ? "-" : "") + ("" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds).match("\\d+:\\d\\d(\\.\\d)?(\\d)?")[0];
}

function logWarning(text) {
  d3.select("#warningsDiv").append("p").classed("warning", true).text(text);
}

function displayWarnings() {
  d3.select("#warningsDiv").remove();
  Global.warnings.append("div").attr("id", "warningsDiv");
  var time1 = Number($("#totalTime1").attr("time"));
  var time2 = Number($("#totalTime2").attr("time"));
  var time3 = Number($("#totalTime3").attr("time"));
  if (time1 < 11 * 60) {
    logWarning("Segment A is shorter than 11:00");
  }
  if (time1 > 16 * 60) {
    logWarning("Segment A is longer than 16:00");
  }
  if (time2 < 14 * 60) {
    logWarning("Segment B is shorter than 14:00");
  }
  if (time2 > 24 * 60) {
    logWarning("Segment B is longer than 24:00");
  }
  if (time3 < 15.5 * 60) {
    logWarning("Segment C is shorter than 15:30");
  }
  if (time3 > 20.5 * 60) {
    logWarning("Segment C is longer than 20:30");
  }
  if (time1 + 60 + time2 > 36 * 60) {
    logWarning("Segments A and B are too long together");
  }
  if (time2 + 60 + time3 > 40.5 * 60) {
    logWarning("Segments B and C are too long together");
  }
}

// Change the drawing of the arc to be between (time) seconds start and stop
// Param path is a d3 object path object that represents a circular arc
function computeArcD(path, start, stop) {
  var startRadians = Math.PI / 1800 * start;
  var stopRadians = Math.PI / 1800 * stop;
  var startX = Global.radius * Math.sin(startRadians) + Global.width / 2;
  var startY = -Global.radius * Math.cos(startRadians) + Global.height / 2;
  var stopX = Global.radius * Math.sin(stopRadians) + Global.width / 2;
  var stopY = -Global.radius * Math.cos(stopRadians) + Global.height / 2;
  var d = "M" + startX + "," + startY + " A" + Global.radius + "," + Global.radius + " 0 " + (stopRadians - startRadians > Math.Pi ? "1" : "0") + ",1 " + stopX + "," + stopY;
  path.attr("d", d);
}

function computeClosedArcD(path, start, stop) {
  computeArcD(path, start, stop);
  var d = "M" + (Global.width / 2) + "," + (Global.height / 2) + " L" + path.attr("d").substring(1) + " z";
  path.attr("d", d);
}

function drawLine(time, radius) {
  var radians = Math.PI / 1800 * time;
  if (radius === null) {
    radius = Global.radius;
  }
  var x = radius * Math.sin(radians) + Global.width / 2;
  var y = -radius * Math.cos(radians) + Global.height / 2;
  Global.svg.append("line").attr("x1", Global.width / 2).attr("y1", Global.height / 2).attr("x2", x).attr("y2", y);
}

function updateLine(line, time) {
  var radians = Math.PI / 1800 * time;
  var dx = line.attr("x2") - line.attr("x1");
  var dy = line.attr("y2") - line.attr("y1");
  var r = Math.sqrt(dx * dx + dy * dy);
  var x = r * Math.cos(radians) + Global.width / 2;
  var y = r * Math.sin(radians) + Global.height / 2;
  Global.svg.append("line").attr("x2", x2).attr("y2", y2);
}

function totalTime() {
  var time = 0;
  $(".totalTime").each(function() {
    time += Number($(this).attr("time"));
  });
  $("#totalTime").text(secondsToFormattedString(time));
  displayWarnings();
}

function totalTimeForSegment(index) {
  var time = 0;
  $("#segment" + index).find("[name=\"time\"]").each(function() {
    time += Number($(this).attr("time"))
  });
  $("#totalTime" + index).text(secondsToFormattedString(time));
  $("#totalTime" + index).attr("time", time);
  totalTime();
}

var Global = new Object();
Global.i = new Array(0, 0, 0, 0);
$(document).ready(
// prepare document
function() {
  $(".addNewRow").click(function() {
    var index = this.id.substring(this.id.length - 1);
    var j = Global.i[index];
    $("#rowContainers" + index).append("<div class=\"rowContainer\"><span style=\"display: inline-block\"><p name=\"time\" id=\"time" + j + "-" + index + "\" time=0 style=\"min-width: 100px;\"></p></span><input id=\"file" + j + "-" + index + "\" type=\"file\" accept=\"audio/*\"/><audio id=\"audio" + j + "-" + index + "\"/><input type=\"button\" id=\"delete" + j + "-" + index + "\" value=\"Delete\"/></div>");

    $("#file" + j + "-" + index).change(function() {
      var k = j;
      var n = index;
      var file = $("#file" + k + "-" + n)[0].files[0];
      var objectUrl = URL.createObjectURL(file);
      $("#audio" + k + "-" + n).prop("src", objectUrl);
    });

    $("#audio" + j + "-" + index).on("canplaythrough", function() {
      var seconds = $(this)[0].duration;
      var k = j;
      var n = index;
      $("#time" + k + "-" + n).attr("time", seconds);
      $("#time" + k + "-" + n).text(secondsToFormattedString(seconds));
      totalTimeForSegment(n);
    })

    $("#delete" + j + "-" + index).click(function() {
      var n = index;
      var row = $(this).parent();
      row.remove();
      totalTimeForSegment(n);
    });
    Global.i[index]++;
  });

  $(".addNewTime").click(function() {
    var index = this.id.substring(this.id.length - 1);
    var j = Global.i[index];
    var userTime = window.prompt("Enter a time", "0:00");
    if (userTime === null) {
      return;
    }
    var timePieces = userTime.match("(\\d*):(\\d+)");
    if (timePieces === null || timePieces.length == 0) {
      return;
    }
    var time = Number(timePieces[1]) * 60 + Number(timePieces[2]);

    $("#rowContainers" + index).append("<div class=\"rowContainer\"><input type=\"text\" name=\"time\" id=\"time" + j + "-" + index + "\" time=\"" + time + "\"/><input id=\"refreshManual" + j + "-" + index + "\" type=\"button\" value=\"Refresh\"/><input type=\"button\" + id=\"delete" + j + "-" + index + "\" value=\"Delete\"/></div>");
    $("#time" + j + "-" + index).val(secondsToFormattedString(time));
    $("#refreshManual" + j + "-" + index).click(function() {
      var k = j;
      var n = index;
      var userTime = $("#time" + k + "-" + n).val();
      var timePieces = userTime.match("(\\d*):(\\d+)");
      if (timePieces === null || timePieces.length == 0) {
        return;
      }
      var time = Number(timePieces[1]) * 60 + Number(timePieces[2]);
      $("#time" + k + "-" + n).attr("time", time);
      totalTimeForSegment(n);
    });

    $("#delete" + j + "-" + index).click(function() {
      var n = index;
      var row = $(this).parent();
      row.remove();
      totalTimeForSegment(n);
    });

    totalTimeForSegment(index);
    Global.i[index]++;
  });

  //Global.width = 500;
  //Global.height = 500;
  //Global.radius = Math.min(Global.height, Global.width) / 2 * 0.9;
  //Global.svg = d3.select("body").append("svg").attr("width", Global.width).attr("height", Global.height);
  //Global.svg.append("circle").attr("cx", Global.width / 2).attr("cy", Global.height / 2).attr("r", Global.radius).classed("clock", true);
  //var topOfHour = Global.svg.append("path");
  //var bottomOfHour = Global.svg.append("path");
  //computeClosedArcD(topOfHour, 0, 360);
  //computeClosedArcD(bottomOfHour, 3510, 3600);
  Global.warnings = d3.select("body").append("div").classed("segment", true);
  Global.warnings.append("p").append("b").text("Problems");
  Global.warnings.append("div").attr("id", "warningsDiv");
  totalTime();
});

