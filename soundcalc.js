function secondsToFormattedString(totalSeconds) {
  var absSeconds = Math.abs(totalSeconds);
  var seconds = absSeconds % 60;
  var minutes = Math.floor(absSeconds / 60);
  return (totalSeconds < 0 ? "-" : "") + ("" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds).match("\\d+:\\d\\d(\\.\\d)?")[0];
}

function logWarning(text) {
  $("#warningsDiv").append("<p class=\"warning\">" + text + "</p>").addClass("warning");
}

function displayWarnings() {
  $("#warningsDiv").detach();
  Global.warnings.append("<div id=\"warningsDiv\" class=\"other\"></div>");
  var time0 = Global.segmentTime[0];
  var time1 = Global.segmentTime[1];
  var time2 = Global.segmentTime[2];
  var error0 = false;
  var error1 = false;
  var error2 = false;
  if (time0 < 11 * 60) {
    logWarning("Segment A is shorter than 11:00");
    error0 = true;
    Global.arcs[0].classed("warningUnder", true).classed("warningOver", false);
  }
  else if (time0 > 16 * 60) {
    logWarning("Segment A is longer than 16:00");
    error0 = true;
    Global.arcs[0].classed("warningUnder", false).classed("warningOver", true);
  } else {
    Global.arcs[0].classed("warningUnder", false).classed("warningOver", false);
  }
  if (time1 < 14 * 60) {
    logWarning("Segment B is shorter than 14:00");
    error1 = true;
    Global.arcs[1].classed("warningUnder", true).classed("warningOver", false);
  } else if (time1 > 24 * 60) {
    logWarning("Segment B is longer than 24:00");
    error1 = true;
    Global.arcs[1].classed("warningUnder", false).classed("warningOver", true);
  } else {
    Global.arcs[1].classed("warningUnder", false).classed("warningOver", false);
  }
  if (time2 < 15.5 * 60) {
    logWarning("Segment C is shorter than 15:30");
    error2 = true;
    Global.arcs[2].classed("warningUnder", true).classed("warningOver", false);
  } else if (time2 > 20.5 * 60) {
    logWarning("Segment C is longer than 20:30");
    error2 = true;
    Global.arcs[2].classed("warningUnder", false).classed("warningOver", true);
  } else {
    Global.arcs[2].classed("warningUnder", false).classed("warningOver", false);
  }
  if (!error1 && !error0 && time0 + 60 + time1 > 36 * 60) {
    logWarning("Segments A and B are too long together");
    Global.arcs[0].classed("warningUnder", true);
    Global.arcs[1].classed("warningUnder", true);
  } else if (!error1 && !error0 && time0 + 60 + time1 < 31 * 60) {
    logWarning("Segments A and B are too short together");
    Global.arcs[0].classed("warningOver", true);
    Global.arcs[1].classed("warningOver", true);
  }
  if (!error2 && !error1 && time1 + 60 + time2 > 40.5 * 60) {
    logWarning("Segments B and C are too long together");
    Global.arcs[2].classed("warningUnder", true);
    Global.arcs[1].classed("warningUnder", true);
  } else if (!error1 && !error2 && time1 + 60 + time2 < 35.5 * 60) {
    logWarning("Segments B and C are too short together");
    Global.arcs[2].classed("warningOver", true);
    Global.arcs[1].classed("warningOver", true);
  }
}

// Change the drawing of the arc to be between (time) seconds start and stop
// Param path is a d3 object path object that represents a circular arc
function computeArcD(path, start, stop, radius) {
  if (radius == null) {
    radius = Global.radius;
  }
  var startRadians = Math.PI / 1800 * start;
  var stopRadians = Math.PI / 1800 * stop;
  var startX = radius * Math.sin(startRadians) + Global.width / 2;
  var startY = -radius * Math.cos(startRadians) + Global.height / 2;
  var stopX = radius * Math.sin(stopRadians) + Global.width / 2;
  var stopY = -radius * Math.cos(stopRadians) + Global.height / 2;
  var d = "M" + startX + "," + startY + " A" + radius + "," + radius + " 0 " + (stopRadians - startRadians > Math.Pi ? "1" : "0") + ",1 " + stopX + "," + stopY;
  path.attr("d", d);
  return path;
}

function computeClosedArcD(path, start, stop, radius) {
  computeArcD(path, start, stop, radius);
  var d = "M" + (Global.width / 2) + "," + (Global.height / 2) + " L" + path.attr("d").substring(1) + " z";
  path.attr("d", d);
  return path;
}

function drawText(time, radius, text) {
  var radians = Math.PI / 1800 * time;
  var x = radius * Math.sin(radians) + Global.width / 2 - 8;
  var y = -radius * Math.cos(radians) + Global.height / 2 + 4;
  return Global.svg.append("text").attr("x", x).attr("y", y).text(text);
}

function drawSegment(time, r1, r2) {
  var radians = Math.PI / 1800 * time;
  var x1 = r1 * Math.sin(radians) + Global.width / 2;
  var y1 = -r1 * Math.cos(radians) + Global.height / 2;
  var x2 = r2 * Math.sin(radians) + Global.width / 2;
  var y2 = -r2 * Math.cos(radians) + Global.height / 2;
  return Global.svg.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
}

function drawLine(time, radius) {
  var radians = Math.PI / 1800 * time;
  if (radius === null) {
    radius = Global.radius;
  }
  var x = radius * Math.sin(radians) + Global.width / 2;
  var y = -radius * Math.cos(radians) + Global.height / 2;
  return Global.svg.append("line").attr("x1", Global.width / 2).attr("y1", Global.height / 2).attr("x2", x).attr("y2", y);
}

function updateLine(line, time, radius) {
  var radians = Math.PI / 1800 * time;
  var dx = line.attr("x2") - line.attr("x1");
  var dy = line.attr("y2") - line.attr("y1");
  var r;
  if (radius == null) {
    r = Math.sqrt(dx * dx + dy * dy);
  } else {
    r = radius;
  }
  var x = r * Math.sin(radians) + Global.width / 2;
  var y = -r * Math.cos(radians) + Global.height / 2;
  line.attr("x2", x).attr("y2", y);
}

function refreshDrawing() {
  var start0 = 360;
  var end0 = 360 + Global.segmentTime[0];
  var start1 = end0 + 60;
  var end1 = start1 + Global.segmentTime[1];
  var start2 = end1 + 60;
  var end2 = start2 + Global.segmentTime[2];
  updateLine(Global.lines[0], end0, Global.radius * 1.05);
  updateLine(Global.lines[1], start1, Global.radius * 1.05);
  updateLine(Global.lines[2], end1, Global.radius * 1.05);
  updateLine(Global.lines[3], start2, Global.radius * 1.05);
  computeArcD(Global.arcs[0], start0, end0, Global.radius * 0.95);
  computeArcD(Global.arcs[1], start1, end1, Global.radius * 0.95);
  computeArcD(Global.arcs[2], start2, end2, Global.radius * 0.95);
}

function totalTime() {
  var time = Global.segmentTime.reduce(function(previous, current, index, a) {
    return previous + current;
  }, 0);
  $("#totalTime").text(secondsToFormattedString(time));
  displayWarnings();
  refreshDrawing();
}

function totalTimeForSegment(index) {
  var time = 0;
  $("#segment" + index).find("[name=\"time\"]").each(function() {
    time += Number($(this).attr("time"))
  });
  $("#totalTime" + index).text(secondsToFormattedString(time));
  Global.segmentTime[index] = time;
  totalTime();
}

var Global = new Object();
Global.i = new Array(0, 0, 0);
Global.segmentTime = new Array(0, 0, 0);
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
    $("#rowContainers" + index).append("<div class=\"rowContainer\"><input type=\"text\" class=\"time\" name=\"time\" id=\"time" + j + "-" + index + "\" time=\"0\" value=\"0:00\"/><input type=\"text\" placeholder=\"Comments\" class=\"comment\"/><input id=\"refreshManual" + j + "-" + index + "\" type=\"button\" value=\"Refresh\"/><input type=\"button\" + id=\"delete" + j + "-" + index + "\" value=\"Delete\"/></div>");
    $("#refreshManual" + j + "-" + index).click(function() {
      var k = j;
      var n = index;
      var userTime = $("#time" + k + "-" + n).val();
      var timePieces = userTime.match("(\\d*):(\\d\\d)");
      if (timePieces === null || timePieces.length == 0) {
        $("#time" + k + "-" + n).addClass("error");
        return;
      }
      $("#time" + k + "-" + n).removeClass("error");
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

  Global.width = 500;
  Global.height = 500;
  Global.radius = Math.min(Global.height, Global.width) / 2 * 0.8;
  Global.svg = d3.select("svg").attr("width", Global.width).attr("height", Global.height);
  Global.svg.append("circle").attr("cx", Global.width / 2).attr("cy", Global.height / 2).attr("r", Global.radius).classed("clock", true);
  for (var i = 0; i < 60; ++i) {
    drawSegment(i * 60, 0.95 * Global.radius, 1.05 * Global.radius).classed("tick", true);
  }
  for (var i = 5; i <= 60; i += 5) {
    drawText(i * 60, 1.1 * Global.radius, i.toString());
  }
  var topOfHour = Global.svg.append("path");
  var bottomOfHour = Global.svg.append("path");
  computeClosedArcD(topOfHour, 0, 360).classed("dead", true);
  computeClosedArcD(bottomOfHour, 3510, 3600).classed("dead", true);
  var floater1 = Global.svg.append("path").classed("floating", true);
  var floater2 = Global.svg.append("path").classed("floating", true);
  Global.arcs = new Array(Global.svg.append("path").classed("arc", true), Global.svg.append("path").classed("arc", true), Global.svg.append("path").classed("arc", true));
  Global.lines = new Array(drawLine(360, Global.radius * 1.05), drawLine(420, Global.radius * 1.05), drawLine(420, Global.radius * 1.05), drawLine(480, Global.radius * 1.05));
  Global.warnings = $("td > div.warning");
  computeClosedArcD(floater1, 17 * 60, 23 * 60);
  computeClosedArcD(floater2, 37 * 60, 43 * 60);
  totalTime();
});

