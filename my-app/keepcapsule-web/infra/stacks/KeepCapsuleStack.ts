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

    // ✅ S3 bucket for uploads
    const fileBucket = new s3.Bucket(this, "KeepCapsuleBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ✅ DynamoDB table for users
    const usersTable = new dynamodb.Table(this, "KeepCapsuleUsersTable", {
      partitionKey: { name: "customerId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // ✅ Lambda role with S3 and DynamoDB permissions
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

    // ✅ Create all Lambda functions
    const registerUser = this.createFunction("registerUser", lambdaRole);
    const loginUser = this.createFunction("loginUser", lambdaRole);
    const uploadFile = this.createFunction("uploadFile", lambdaRole);
    const getFiles = this.createFunction("getFiles", lambdaRole);

    // ✅ API Gateway
    const api = new apigateway.RestApi(this, "KeepCapsuleApi", {
      restApiName: "KeepCapsule Service",
    });

    const register = api.root.addResource("register");
    register.addMethod("POST", new apigateway.LambdaIntegration(registerUser));

    const login = api.root.addResource("login");
    login.addMethod("POST", new apigateway.LambdaIntegration(loginUser));

    const upload = api.root.addResource("upload");
    upload.addMethod("POST", new apigateway.LambdaIntegration(uploadFile));

    const files = api.root.addResource("files");
    files.addMethod("GET", new apigateway.LambdaIntegration(getFiles));
  }

  private createFunction(name: string, role: iam.Role): lambda.Function {
    return new lambda.Function(this, `${name}Function`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(`src/lambdas`),
      handler: `${name}.handler`,
      role,
      timeout: Duration.seconds(10),
      environment: {
        BUCKET_NAME: "KeepCapsuleBucket",
        USERS_TABLE: "KeepCapsuleUsersTable",
      },
    });
  }
}
