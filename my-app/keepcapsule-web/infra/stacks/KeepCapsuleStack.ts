import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Duration } from "aws-cdk-lib";

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

    const lambdaRole = new iam.Role(this, "KeepCapsuleLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    fileBucket.grantReadWrite(lambdaRole);
    fileMetadataTable.grantReadWriteData(lambdaRole);
    usersTable.grantReadWriteData(lambdaRole);

    const registerUser = this.createFunction(
      "registerUser",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );
    const loginUser = this.createFunction(
      "loginUser",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );
    const uploadFile = this.createFunction(
      "uploadFile",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );
    const getFiles = this.createFunction(
      "getFiles",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );
    const deleteFile = this.createFunction(
      "deleteFile",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );
    const getUserStorage = this.createFunction(
      "getUserStorage",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );
    const mockUsage = this.createFunction(
      "mockStorageUsage",
      lambdaRole,
      fileBucket,
      fileMetadataTable
    );

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

    const register = api.root.addResource("register");
    register.addMethod("POST", new apigateway.LambdaIntegration(registerUser));
    addCorsOptions(register, "POST");

    const login = api.root.addResource("login");
    login.addMethod("POST", new apigateway.LambdaIntegration(loginUser));
    addCorsOptions(login, "POST");

    const upload = api.root.addResource("upload");
    upload.addMethod("POST", new apigateway.LambdaIntegration(uploadFile));
    addCorsOptions(upload, "POST");

    const files = api.root.addResource("files");
    files.addMethod("GET", new apigateway.LambdaIntegration(getFiles));
    files.addMethod("DELETE", new apigateway.LambdaIntegration(deleteFile));
    addCorsOptions(files, "GET,DELETE");

    const usage = api.root.addResource("usage");
    usage.addMethod("GET", new apigateway.LambdaIntegration(getUserStorage));
    addCorsOptions(usage, "GET");

    const mock = api.root.addResource("mock-usage");
    mock.addMethod("GET", new apigateway.LambdaIntegration(mockUsage));
    addCorsOptions(mock, "GET");
  }

  private createFunction(
    name: string,
    role: iam.Role,
    bucket: s3.Bucket,
    metadataTable: dynamodb.Table
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
        METADATA_TABLE: metadataTable.tableName,
      },
    });
  }
}
