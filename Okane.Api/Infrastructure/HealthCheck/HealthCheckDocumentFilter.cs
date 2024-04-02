using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Okane.Api.Infrastructure.HealthCheck;

// Referenced: https://stackoverflow.com/a/60265789
public class HealthCheckDocumentFilter : IDocumentFilter
{
    private const string HealthCheckEndpoint = "/api/health";
        
    public void Apply(OpenApiDocument openApiDocument, DocumentFilterContext context)
    {
        var pathItem = new OpenApiPathItem();

        var operation = new OpenApiOperation();
        operation.Tags.Add(new OpenApiTag { Name = "HealthCheck" });

        var properties = new Dictionary<string, OpenApiSchema>();
        properties.Add("status", new OpenApiSchema { Type = "string" });
        properties.Add("totalDuration", new OpenApiSchema { Type = "number" });
        properties.Add("entries", new OpenApiSchema { Type = "array" });

        var response = new OpenApiResponse();
        response.Content.Add("application/json", new OpenApiMediaType
        {
            Schema = new OpenApiSchema
            {
                Type = "object",
                AdditionalPropertiesAllowed = true,
                Properties = properties,
            }
        });

        operation.Responses.Add("200", response);
        pathItem.AddOperation(OperationType.Get, operation);
        openApiDocument?.Paths.Add(HealthCheckEndpoint, pathItem);
    }
}
