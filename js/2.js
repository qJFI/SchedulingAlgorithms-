const { each } = require("jquery");

// Initial call to recalculate service time
recalculateServiceTime();

// Hide elements with the class 'priority-only' at the start
$('.priority-only').hide();

// Add event listener for changes on radio buttons with name 'algorithm'
document.addEventListener("change", function(event) { 
  if (event.target.matches("input[type=radio][name=algorithm]")) {
    // Show or hide priority input fields based on the selected algorithm
    if (event.target.value == 'priority' || event.target.value == 'preemptive_priority') {
      $('.priority-only').show();
      $('#minus').css('left', '604px');
    } else {
      $('.priority-only').hide();
      $('#minus').css('left', '428px');
    }

    // Show or hide quantum input field for round-robin algorithm
    if (event.target.value == 'robin' ||event.target.value == 'srjf' ||event.target.value == 'preemptive_priority'  ) {
      $('#quantumParagraph').show();
    } else {
      $('#quantumParagraph').hide();
    }

    // Recalculate service time when algorithm changes
    recalculateServiceTime();
  }
});

// Function to add a new row to the input table
function addRow() {
  var lastRow = $('#inputTable tr:last');
  var lastRowNumber = isNaN(parseInt(lastRow.children()[1].innerText)) ? -1 : parseInt(lastRow.children()[1].innerText);

  var newRow = '<tr><td>P'
    + (lastRowNumber + 1)
    + '</td><td>'
    + (lastRowNumber + 1)
    + '</td><td><input class="exectime" type="text"/></td>'
    + '<td class="priority-only"><input type="text"/></td>'
    + '<td><button onclick="deleteRow(this);">Delete</button></td></tr>';

  lastRow.after(newRow);

  var minus = $('#minus');
  minus.show();
  minus.css('top', (parseFloat(minus.css('top')) + 24) + 'px');

  // Show or hide priority input fields based on the selected algorithm
  if ($('input[name=algorithm]:checked', '#algorithm').val() != "priority" && $('input[name=algorithm]:checked', '#algorithm').val() != "preemptive_priority") {
    $('.priority-only').hide();
  } else {
    $('.priority-only').show();
  }

  // Recalculate service time when input values change
  $('#inputTable tr:last input').change(function () {
    recalculateServiceTime();
  });
}

// Function to delete the last row from the input table
function deleteRow() {
  var lastRow = $('#inputTable tr:last');
  lastRow.remove();

  var minus = $('#minus');
  minus.css('top', (parseFloat(minus.css('top')) - 24) + 'px');

  if (parseFloat(minus.css('top')) < 150) {
    minus.hide();
  }
}

// Function to recalculate the total service time based on the selected algorithm
function recalculateServiceTime() {
  var inputTable = $('#inputTable tr');
  var totalExecuteTime = 0;

  var algorithm = $('input[name=algorithm]:checked', '#algorithm').val();
  
  // First Come First Serve algorithm
  if (algorithm == "fcfs") {
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      totalExecuteTime += executeTime;
    });
  } 
  // Shortest Job First algorithm
  else if (algorithm == "sjf") {
    var executeTimes = [];
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      executeTimes.push(executeTime);
    });

    executeTimes.sort((a, b) => a - b);
    executeTimes.forEach(time => {
      totalExecuteTime += time;
    });
  } 
  // Priority and Preemptive Priority algorithms
  else if (algorithm == "priority" || algorithm == "preemptive_priority") {
    var executeTimes = [];
    var priorities = [];
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      var priority = parseInt($(value.children[3]).children().first().val());
      executeTimes.push(executeTime);
      priorities.push(priority);
    });

    var sorted = executeTimes.map((e, i) => ({ executeTime: e, priority: priorities[i] }))
                             .sort((a, b) => a.priority - b.priority);
    sorted.forEach(item => {
      totalExecuteTime += item.executeTime;
    });
  } 
  // Round Robin algorithm
  else if (algorithm == "robin") {
    $('#minus').css('left', '335px');
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      totalExecuteTime += executeTime;
    });
  } 
  // Shortest Remaining Job First algorithm
  else if (algorithm == "srjf") {
    var executeTimes = [];
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      executeTimes.push(executeTime);
    });

    executeTimes.sort((a, b) => a - b);
    executeTimes.forEach(time => {
      totalExecuteTime += time;
    });
  }
}

// Function to handle the animation
function animate() {
  $('fresh').prepend('<div id="curtain" style="position: absolute; right: 0; width:100%; height:100px;"></div>');
  $('#curtain').width($('#resultTable').width());
  $('#curtain').css({ left: $('#resultTable').position().left });

  var sum = 0;
  $('.exectime').each(function() {
    var executeTime = Number($(this).val());
    if (!isNaN(executeTime) && executeTime > 0) {
      sum += executeTime;
    }
  });

  var distance = $("#curtain").css("width");
  animationStep(sum, 0);
  jQuery('#curtain').animate({ width: '0', marginLeft: distance }, sum * 1000 / 2, 'linear');
}

// Function to update the timer during the animation
function animationStep(steps, cur) {
  $('#timer').html(cur);
  if (cur < steps) {
    setTimeout(function() { 
      animationStep(steps, cur + 1);
    }, 500);
  }
}

// Function to draw the Gantt chart based on the selected algorithm
function draw() {
  $('fresh').html('');
  var inputTable = $('#inputTable tr');
  var th = '';
  var td = '';

  var algorithm = $('input[name=algorithm]:checked', '#algorithm').val();

  // First Come First Serve algorithm
  if (algorithm == "fcfs") {
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      if (!isNaN(executeTime) && executeTime > 0) {
        th += '<th style="height: 60px; width: ' + executeTime * 20 + 'px;">P' + (key - 1) + '</th>';
        td += '<td>' + executeTime + '</td>';
      }
    });
  } 
  // Shortest Job First algorithm
  else if (algorithm == "sjf") {
    var executeTimes = [];
    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      executeTimes.push({ executeTime: executeTime, P: key - 1 });
    });

    executeTimes.sort((a, b) => a.executeTime - b.executeTime);
    executeTimes.forEach(value => {
      th += '<th style="height: 60px; width: ' + value.executeTime * 20 + 'px;">P' + value.P + '</th>';
      td += '<td>' + value.executeTime + '</td>';
    });
  } 
  // Priority and Preemptive Priority algorithms
  else if (algorithm == "priority" || algorithm == "preemptive_priority") {
    var executeTimes = [];
    var priorities = [];
    $.each(inputTable, function (key, value) {
        if (key == 0) return true;
        var executeTime = parseInt($(value.children[2]).children().first().val());
        var priority = parseInt($(value.children[3]).children().first().val());
        executeTimes[key - 1] = { "executeTime": executeTime, "P": key - 1, "priority": priority };
    });

    executeTimes.sort((a, b) => a.priority - b.priority);
    executeTimes.forEach(value => {
        th += '<th style="height: 60px; width: ' + value.executeTime * 20 + 'px;">P' + value.P + '</th>';
        td += '<td>' + value.executeTime + '</td>';
    });

    $('fresh').html('<table id="resultTable" style="width: 70%"><tr>'
        + th
        + '</tr><tr>'
        + td
        + '</tr></table>'
    );
  } 
  // Round Robin algorithm
  else if (algorithm == "robin") {
    var quantum = parseInt($('#quantum').val());
    var executeTimes = [];

    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      executeTimes.push({ executeTime: executeTime, P: key - 1 });
    });

    var areWeThereYet = false;
    while (!areWeThereYet) {
      areWeThereYet = true;
      executeTimes.forEach(value => {
        if (value.executeTime > 0) {
          th += '<th style="height: 60px; width: ' + Math.min(quantum, value.executeTime) * 20 + 'px;">P' + value.P + '</th>';
          td += '<td>' + Math.min(quantum, value.executeTime) + '</td>';
          value.executeTime -= quantum;
          areWeThereYet = false;
        }
      });
    }
  } 
  // Shortest Remaining Job First algorithm
  else if (algorithm == "srjf") {
    var executeTimes = [];
    var processDetails = [];

    inputTable.each(function (key, value) {
      if (key == 0) return true;
      var executeTime = parseInt($(value.children[2]).children().first().val());
      executeTimes.push(executeTime);
      processDetails.push({ executeTime: executeTime, P: key - 1 });
    });

    executeTimes.sort((a, b) => a - b);
    executeTimes.forEach(executeTime => {
      var processDetail = processDetails.find(pd => pd.executeTime === executeTime);
      if (!isNaN(executeTime) && executeTime > 0) {
      th += '<th style="height: 60px; width: ' + executeTime * 20 + 'px;">P' + processDetail.P + '</th>';
      td += '<td>' + executeTime + '</td>';
      }
    });
  }

  $('fresh').html('<table id="resultTable" style="width: 70%"><tr>' + th + '</tr><tr>' + td + '</tr></table>');
  animate();
}
