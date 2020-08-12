const types = ['no-remote-cache', 'remote-cache-miss', 'remote-cache-hit'];

const loadChartJs = () =>
  new Promise((resolve, reject) => {
    const $script = document.createElement('script');
    $script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js';
    $script.defer = true;
    $script.async = true;
    $script.onload = () => setTimeout(resolve, 0);
    $script.onerror = reject;
    document.head.append($script);
  });

const api = (url) => fetch(url).then((res) => res.json());

function statsReducer(acc, { value, labels }) {
  acc[labels.target] = acc[labels.target] || {};
  acc[labels.target][labels.project] = acc[labels.target][labels.project] || {};
  acc[labels.target][labels.project][labels.cache_status] =
    value + (acc[labels.target][labels.project][labels.cache_status] || 0);
  return acc;
}

async function main() {
  const $chart = document.getElementById('chart');
  const chartJsPromise = loadChartJs();
  const metrics = await api('/metrics.json');

  const durations = metrics.find((m) => m.name === 'nx_cache_tasks_duration')?.values.reduce(statsReducer, {});
  const counters = metrics.find((m) => m.name === 'nx_cache_tasks_finished')?.values.reduce(statsReducer, {});

  const stats = {};
  for (const target in counters) {
    for (const project in counters[target]) {
      stats[target] = stats[target] || { remote: 0, local: 0, miss: 0 };

      const count = counters[target]?.[project]?.['remote-cache-miss'] || 0;
      const avg = count > 0 ? (durations[target]?.[project]?.['remote-cache-miss'] || 0) / count : 0;
      stats[target].remote += ((counters[target]?.[project]?.['remote-cache-hit'] || 0) * avg) / 1000;
      stats[target].local += Math.max(0, (counters[target]?.[project]?.['no-remote-cache'] || 0) * avg) / 1000;
      stats[target].miss += (durations[target]?.[project]?.['remote-cache-miss'] || 0) / 1000;
    }
  }

  const colors = { local: '#58508d', remote: '#bc5090', miss: '#003f5c' };
  const labels = { local: 'Time saved by local cache', remote: 'Time saved by cloud cache', miss: 'Work time' };
  const data = [];
  for (const type of ['miss', 'local', 'remote']) {
    data.push({
      label: labels[type] || type,
      backgroundColor: colors[type] || '#ff6361',
      data: Object.values(stats).map((v) => v[type]),
    });
  }

  const barChartData = {
    labels: Object.keys(stats),
    datasets: data,
  };

  await chartJsPromise;
  new Chart($chart, {
    type: 'bar',
    data: barChartData,
    options: {
      title: {
        display: true,
        text: 'Workspace timesave chart',
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    },
  });
}

main();
