import React from "react";
import { Amplify } from "aws-amplify";
import { Authenticator, View, Button, useAuthenticator } from "@aws-amplify/ui-react";
import awsExports from "../aws-exports";

// ✅ Ensure Amplify is configured
Amplify.configure(awsExports);

export default function AuthComponent() {
  return (
    <Authenticator.Provider>  {/* ✅ Wrap inside Authenticator.Provider */}
      <Authenticator>
        {({ signOut, user }) => (
          <View style={{ textAlign: "center", padding: "20px" }}>
            <h2>Welcome to KeepCapsule</h2>
            {user ? (
              <div>
                <p>Signed in as: {user.username}</p>
                <Button onClick={signOut}>Sign Out</Button>
              </div>
            ) : (
              <p>Please sign in to continue</p>
            )}
          </View>
        )}
      </Authenticator>
    </Authenticator.Provider>
  );
}
