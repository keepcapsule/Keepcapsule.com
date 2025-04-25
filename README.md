# Keepcapsule.com

📂 my-app/keepcapsule-web/ → This is your frontend React app
📂 my-app/keepcapsule-web/infra/ → This is your CDK backend (infra)

Never lose a memory. Keep them safe forever.

<!-- to zip a file  -->

zip -r src.zip src

npm i
export AWS_PROFILE=keepcapsule-deploy

<!-- confirm it  -->

aws sts get-caller-identity

<!-- to run localhost from root -->

npm run start from root

<!-- user name and password for admin  -->

email: "admin@keepcapsule.com",
password: "admin123",

<!-- deploy from infra  -->

make sure leapp is running

export AWS_PROFILE=keepcapsule-deploy
npx cdk bootstrap
npx cdk deploy

<!-- project structure -->

/infra <- CDK backend project
/src <- React frontend
/src/lambdas <- Local copy of Lambda functions
/src/pages <- Dashboard and auth flows
/src/utils <- Helpers (we’ll use these for API and compression)

<!-- deploy front end  -->

- keepcapsule web
  npm i
  npm run build
