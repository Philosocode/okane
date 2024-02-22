# Okane
## Commands
See the `Makefile`s or more details.
- start the frontend: `make run-client`
- start the API: `make run-api`


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
```text
dotnet user-secrets init
dotnet user-secrets set 'DbSettings:ConnectionString' 'Host=localhost;Username=okane;Password=your-secure-password;Database=okane'
```

### Initialize database
```text
dotnet tool install -g dotnet-ef

// If in solution root.
dotnet ef database update --project ./Okane.Api
```
