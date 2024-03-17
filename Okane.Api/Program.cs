using FluentValidation;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Okane.Api;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.HealthCheck;
using Okane.Api.Shared.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Services.
{
    builder.Services.Configure<DbSettings>(builder.Configuration.GetSection(nameof(DbSettings)));
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddDbContext<ApiDbContext>();

    if (builder.Environment.IsDevelopment())
    {
        builder.Configuration.AddUserSecrets<Program>();
    }

    builder.Services.AddApiAuthentication(builder.Configuration);
    builder.Services.AddAuthorization();

    builder.Services.AddHealthChecks().AddDbContextCheck<ApiDbContext>();
    builder.Services.AddSwaggerGen();

    builder.Services.AddValidatorsFromAssemblyContaining<IApplicationMarker>();
}

var app = builder.Build();

// Request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UsePathBase("/api");

app.UseHealthChecks("/health", new HealthCheckOptions()
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

app.MapApiEndpoints();

app.UseAuthorization();

app.Run();
