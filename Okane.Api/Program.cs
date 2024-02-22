using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Okane.Api.Infrastructure.AppSettings;
using Okane.Api.Infrastructure.HealthCheck;

var builder = WebApplication.CreateBuilder(args);

// Services.
builder.AddAppSettingsJsonFiles();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks();
builder.Services.AddSwaggerGen();

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
