#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { KeepCapsuleStack } from "../stacks/KeepCapsuleStack";

const app = new cdk.App();
new KeepCapsuleStack(app, "KeepCapsuleStack");
