#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { KeepCapsuleStack } from "../stacks/KeepCapsuleStack";

const app = new cdk.App();

new KeepCapsuleStack(app, "KeepCapsuleStack", {
  env: {
    account: "248189922191",
    region: "eu-west-1",
  },
});
