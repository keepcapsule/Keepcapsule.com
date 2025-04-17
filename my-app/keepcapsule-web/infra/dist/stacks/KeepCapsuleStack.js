"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeepCapsuleStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const aws_cdk_lib_2 = require("aws-cdk-lib");
class KeepCapsuleStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // ✅ S3 bucket for uploads
        const fileBucket = new s3.Bucket(this, "KeepCapsuleBucket", {
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        // ✅ DynamoDB table for users
        const usersTable = new dynamodb.Table(this, "KeepCapsuleUsersTable", {
            partitionKey: { name: "customerId", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        // ✅ Lambda role with S3 and DynamoDB permissions
        const lambdaRole = new iam.Role(this, "KeepCapsuleLambdaRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        });
        lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
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
    createFunction(name, role) {
        return new lambda.Function(this, `${name}Function`, {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(`src/lambdas`),
            handler: `${name}.handler`,
            role,
            timeout: aws_cdk_lib_2.Duration.seconds(10),
            environment: {
                BUCKET_NAME: "KeepCapsuleBucket",
                USERS_TABLE: "KeepCapsuleUsersTable",
            },
        });
    }
}
exports.KeepCapsuleStack = KeepCapsuleStack;
