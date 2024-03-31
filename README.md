# Okane
## Commands
See the `Makefile`s or more details.
- start the frontend: `make run-client`
- start the API: `make run-api`

## Set up user secrets
```text
dotnet user-secrets init
```


## Set up JWT settings
You can configure the audience, issuer, and expiration time in `appsettings.json`.
```text
dotnet user-secrets set 'JwtSettings:IssuerSigningKey' 'your-secret-key-here'
```

## Set up EF Core
### Create the database user
You'll need to have `psql` installed.
```text
psql -U postgres postgres

CREATE USER okane WITH ENCRYPTED PASSWORD 'your-secure-password';
ALTER USER okane CREATEDB;
\q
```

### Add DB connection string to user secrets
#### Okane.Api
```text
dotnet user-secrets set 'DbSettings:ConnectionString' 'Host=localhost;Username=okane;Password=your-secure-password;Database=okane'
```

#### Okane.Api.Tests
```text
dotnet user-secrets set 'DbSettings:ConnectionString' 'Host=localhost;Username=okane;Password=your-secure-password;Database=okane_test'
```


### Initialize database
```text
dotnet tool install -g dotnet-ef

// If in API project:
dotnet ef database update

// If in solution root:
dotnet ef database update --project ./Okane.Api
```
