const { each } = require("jquery");

// Initial call to recalculate service time
recalculateServiceTime();

// Hide elements with the class 'priority-only' at the start
$('.priority-only').hide();



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
  else if (algorithm == "priority" ) {
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

    // Preemptive Priority Scheduling
    if (algorithm == "priority") {
      var quantum = parseInt($('#quantum').val());
      var currentTime = 0;
      var i=0;
      while (executeTimes.some(p => p.executeTime > 0)) {
        
          // Filter and sort processes that still have remaining execution time by priority
          var availableProcesses = executeTimes.filter(p => p.executeTime > 0).sort((a, b) => a.priority - b.priority);
          if (availableProcesses.length === 0) break;

          var currentProcess = availableProcesses[i];
          var timeSlice = Math.min(currentProcess.executeTime, quantum);

          currentProcess.executeTime -= timeSlice;
          currentTime += timeSlice;

          th += '<th style="height: 60px; width: ' + timeSlice * 20 + 'px;">P' + currentProcess.P + '</th>';
          td += '<td>' + timeSlice + '</td>';
          i++;
          i%=availableProcesses.length;
      }

    } else if (algorithm == "preemptive_priority") {
      var quantum = parseInt($('#quantum').val());
      var executeTimes = [];
      var priorities = [];
      var processDetails = [];
      
      inputTable.each(function (key, value) {
          if (key == 0) return true;
          var executeTime = parseInt($(value.children[2]).children().first().val());
          var priority = parseInt($(value.children[3]).children().first().val());
          processDetails.push({ executeTime: executeTime, priority: priority, P: key - 1 });
      });
  
      var currentTime = 0;
      while (processDetails.some(p => p.executeTime > 0)) {
          // Filter and sort processes that still have remaining execution time by priority
          var availableProcesses = processDetails.filter(p => p.executeTime > 0).sort((a, b) => a.priority - b.priority);
          availableProcesses.sort((a, b) => a.priority - b.priority);
          if (availableProcesses.length === 0) break;
  
        
          var currentProcess = availableProcesses[0];
          var timeSlice = Math.min(currentProcess.executeTime, quantum);
  
          currentProcess.executeTime -= timeSlice;
          currentTime += timeSlice;
  
          th += '<th style="height: 60px; width: ' + timeSlice * 20 + 'px;">P' + currentProcess.P + '</th>';
          td += '<td>' + timeSlice + '</td>';
        
          
          if( currentProcess.executeTime>0)
          {
                if(currentProcess.priority ==availableProcesses[1].priority )
                {
                  console.log("in");
                  var swap = availableProcesses[0];
                  availableProcesses[0] = availableProcesses[1]
                  availableProcesses[1]=swap;
                }
          }
      }
  
      $('fresh').html('<table id="resultTable" style="width: 70%"><tr>' + th + '</tr><tr>' + td + '</tr></table>');
      animate();
    }
  

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

    var allDone = false;
    while (!allDone) {
      allDone = true;
      executeTimes.forEach(value => {
        if (value.executeTime > 0) {
          var timeSlice = Math.min(quantum, value.executeTime);
          th += '<th style="height: 60px; width: ' + timeSlice * 20 + 'px;">P' + value.P + '</th>';
          td += '<td>' + timeSlice + '</td>';
          value.executeTime -= timeSlice;
          if (value.executeTime > 0) allDone = false;
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

    executeTimes.sort((a, b) => a.executeTime - b.executeTime);
    var remainingTimes = executeTimes.slice();
    remainingTimes.sort((a, b) => a.executeTime - b.executeTime);
    var currentTime = 0;
    
    while (remainingTimes.some(time => time > 0)) {
      var minTime = Math.min(...remainingTimes.filter(time => time > 0));
      currentTime += minTime;
      remainingTimes = remainingTimes.map(time => time > 0 ? time - minTime : 0);
      
      processDetails.forEach(pd => {
        if (pd.executeTime > 0) {
          pd.executeTime -= minTime;
          if (pd.executeTime < 0) pd.executeTime = 0;
          th += '<th style="height: 60px; width: ' + minTime * 20 + 'px;">P' + pd.P + '</th>';
          td += '<td>' + minTime + '</td>';
        }
      });
    }
  }

  $('fresh').html('<table class="outputTable" id="resultTable" style="width: 70%"><tr>' + th + '</tr><tr>' + td + '</tr></table>');
  animate();
}
