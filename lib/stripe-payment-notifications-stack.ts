import { Stack, StackProps, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class StripePaymentNotificationsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // get the email address specified in the subscriptionEmail parameter when the stack is created
    const emailAddress = new CfnParameter(this, 'subscriptionEmail');

    // create an SNS topic and add a single email subscription
    const emailTopic = new sns.Topic(this, 'stripe-emailnotification-topic');
    emailTopic.addSubscription(
      new EmailSubscription(
        emailAddress.value.toString(),
      ),
    );

    const postHandler = new NodejsFunction(this, 'HelloHandler', {
      // architecture: Architecture.ARM_64,
      entry: `${__dirname}/lambda/notification.ts`,
      logRetention: RetentionDays.ONE_DAY,
      bundling: {
        minify: true,
      },
      environment: {'TOPIC_ARN': emailTopic.topicArn}
    });

    // setup the API Gateway 

    // Stripe IPs where webhook calls are initiated from
    const stripeWebhookSourceIps = ["3.18.12.63", 
      "3.130.192.231",
      "13.235.14.237",
      "13.235.122.149",
      "18.211.135.69",
      "35.154.171.200",
      "52.15.183.38",
      "54.88.130.119",
      "54.88.130.237",
      "54.187.174.169",
      "54.187.205.235",
      "54.187.216.72]",
    ]

    // create the policy document to limit invocations only to the IPs specified above
    const restrictToStripeIps = new iam.PolicyDocument({
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          principals: [new iam.AnyPrincipal()],
          actions: ["execute-api:Invoke"],
          resources: ["execute-api:/*"]
        }),
        new PolicyStatement({
          effect: Effect.DENY,
          principals: [new iam.AnyPrincipal()],
          actions: ["execute-api:Invoke"],
          conditions: {
            "NotIpAddress": {
                "aws:SourceIp": stripeWebhookSourceIps
              }
          }
        })
      ]
    })

    // create the API Gateway
    const api = new apigateway.RestApi(this, 'StripeWebhookRestApi', {policy: restrictToStripeIps});

    // add the stripeevents resource to the gateway
    const stripeEvents = api.root.addResource('stripeevents');
    stripeEvents.addMethod('POST', new apigateway.LambdaIntegration(postHandler));

    emailTopic.grantPublish(postHandler);

  }
}
