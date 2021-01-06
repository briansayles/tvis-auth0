# TourneyVision Client APp

## Technologies/Services Used

- Auth0 for authentication
- Hasura cloud for GraphQL API engine
- Heroku for database hosting
- Postgresql for database
- Expo for react-native client development
- Apollo for GraphQL client

## Authentication and Authorization

<p>Auth0 is used to provide authentication services. Hasura cloud is used for authorization/permissions, which are role-based.
Auth0 returns an id_token in JWT format that is signed. The Apollo client link is set up in the app to forward the JWT in the
Authorization header in requests sent to Hasura. Hasura validates that the JWT is legitimate by ensuring that it is signed
properly, which it is able to do because it has a copy of the signing secret stored away as an environment variable. The JWT
includes the user's ID and allowed roles, which are used by Hasura to ensure that the user has the proper permissions to
perform whatever actions it's requesting.
