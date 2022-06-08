# Welcome to your CDK TypeScript project

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template



# reference
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html


## running locally
`sam local invoke -t cdk.out/StripePaymentNotificationsStack.template.json  HelloHandler -e test/testevent.json`

`sam local invoke -t cdk.out/StripePaymentNotificationsStack.template.json  HelloHandler -e test/paymentFailedEvent.json`

rm -rf cdk.out; cdk synth; sam local invoke -t cdk.out/StripePaymentNotificationsStack.template.json  HelloHandler -e test/paymentFailedEvent.json


## ref
https://github.com/bobbyhadz/cdk-typescript-lambda

https://bobbyhadz.com/blog/aws-cdk-lambda-function-example
    
https://bobbyhadz.com/blog/aws-cdk-typescript-lambda



# test stripe:
curl https://api.stripe.com/v1/customers/cus_KuAEP5iZ8XHBDI   -u <api key>

https://www.freecodecamp.org/news/aws-cdk-v2-three-tier-serverless-application/




`cdk deploy --profile=<profile_name> --parameters subscriptionEmail="<email_to_send_notifications_to>"`