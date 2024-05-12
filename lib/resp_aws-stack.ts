import { Stack, StackProps, aws_s3 as s3, aws_dynamodb as dynamodb,
aws_lambda as lambda,
aws_ec2 as ec2, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_apigatewayv2 as apigatewayv2 } from 'aws-cdk-lib';
import { aws_apigatewayv2_integrations as apigatewayv2integ } from 'aws-cdk-lib';
import * as path from 'path';


export class RespAwsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props,);

    // S3 Bucket
    const bucket = new s3.Bucket(this, 'UserFilesBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'FilesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Function
    const apiLambda = new lambda.Function(this, 'ApiHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'api.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        DYNAMO_TABLE: table.tableName
      }
    });

    bucket.grantReadWrite(apiLambda);
    table.grantReadWriteData(apiLambda);

    // Define the HTTP API
    const httpApi = new apigatewayv2.HttpApi(this, 'MyHttpApi', {
      apiName: 'ServiceHttpApi',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigatewayv2.CorsHttpMethod.GET, apigatewayv2.CorsHttpMethod.POST]
      },
      defaultIntegration: new apigatewayv2integ.HttpLambdaIntegration('LambdaIntegration', apiLambda),
    });

    // Output the URL of the HTTP API
    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: httpApi.apiEndpoint
    });

     // Importing the VPC
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: "vpc-00b569f574ae6e995", // your VPC ID
      region: "us-east-1"
    });

    // Create a security group
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow http and https access to ec2 instances',
      allowAllOutbound: true   // Allowing all outbound traffic (modify as needed)
    });

     // Add ingress rule for HTTP on port 80
     securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access');

     // Add ingress rule for HTTP on port 80
     securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow HTTP access');

     // Add ingress rule for HTTPS on port 443
     securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS access');

      // Add ingress rule for HTTPS on port 8080
      securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Allow HTTP access');

    // Select public subnets based on subnet group name assuming they are named/grouped appropriately
    const publicSubnets = vpc.selectSubnets({
      subnetGroupName: 'Public' // Ensure this matches how subnets are grouped/named in your setup
  });

    // Instance to demonstrate usage
    const instance = new ec2.Instance(this, 'Instance', {
        vpc,
        vpcSubnets: {
            subnets: publicSubnets.subnets
        },
        machineImage: new ec2.AmazonLinuxImage(),
        instanceType: new ec2.InstanceType('t3.micro'),
        securityGroup: securityGroup
    });

    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId
  });
  
  new cdk.CfnOutput(this, 'InstancePublicIP', {
      value: instance.instancePublicIp
  });

  }
}

  
    

