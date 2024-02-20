# Project Structure
## Okane.Api
Contains all the API-related code. This project follows a feature-based structure:
```text
src/Features/Feature
             |--Constants
             |--Dtos
             |--Mappings
             |--Models
             |--Routes
             '--Validators
 
src/Infrastructure
    |--Configuration: appsettings, API configuration stuff
    |--Database: DB configuration, migrations, seeds
    '--Swagger
```
In the future, it may make sense to separate API logic from business logic. In this case, I
should keep code for routing, endpoints, and application configuration in an Api project and
move business logic stuff into a Core or Application project.

## API Testing projects
- Okane.Api.Tests.Unit/Integration/E2E


## Okane.Client
Contains the frontend app. Similar to how I've structured the API, I've chosen to use a 
feature-based rather than function-based structure:
```text
src/features/feature
             |--components
             |--composables
             |--constants
             '--utils
    
src/shared
    |--components
    '--mirror the feature folder structure above...
```

### Frontend tests
Tests will be placed by the associated source file.
- e.g. /features/users/User.ts, User.spec.ts

There are good arguments for and against putting test files next to source files VS storing them 
in a separate `__tests__` directory.

For relevant discussions, see:
- https://stackoverflow.com/questions/42385701/pros-and-cons-of-placing-test-files-in-the-same-folder-as-source-files-or-separ
- https://news.ycombinator.com/item?id=30689917