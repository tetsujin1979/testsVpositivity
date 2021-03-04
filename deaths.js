function DailyDeaths(items) {
  const thisObject = this;
  const csvHeader = ['Date,Daily Deaths,Change In Deaths,Percentage Change In Daily Deaths,Total Deaths'];
  thisObject.data = new Array();
  thisObject.graphData = new Array();
  thisObject.name = 'deaths';
  thisObject.tableHead = '<tr><th>Date</th><th>Deaths</th><th>Change</th><th>% Change</th><th>Total Deaths</th></tr>';
      
  thisObject.dailyDeaths = {
    label: "Deaths",
    data: [],
    backgroundColor: "rgba(63, 63, 191, 0.6)",
    borderColor: "rgba(14, 54, 201, 0.5)",
    borderWidth: 0,
    yAxisID: "dailyDeathsAxis"
  };
  
  thisObject.totalDeaths = {
    label: "Total Deaths",
    data: [],
    backgroundColor: "transparent",
    borderColor: "rgba(237, 100, 127, .6)",
    borderWidth: 2,
    type: "line",
    yAxisID: "totalDeathsAxis"
  };

  thisObject.chartConfig = {
    type: "bar",
    data: {
      labels: [],
      datasets: [thisObject.totalDeaths, thisObject.dailyDeaths]
    },
    options: {
        scales: {
          yAxes: [{
              id: "dailyDeathsAxis",
              ticks: {
                  beginAtZero: true
              },
              gridLines: {
                  display: false
              },
              scaleLabel: {
                  display: true,
                  labelString: "Daily Deaths"
              }
          }, {
              id: "totalDeathsAxis",
              position: "right",
              ticks: {
                  beginAtZero: true
              },
              gridLines: {
                  display: false
              },
              scaleLabel: {
                  display: true,
                  labelString: "Total Cases"
              }
          }]
        },
        tooltips: {
            mode: 'label',
            callbacks: {
              label: function (tooltipItem, data) {
                let datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
                let datasetValue = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                let total = 0;
                let percentageChange = 0;
                let difference = 0;
                for (let i = 0; i < data.datasets.length; i++) {
                  if (data.datasets[i].label === 'Deaths' && tooltipItem.index > 0) {
                      let previousValue = Number(data.datasets[i].data[tooltipItem.index - 1]);
                      let currentValue = Number(data.datasets[i].data[tooltipItem.index]);
                      difference = currentValue - previousValue;
                      percentageChange = ((difference * 100) / previousValue).toFixed(2);
                  }
                }

                if (tooltipItem.datasetIndex != data.datasets.length - 1) {
                    return datasetLabel + ": " + datasetValue;
                } else {
                    total = total.toString().includes('.') ? total.toFixed(2) : total;
                    difference = difference.toString().includes('.') ? difference.toFixed(2) : difference;
                    let retVal = [datasetLabel + ": " + datasetValue, 'Difference: ' + difference];
                    if (percentageChange !== "Infinity") {
                      retVal.push('% Difference: ' + percentageChange + '%');
                    }
                    return retVal;
                 }
              }
           }
        }
    }
  };

  thisObject.populateData = function(items) {
    let totalDeaths = 0;
    items.forEach(function(item, index) { 
      if (item.date && item.deaths) {
        let deathData = {
          date: item.date,
          deaths: item.deaths,
          totalDeaths: totalDeaths
        }
        totalDeaths += item.deaths;
        thisObject.data.push(deathData);
      }
    });
  }

  thisObject.allDates = function() {
    thisObject.graphData = new Array();
    thisObject.data.forEach(function(value, index) {
      thisObject.graphData.push(value);
    });
  }

  thisObject.twoMonthViewOptions = function() {
    let startTimestamps = new Array();
    thisObject.data.forEach(function(value, index) {
      let date = new Date(value.date.getTime());
      date.setDate(1);
      date.setHours(12);
      let startTimestamp = date.getTime();
      if (!startTimestamps.includes(startTimestamp)) {
          startTimestamps.push(startTimestamp);
      }
    });
    return startTimestamps;
  };

  thisObject.lastTwoMonths = function() {
    thisObject.graphData = new Array();
    let twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    thisObject.data.forEach(function(value, index) {
      if (value.date > twoMonthsAgo) {
        thisObject.graphData.push(value);
      }
    });
  }
  
  thisObject.betweenDates = function(startDate, endDate) {
    thisObject.graphData = new Array();
    thisObject.data.forEach(function(item, index) {
      if (item.date >= startDate && item.date <= endDate) {
        thisObject.graphData.push(item);
      }
    });
  };

  thisObject.twoMonthView = function(startDate, endDate) {
    thisObject.graphData = new Array();
    thisObject.data.forEach(function(item, index) {
      if (item.date >= startDate && item.date <= endDate) {
        thisObject.graphData.push(item);
      }
    });
  }

  thisObject.getStartAndEndDates = function() {
    return {
      startDate: thisObject.data[0].date,
      endDate: thisObject.data[thisObject.data.length - 1].date
    }
  };

  thisObject.setTrendLine = function(displayTrendLine) {
    if (displayTrendLine) {
      thisObject.dailyDeaths.trendlineLinear = negativeSwabsTrendLine;
    } else {
      thisObject.dailyDeaths.trendlineLinear = null;
    }
  }

  thisObject.standardGraph = function() {
    reset();
    thisObject.graphData.forEach(function(value, index) { 
      thisObject.chartConfig.data.labels.push(value.date.toDateString());
      thisObject.dailyDeaths.data.push(value.deaths);
      thisObject.totalDeaths.data.push(value.totalDeaths);
    });
  }

  thisObject.byDay = function(day) {
    reset();
    thisObject.graphData.forEach(function(value, index) { 
      if (value.date.getDay() == day) {
        thisObject.chartConfig.data.labels.push(value.date.toDateString());
        thisObject.dailyDeaths.data.push(value.deaths);
        thisObject.totalDeaths.data.push(value.totalDeaths);
      }
    });
  };
  
  thisObject.dayAverage = function(increment, prefix) {
    reset();
    let initialTestsIndex = 0;
    let todayDay = new Date().getDay();
    for (let counter = 6; counter < 15; counter++) {
      if (thisObject.graphData[counter].date.getDay() === todayDay) {
        initialTestsIndex = counter;
        break;
      }
    }
    for (let counter = initialTestsIndex; counter < thisObject.graphData.length; counter += increment) {
      let today = thisObject.graphData[counter];
      let yesterday = thisObject.graphData[counter - 1];
      let twoDaysAgo = thisObject.graphData[counter - 2];
      let threeDaysAgo = thisObject.graphData[counter - 3];
      let fourDaysAgo = thisObject.graphData[counter - 4];
      let fiveDaysAgo = thisObject.graphData[counter - 5];
      let sixDayAgo = thisObject.graphData[counter - 6];
      let totalDeaths = today.deaths + yesterday.deaths + twoDaysAgo.deaths + threeDaysAgo.deaths + fourDaysAgo.deaths + fiveDaysAgo.deaths + sixDayAgo.deaths;
      
      thisObject.chartConfig.data.labels.push(prefix + today.date.toDateString());
      thisObject.dailyDeaths.data.push((totalDeaths / 7).toFixed(2));
      thisObject.totalDeaths.data.push(today.totalDeaths);
    }
  };

  thisObject.weeklyTotal = function() {
    reset();
    for (let counter = 6; counter < thisObject.graphData.length; counter++) {
      let today = thisObject.graphData[counter];
      if (today.date.getDay() === 6) {
        let today = thisObject.graphData[counter];
        let yesterday = thisObject.graphData[counter - 1];
        let twoDaysAgo = thisObject.graphData[counter - 2];
        let threeDaysAgo = thisObject.graphData[counter - 3];
        let fourDaysAgo = thisObject.graphData[counter - 4];
        let fiveDaysAgo = thisObject.graphData[counter - 5];
        let sixDayAgo = thisObject.graphData[counter - 6];
        let totalDeaths = today.deaths + yesterday.deaths + twoDaysAgo.deaths + threeDaysAgo.deaths + fourDaysAgo.deaths + fiveDaysAgo.deaths + sixDayAgo.deaths;

        thisObject.chartConfig.data.labels.push('Week ending ' + today.date.toDateString());
        thisObject.dailyDeaths.data.push(totalDeaths);
        thisObject.totalDeaths.data.push(today.totalDeaths);
      }
    }
  };

  thisObject.generateTableBody = function() {
    let tableBody = document.createElement('tbody');
    let previousDaysDeaths = 0;
    thisObject.graphData.forEach(function(item, index) {
      let newRow = tableBody.insertRow();
      
      let newCell = newRow.insertCell();
      let newText = document.createTextNode(item.date.toDateString());
      newCell.appendChild(newText);
      
      let dailyDeaths = item.deaths;
      createCell(newRow, dailyDeaths);

      if (index > 0) {
        let changeInDeaths = dailyDeaths - previousDaysDeaths;
        let percentageChange = ((changeInDeaths * 100) / previousDaysDeaths).toFixed(2)
        createCell(newRow, changeInDeaths);
        createCell(newRow, percentageChange);
      } else {
        createCell(newRow, '-');
        createCell(newRow, '-');
      }
      previousDaysDeaths = dailyDeaths;
      createCell(newRow, item.totalDeaths);
    });
    return tableBody;
  };
  
  thisObject.generateCSV = function() {
    let retVal = new Array();
    let previousDaysDeaths = 0;
    retVal.push(csvHeader);
    thisObject.graphData.forEach(function(item, index) {
      let csvData = new Array();
      let dailyDeaths = item.deaths;
      
      csvData.push(item.date.toDateString());
      csvData.push(dailyDeaths);      
      if (index > 0) {
          let changeInDeaths = dailyDeaths - previousDaysDeaths;
          let percentageChange = ((changeInDeaths * 100) / previousDaysDeaths).toFixed(2)
          csvData.push(changeInDeaths);
          csvData.push(percentageChange + '%');
      } else {
          csvData.push('-');
          csvData.push('-');
      }
      csvData.push(item.totalDeaths);
      previousDaysDeaths = dailyDeaths;
      retVal.push(csvData.join(','))
    });
    return retVal.join("\n");
  };
  
  function reset() {
    thisObject.chartConfig.data.labels = new Array();
    thisObject.dailyDeaths.data = new Array();
    thisObject.totalDeaths.data = new Array();
  }
};

const deaths = new DailyDeaths();
deaths.populateData(data);
