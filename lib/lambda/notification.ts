const https = require('https');
import {SNSClient, PublishCommand, PublishCommandInput} from '@aws-sdk/client-sns';

function getCustomerDetail(customer) {
  const url = `https://api.stripe.com/v1/customers/${customer}`;
  const options = {
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Basic APIKEY`
      }   
  };

  return new Promise(function(resolve, reject) {
    const req = https.get(url, options, (res) => {
        // resolve(res);
        let body = [];
        // res.setEncoding('utf8');
        res.on('data', chunk => {
          body.push(chunk);
        })
        res.on('end', () => {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
              reject(e);
          }
          resolve(body);
        })
      })
      req.on('error', e => reject(e.message));
      // req.write(JSON.stringify(payload));
      req.end();
    });
}

async function handler(event) {

  // const record = JSON.parse(event.Records[0].Sns.Message);
  const record = JSON.parse(event.body);

  // console.log("request:", JSON.stringify(event.Records[0].Sns.Message));

  const eventType = record.type;
  const customer = record.data.object.customer_name;
  const failureMessage = record.type;

  // const detail = await getCustomerDetail(customer);

  console.log("%s: %s for %s", eventType, failureMessage, customer);
  // console.log("%s", JSON.stringify(detail));

  const params : PublishCommandInput = {
    Message: `${eventType}: ${customer}\n${failureMessage}\n`,
    TopicArn: process.env.TOPIC_ARN,
    Subject: `Stripe Payment Failure - ${eventType}: ${customer}`,
  }

  const sns = new SNSClient({region: process.env.AWS_REGION});
  const publishCommand = new PublishCommand(params);
  await sns.send(publishCommand);

  return {
    statusCode: 200,
    body: JSON.stringify({status: "OK"}),
  };
};

module.exports = {handler};