import { Stack, StackProps, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class KeepCapsuleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ✅ S3 Bucket
    const fileBucket = new s3.Bucket(this, "KeepCapsuleBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ✅ DynamoDB Table
    const usersTable = new dynamodb.Table(this, "KeepCapsuleUsersTable", {
      partitionKey: { name: "customerId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // ✅ IAM Role for Lambdas
    const lambdaRole = new iam.Role(this, "KeepCapsuleLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    fileBucket.grantReadWrite(lambdaRole);
    usersTable.grantReadWriteData(lambdaRole);

    // ✅ Lambda Functions
    const registerUser = this.createFunction(
      "registerUser",
      lambdaRole,
      fileBucket
    );
    const loginUser = this.createFunction("loginUser", lambdaRole, fileBucket);
    const uploadFile = this.createFunction(
      "uploadFile",
      lambdaRole,
      fileBucket
    );
    const getFiles = this.createFunction("getFiles", lambdaRole, fileBucket);

    // ✅ API Gateway
    const api = new apigateway.RestApi(this, "KeepCapsuleApi", {
      restApiName: "KeepCapsule Service",
    });

    const register = api.root.addResource("register");
    register.addMethod("POST", new apigateway.LambdaIntegration(registerUser));

    const login = api.root.addResource("login");
    login.addMethod("POST", new apigateway.LambdaIntegration(loginUser));

    const upload = api.root.addResource("upload");
    const files = api.root.addResource("files");

    // ✅ OPTIONS method for /upload (CORS)
    upload.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": "'*'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: { "application/json": '{"statusCode": 200}' },
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // ✅ POST method with CORS headers
    upload.addMethod("POST", new apigateway.LambdaIntegration(uploadFile), {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
      ],
    });

    // ✅ OPTIONS method for /files (CORS)
    files.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": "'*'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,GET'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: { "application/json": '{"statusCode": 200}' },
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // ✅ GET method with CORS headers
    files.addMethod("GET", new apigateway.LambdaIntegration(getFiles), {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });
  }

  private createFunction(
    name: string,
    role: iam.Role,
    bucket: s3.Bucket
  ): lambda.Function {
    return new lambda.Function(this, `${name}Function`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("src/lambdas"),
      handler: `${name}.handler`,
      role,
      timeout: Duration.seconds(10),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        USERS_TABLE: "KeepCapsuleUsersTable",
      },
    });
  }
}
