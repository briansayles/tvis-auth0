# TourneyVision Client App

## Technologies/Services Used

- Okta (free tier) for authentication
- Hasura cloud (free tier) for GraphQL API engine
- AWS (free tier) for database hosting
- Postgresql for database
- Expo version 48 for react-native client development
- Apollo version 3 for GraphQL client
- React-navigation version 5
- React Native Elements version 4

## Authentication and Authorization

<p>Okta is used to provide authentication services. Hasura cloud is used for authorization/permissions, which are role-based.
Okta returns an access_token in JWT format that is signed. The Apollo client link is set up in the app to forward the JWT in the
Authorization header in requests sent to Hasura. Hasura validates that the JWT is legitimate by ensuring that it is signed
properly, which it is able to do because it has a copy of the signing secret stored away as an environment variable. The JWT
includes the user's ID and allowed roles, which are used by Hasura to ensure that the user has the proper permissions to
perform whatever actions it's requesting.
