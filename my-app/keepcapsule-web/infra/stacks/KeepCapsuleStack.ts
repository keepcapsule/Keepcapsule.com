// stacks/KeepCapsuleStack.ts
import { Stack, StackProps, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class KeepCapsuleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fileBucket = new s3.Bucket(this, "KeepCapsuleBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });

    const fileMetadataTable = new dynamodb.Table(
      this,
      "KeepCapsuleFileMetadata",
      {
        partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
        sortKey: { name: "filename", type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    const usersTable = new dynamodb.Table(this, "KeepCapsuleUsersTable", {
      partitionKey: { name: "customerId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    usersTable.addGlobalSecondaryIndex({
      indexName: "email-index",
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const lambdaRole = new iam.Role(this, "KeepCapsuleLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/keepcapsule/stripeSecretKey`,
        ],
      })
    );

    fileBucket.grantReadWrite(lambdaRole);
    fileMetadataTable.grantReadWriteData(lambdaRole);
    usersTable.grantReadWriteData(lambdaRole);

    const createLambda = (name: string): lambda.Function => {
      return new lambda.Function(this, `${name}Function`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: `${name}.handler`,
        code: lambda.Code.fromAsset("src/lambdas"),
        role: lambdaRole,
        timeout: Duration.seconds(10),
        environment: {
          BUCKET_NAME: fileBucket.bucketName,
          USERS_TABLE: usersTable.tableName,
          METADATA_TABLE: fileMetadataTable.tableName,
          STRIPE_SECRET_KEY: ssm.StringParameter.valueFromLookup(
            this,
            "/keepcapsule/stripeSecretKey"
          ),
        },
      });
    };

    const registerUser = createLambda("registerUser");
    const loginUser = createLambda("loginUser");
    const uploadFile = createLambda("uploadFile");
    const getFiles = createLambda("getFiles");
    const deleteFile = createLambda("deleteFile");
    const getUserStorage = createLambda("getUserStorage");
    const resetUsage = createLambda("resetUsage");
    const mockUsage = createLambda("mockStorageUsage");
    const getBreakdown = createLambda("getStorageBreakdown");
    const requestPasswordReset = createLambda("requestPasswordReset");
    const resetPassword = createLambda("resetPassword");
    const createCheckoutSession = createLambda("createCheckoutSession");
    const getStripeSession = createLambda("getStripeSession");

    const api = new apigateway.RestApi(this, "KeepCapsuleApi", {
      restApiName: "KeepCapsule Service",
      binaryMediaTypes: ["multipart/form-data"],
    });

    const addCorsOptions = (resource: apigateway.Resource, methods: string) => {
      resource.addMethod(
        "OPTIONS",
        new apigateway.MockIntegration({
          integrationResponses: [
            {
              statusCode: "200",
              responseParameters: {
                "method.response.header.Access-Control-Allow-Headers": "'*'",
                "method.response.header.Access-Control-Allow-Methods": `'OPTIONS,${methods}'`,
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
    };

    const otherRoutes = [
      { path: "register-v2", method: "POST", lambda: registerUser },
      { path: "upload", method: "POST", lambda: uploadFile },
      { path: "usage", method: "GET", lambda: getUserStorage },
      { path: "reset-usage", method: "GET", lambda: resetUsage },
      { path: "mock-usage", method: "GET", lambda: mockUsage },
      { path: "breakdown", method: "GET", lambda: getBreakdown },
      {
        path: "create-checkout-session",
        method: "POST",
        lambda: createCheckoutSession,
      },
      {
        path: "request-password-reset",
        method: "POST",
        lambda: requestPasswordReset,
      },
      { path: "reset-password", method: "POST", lambda: resetPassword },
    ];

    for (const { path, method, lambda } of otherRoutes) {
      const resource = api.root.addResource(path);
      resource.addMethod(
        method,
        new apigateway.LambdaIntegration(lambda, {
          proxy: false,
          integrationResponses: [
            {
              statusCode: "200",
              responseParameters: {
                "method.response.header.Access-Control-Allow-Origin": "'*'",
              },
              responseTemplates: {
                "application/json": "",
              },
            },
          ],
          requestTemplates: {
            "application/json": `{
              "body": "$util.escapeJavaScript($input.body).replaceAll("\\'","'")"
            }`,
          },
        }),
        {
          methodResponses: [
            {
              statusCode: "200",
              responseParameters: {
                "method.response.header.Access-Control-Allow-Origin": true,
              },
            },
          ],
        }
      );
      addCorsOptions(resource, method);
    }

    const loginRoute = api.root.addResource("login-v2");
    loginRoute.addMethod("POST", new apigateway.LambdaIntegration(loginUser));
    addCorsOptions(loginRoute, "POST");

    const files = api.root.addResource("files");
    files.addMethod("GET", new apigateway.LambdaIntegration(getFiles));
    files.addMethod("DELETE", new apigateway.LambdaIntegration(deleteFile));
    addCorsOptions(files, "GET,DELETE");

    const stripeSession = api.root.addResource("stripe-session");
    stripeSession
      .addResource("{sessionId}")
      .addMethod("GET", new apigateway.LambdaIntegration(getStripeSession));
  }
}
