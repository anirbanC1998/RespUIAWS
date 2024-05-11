import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';


// The code that defines your stack goes here

const bucket = new s3.Bucket(this, 'UserFilesBucket', {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
});

import * as dynamodb from '@aws-cdk/aws-dynamodb';

const table = new dynamodb.Table(this, 'FilesTable', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});
  

  
    

