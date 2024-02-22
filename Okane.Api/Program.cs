using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Okane.Api.Infrastructure.AppSettings;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.HealthCheck;

var builder = WebApplication.CreateBuilder(args);

// Services.
builder.AddAppSettingsJsonFiles();
builder.Services.Configure<DbSettings>(builder.Configuration.GetSection(nameof(DbSettings)));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDbContext<ApiDbContext>();
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

app.UseHealthChecks("/api/health", new HealthCheckOptions()
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

app.Run();
