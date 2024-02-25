using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Okane.Api.Features.Auth.Models;
using Okane.Api.Infrastructure.AppSettings;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.HealthCheck;
using Okane.Api.Shared.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Services.
builder.AddAppSettingsJsonFiles();
builder.Services.Configure<DbSettings>(builder.Configuration.GetSection(nameof(DbSettings)));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDbContext<ApiDbContext>();

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<ApiUser>(options => 
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 12; // Min length
        
        // TODO #16: Users need to confirm their account before they can login.
        // options.SignIn.RequireConfirmedAccount = true;

        options.Lockout.AllowedForNewUsers = true; 
    })
    .AddEntityFrameworkStores<ApiDbContext>();

builder.Services.AddHealthChecks().AddDbContextCheck<ApiDbContext>();
builder.Services.AddSwaggerGen();

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

var app = builder.Build();

// Request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseHealthChecks("/api/health", new HealthCheckOptions()
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

app.MapApiEndpoints();

app.Run();
