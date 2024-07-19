require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { uuid } = require('uuid');

const app = express();
const port = 3000;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const s3Bucket = 'mw-code-tester';
const s3Prefix = 'YASH_SHAH';

app.use(bodyParser.json());

app.post('/ingest', (req, res) => {
  try {
    const logs = req.body;
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'Invalid logs format' });
    }

    // Sort logs by 'time'
    logs.sort((a, b) => a.time - b.time);

    // Save sorted logs to S3
    const timestamp = new Date().toISOString().replace(/\D/g, '');
    const s3Key = `${s3Prefix}/logs_${timestamp}.json`;

    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: JSON.stringify(logs),
      ContentType: 'application/json'
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading to S3:', err);
        return res.status(500).json({ error: 'Failed to save logs to S3' });
      }
      console.log('Logs saved to S3:', data.Location);
      res.json({ message: 'Logs ingested and saved to S3' });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/query', async (req, res) => {
  try {
    const { start, end, text } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Both start and end timestamps are required' });
    }

    // List objects in S3 bucket with prefix
    const params = {
      Bucket: s3Bucket,
      Prefix: s3Prefix
    };

    const objects = await s3.listObjectsV2(params).promise();
    const logs = [];

    for (const obj of objects.Contents) {
      if (obj.Key.endsWith('.json')) {
        const response = await s3.getObject({ Bucket: s3Bucket, Key: obj.Key }).promise();
        const fileContent = response.Body.toString('utf-8');
        const logEntries = JSON.parse(fileContent);

        for (const log of logEntries) {
          const logTime = log.time.toString();
          if (logTime >= start && logTime <= end && (!text || log.log.includes(text))) {
            logs.push(log);
          }
        }
      }
    }

    res.json(logs);
  } catch (error) {
    console.error('Error querying logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is Listening on http://localhost:${port}`);
});