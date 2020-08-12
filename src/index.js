const config = require('./config');
const { Client: Minio } = require('minio');
const express = require('express');
const apiMetrics = require('prometheus-api-metrics');
const Prometheus = require('prom-client');

async function main() {
  const minio = new Minio(config.minio);
  if (!(await minio.bucketExists(config.bucket))) {
    await minio.makeBucket(config.bucket);
    console.log(`Bucket "${config.bucket}" created!`);
  }

  const tasksStarted = new Prometheus.Counter({
    name: 'nx_cache_tasks_started',
    help: 'Total number of started tasks',
  });

  const tasksFinished = new Prometheus.Counter({
    name: 'nx_cache_tasks_finished',
    help: 'Total number of finished tasks',
    labelNames: ['cache_status', 'target', 'project'],
  });

  const tasksDuration = new Prometheus.Counter({
    name: 'nx_cache_tasks_duration',
    help: 'Duration of tasks',
    labelNames: ['cache_status', 'target', 'project'],
  });

  const app = express();
  app.use(express.json());
  app.use(apiMetrics());
  app.use(express.static('public'));

  app.post('/nx-cloud/runs/start', async (req, res, next) => {
    try {
      tasksStarted.inc();
      const promises = req.body.hashes.map(async (hash) => {
        console.log(`Task started: hash=${hash}`);
        const [get, put] = await Promise.all([
          minio.presignedGetObject(config.bucket, hash, 8 * 60 * 60),
          minio.presignedUrl('PUT', config.bucket, hash, 8 * 60 * 60, {
            'Content-Type': 'application/octet-stream',
          }),
        ]);
        return [hash, { get, put }];
      });

      res.json({ urls: Object.fromEntries(await Promise.all(promises)) });
    } catch (err) {
      next(err);
    }
  });

  app.post('/nx-cloud/runs/end', async (req, res, next) => {
    try {
      req.body.tasks.forEach((task) => {
        const duration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
        const labels = {
          cache_status: task.cacheStatus,
          target: task.target,
          project: task.projectName,
        };

        tasksFinished.inc(labels, 1);
        tasksDuration.inc(labels, duration);

        console.log(`Task finished: hash=${task.hash} duration=${duration}ms status=${task.cacheStatus}`);
      });

      res.end('success');
    } catch (err) {
      next(err);
    }
  });

  const server = app.listen(config.port, () => {
    console.log(`Server started at http://localhost:${config.port}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err.stack || err);
  });
}

main();
