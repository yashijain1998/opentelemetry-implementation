
const express = require('express')
const axios = require('axios')
const logger = require('./winston/config')
logger.info('index app started');

const otel = require('@opentelemetry/api')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const myMeter = otel.metrics.getMeter(
  'my-service-meter'
);

// var log = bunyan.createLogger({name: "myapp"});

app.get('/hello', async (req, res) => {
  logger.info('hello endpoint hit');
  var lastUsage = process.cpuUsage();
  const observableGauge = myMeter.createObservableGauge('cpuMemoryUsage', {
    description: 'gives cpu and memory usage for this process',
  });

  const apiResponse = await axios.get('https://randomuser.me/api/')

  var usage = process.cpuUsage(lastUsage);
  // myMeter.createObservableGauge('candm_usage', {
  //   description: 'gives cpu and memory usage',
  // }, (observableResult) => {
  //   observableResult.observe(1, { 'cpuUsage': usage.user, 'memoryUsage': process.memoryUsage().heapUsed });
  // });
  observableGauge.addCallback((observableResult) => {
      observableResult.observe(1, { 'cpuUsage': usage.user, 'memoryUsage': process.memoryUsage().heapUsed });
  });
  res.status(200).send({
    success: true,
    result: apiResponse.data,
  })
})

app.get('/random', async (req, res) => {
  // log.info("hi from random");
  logger.info('random endpoint hit');
    const apiResponse = await axios.get('https://api.npoint.io/85120f15b4218bd73489')
    res.status(200).send({
      success: true,
      result: apiResponse.data,
    })
  })

app.listen(3000, (req, res) => {
  console.log('server started')
})