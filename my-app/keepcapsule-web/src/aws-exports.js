const awsExports = {
    Auth: {
      region: "eu-west-1",  // ✅ Region is correct
      userPoolId: "eu-west-1_XOl6bfVPw",  // ✅ Ensure this matches exactly
      userPoolWebClientId: "4cvcnd1co75bl2tb0jgd8ka2c9",  // ✅ Ensure this is correct
      mandatorySignIn: false,  // ✅ Allow unauthenticated access
      oauth: {
        domain: "eu-west-1xol6bfvpw.auth.eu-west-1.amazoncognito.com",  // ✅ Ensure this is correct
        scope: ["email", "openid", "phone"],
        redirectSignIn: "http://localhost:3000/",
        redirectSignOut: "http://localhost:3000/",
        responseType: "code",
      },
    },
  };
  
  export default awsExports;
  