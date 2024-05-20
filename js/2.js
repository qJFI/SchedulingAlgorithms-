
function handleAlgorithmChange() {
  const selectedAlgorithm = $('input[name=algorithm]:checked').val();
  const isPriority = selectedAlgorithm === 'priority' || selectedAlgorithm === 'preemptive_priority';
  const showQuantum = selectedAlgorithm === 'robin' || selectedAlgorithm === 'srjf' || selectedAlgorithm === 'preemptive_priority';

  $('.priority-only').toggle(isPriority);
  $('#quantumParagraph').toggle(showQuantum);
}

function addRow() {
  const selectedAlgorithm = $('input[name=algorithm]:checked').val();
  const rowCount = $('#inputTable tr').length - 1;
  const isPriority = selectedAlgorithm === 'priority' || selectedAlgorithm === 'preemptive_priority';
  const showQuantum = selectedAlgorithm === 'robin' || selectedAlgorithm === 'srjf' || selectedAlgorithm === 'preemptive_priority';

  
  const newRow = `
  
    <tr>
      <td>P${rowCount}</td>
      <td><input class="arrivalTime"  type="text" value="0" /></td>
      <td><input class="exectime" type="text"></td>
      <td class="priority-only"><input type="text"></td>
      <td><button onclick="deleteRow(this);">Delete</button></td>
    </tr>
  `;
  $('#inputTable').append(newRow);
  $('.priority-only').toggle(isPriority);
  $('#quantumParagraph').toggle(showQuantum);
}

function deleteRow(button) {
  $(button).closest('tr').remove();
}

function draw() {
  const selectedAlgorithm = $('input[name=algorithm]:checked').val();
  const inputRows = $('#inputTable tr').not(':first');
  let processes = inputRows.toArray().map((row, index) => ({
    process: `P${index}`,
    arrivalTime: parseInt($(row).find('.arrivalTime').val()) || 0,
    executeTime: parseInt($(row).find('.exectime').val()) || 0,
    priority: parseInt($(row).find('.priority-only input').val()) || 0,
    remainingTime: parseInt($(row).find('.exectime').val()) || 0 // for preemptive algorithms
  }));
  console.log(processes);

  switch (selectedAlgorithm) {
    case 'fcfs':
      processes =   processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
      break;
    case 'sjf':
      processes = sjf(processes);
      break;
    case 'priority':
      processes = priority(processes);
      break;
    case 'robin':
      processes = roundRobin(processes, parseInt($('#quantum').val()));
      break;
    case 'srjf':
      processes = srjf(processes, parseInt($('#quantum').val()));
      break;
    case 'preemptive_priority':
      processes = preemptivePriority(processes, parseInt($('#quantum').val()));
      break;
  }

  const ganttChart = generateGanttChart(processes);
  $('fresh').html(ganttChart);
  animate();
}





function sjf(processes) {
  let result = [];
  let time = 0;
  while (processes.some(p => p.remainingTime > 0)) {
    let readyProcesses = processes.filter(p => p.arrivalTime <= time && p.remainingTime > 0);
    if (readyProcesses.length > 0) {
      readyProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
      let currentProcess = readyProcesses[0];
      result.push({ ...currentProcess, executeTime: currentProcess.remainingTime });
      time += currentProcess.remainingTime;
      currentProcess.remainingTime = 0;
    } else {
      time++;
    }
  }
  return result;
}




function priority(processes) {
  let result = [];
  let time = 0;
  while (processes.some(p => p.remainingTime > 0)) {
    let readyProcesses = processes.filter(p => p.arrivalTime <= time && p.remainingTime > 0);
    if (readyProcesses.length > 0) {
      readyProcesses.sort((a, b) => a.priority - b.priority);
      let currentProcess = readyProcesses[0];
      result.push({ ...currentProcess, executeTime: currentProcess.remainingTime });
      time += currentProcess.remainingTime;
      currentProcess.remainingTime = 0;
    } else {
      time++;
    }
  }
  return result;
}

function roundRobin(processes, quantum) {
  let result = [];
  let queue = processes.slice();
  let time = 0;

  while (queue.length > 0) {
    const process = queue.shift();
    if (process.arrivalTime <= time) {
      if (process.remainingTime > quantum) {
        result.push({ ...process, executeTime: quantum });
        queue.push({ ...process, remainingTime: process.remainingTime - quantum });
        time += quantum;
      } else {
        result.push({ ...process, executeTime: process.remainingTime });
        time += process.remainingTime;
      }
    } else {
      queue.push(process);
    }
  }

  return result;
}

function srjf(processes, quantum) {
  let result = [];
  let time = 0;
  var readyProcesses =processes;
  while (readyProcesses.some(p => p.remainingTime > 0)) {
     readyProcesses = readyProcesses.filter(p =>  p.remainingTime > 0);
    let i=0;


    if (readyProcesses.length > 0) {
      readyProcesses.sort((a, b) =>  a.remainingTime - b.remainingTime);
  

      while(readyProcesses[0].arrivalTime>time){
        if(i==readyProcesses.length )
          time++;
      readyProcesses.push(readyProcesses.shift());
      i++;
      }
      let currentProcess = readyProcesses[0];
      let executeTime = Math.min(currentProcess.remainingTime, quantum);
      
      // Add the execution to the result
      result.push({
        process: currentProcess.process,
        executeTime: executeTime,
        startTime: time,
        endTime: time + executeTime
      });
      
      currentProcess.remainingTime -= executeTime;
      time += executeTime;
    } else {
      time++;
    }
  }

  return result;
}


function preemptivePriority(processes, quantum) {
  let result = [];
  let time = 0;
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort initially by arrival time
var readyProcesses =processes;
  while (readyProcesses.some(p => p.remainingTime > 0)) {
     readyProcesses = readyProcesses.filter(p =>  p.remainingTime > 0);
     let i=0;

    if (readyProcesses.length > 0) {
      readyProcesses.sort((a, b) => a.priority - b.priority); // Sort by priority first
    
      while(readyProcesses[0].arrivalTime>time){
        if(i==readyProcesses.length )
          time++;
      readyProcesses.push(readyProcesses.shift());
      i++;
      }

      let currentProcess = readyProcesses[0];
      let executeTime = Math.min(currentProcess.remainingTime, quantum);

      // Add the execution to the result
      result.push({
        process: currentProcess.process,
        executeTime: executeTime,
        startTime: time,
        endTime: time + executeTime
      });

      currentProcess.remainingTime -= executeTime;
      time += executeTime;
      readyProcesses.push(readyProcesses.shift());
      
    } else {
      time++;
    }
  }

  return result;
}

function generateGanttChart(processes) {
  let th = '';
  let td = '';
  processes.forEach(process => {
    if (process.executeTime > 0) {
      th += `<th style="height: 60px; width: ${process.executeTime * 20}px;">${process.process}</th>`;
      td += `<td>${process.executeTime}</td>`;
    }
  });
  return `<table id="resultTable" style="width: 70%"><tr>${th}</tr><tr>${td}</tr></table>`;
}

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

function animationStep(steps, cur) {
  $('#timer').html(cur);
  if (cur < steps) {
    setTimeout(function() { 
      animationStep(steps, cur + 1);
    }, 500);
  }
}
