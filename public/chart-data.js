const ctx0 = document.getElementById("chart-0").getContext("2d");
const ctx1 = document.getElementById("chart-1").getContext("2d");
const ctx2 = document.getElementById("chart-2").getContext("2d");
const intl = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
fetch("/data")
  .then((data) => data.json())
  .then((data) => {
    new Chart(ctx0, {
      type: "line",
      data: getDataPerWeek(data),
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Chart.js Line Chart",
        },
        tooltips: {
          mode: "index",
          intersect: false,
          position: "nearest",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Weeks",
              },
              offset: true
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Number",
              },
              ticks: {
                beginAtZero: true,
              },
            },
            {
              type: "linear",
              id: "avgPercent",
              display: true,
              position: "right",
              scaleLabel: {
                display: true,
                labelString: "Tests vs Confirmed %",
              },
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
              },
            },
          ],
        },
      },
    });
    new Chart(ctx1, {
      type: "line",
      data: {
        labels: data.map(row => intl.format(new Date(row.date))),
        datasets: [{
          label: '# of confirmed cases',
          data: data.map(row => row.confirmed),
          borderWidth: 1,
          fill: true,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }, {
          label: '# of tests',
          data: data.map(row => row.confirmed + row.negativeTests),
          fill: true
        }, {
          fill: false,
          borderColor: 'rgba(0, 0, 255, 0.2)',
          yAxisID: 'avgPercent',
          label: '% confirmed cases',
          data: data.map(({confirmed, negativeTests}) => {
            return Number((confirmed) / (confirmed + negativeTests) * 100).toFixed(2)
          })
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Chart.js Line Chart",
        },
        tooltips: {
          mode: "index",
          intersect: false,
          position: "nearest",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Days",
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Number",
              },
              ticks: {
                beginAtZero: true,
              },
            },
            {
              type: "linear",
              id: "avgPercent",
              display: true,
              position: "right",
              scaleLabel: {
                display: true,
                labelString: "Tests vs Confirmed %",
              },
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
              },
            },
          ],
        },
      },
    });
    let totalConfirmed = 0;
    let totalDeaths = 0;
    let totalRecovered = 0;
    const sumData = data.map((row) => {
      return {
        date: row.date,
        confirmed: (totalConfirmed += row.confirmed),
        dead: (totalDeaths += row.deaths),
        recovered: (totalRecovered += row.recovered),
      };
    });
    new Chart(ctx2, {
      type: "line",
      data: {
        labels: sumData.map((row) => intl.format(new Date(row.date))),
        datasets: [
          {
            label: "# of confirmed cases",
            data: sumData.map((row) => row.confirmed),
            borderWidth: 1,
            fill: true,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
          },
          {
            label: "# of deaths",
            data: sumData.map((row) => row.dead),
            fill: false,
            hidden: true,
            yAxisID: "yAxisActiveCases",
          },
          {
            label: "# recovered",
            data: sumData.map((row) => row.recovered),
            borderColor: "rgba(0, 255, 0, 0.2)",
            fill: false,
          },
          {
            label: "# of active cases",
            borderColor: "rgba(0, 0, 255, 0.5)",
            data: sumData.map((row) => row.confirmed - row.recovered - row.dead),
            yAxisID: "yAxisActiveCases",
            fill: false,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        tooltips: {
          mode: "index",
          intersect: false,
          position: "nearest",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Days",
              },
            },
          ],
          yAxes: [
            {
              display: true,
              type: "linear",
              scaleLabel: {
                display: true,
                labelString: "Number",
              },
            },
            {
              type: "linear",
              id: "yAxisActiveCases",
              display: true,
              position: "right",
              scaleLabel: {
                display: true,
                labelString: "# of active cases",
              },
              ticks: {
                display: true,
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  });

function getDataPerDay(data) {
  return {
    labels: data.map((row) => intl.format(new Date(row.date))),
    datasets: [
      {
        type: 'bar',
        label: "# of confirmed cases",
        data: data.map((row) => row.confirmed),
        borderWidth: 1,
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        type: 'bar',
        label: "# of tests",
        data: data.map((row) => row.confirmed + row.negativeTests),
        hidden: true,
        fill: false,
      },
      {
        type: 'bar',
        label: "# of recovered",
        data: data.map((row) => row.recovered),
        fill: false,
        borderWidth: 1,
        borderColor: "rgba(0, 255, 0, 0.7)",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
      },
      {
        fill: false,
        borderColor: "rgba(255, 128, 64, 1)",
        backgroundColor: "rgba(255, 128, 64, 0.5)",
        yAxisID: "avgPercent",
        label: "% confirmed cases",
        data: data.map(({ confirmed, negativeTests }) => {
          return Number(
            (confirmed / (confirmed + negativeTests)) * 100
          ).toFixed(2);
        }),
      },
    ],
  };
}

function getDataPerWeek(data) {
  const sumData = {
    confirmed: 0,
    negativeTests: 0,
    recovered: 0,
  };
  const dataPerWeek = data.reduce(
    (acc, { date, confirmed, negativeTests, recovered }) => {
      const dDate = new Date(date);
      if (dDate.getUTCDay() === 0) {
        acc.push({
          date: dDate,
          confirmed: sumData.confirmed,
          negativeTests: sumData.negativeTests,
          recovered: sumData.recovered,
        });
        sumData.confirmed = sumData.negativeTests = sumData.recovered = 0;
      } else {
        sumData.confirmed = sumData.confirmed + confirmed;
        sumData.negativeTests = sumData.negativeTests + negativeTests;
        sumData.recovered = sumData.recovered + recovered;
      }
      return acc;
    },
    []
  );
  return getDataPerDay(dataPerWeek);
}
