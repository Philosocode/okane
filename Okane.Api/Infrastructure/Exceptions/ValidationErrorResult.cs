using System.Reflection;
using Microsoft.AspNetCore.Http.Metadata;

namespace Okane.Api.Infrastructure.Exceptions;

public record ValidationErrorResult : IResult, IEndpointMetadataProvider{
    public required string Property { get; init; }
    public required string Message { get; init; }
    
    public async Task ExecuteAsync(HttpContext httpContext)
    {
        var response = TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            [Property] = [Message]
        });

        await response.ExecuteAsync(httpContext);
    }
    
    public static void PopulateMetadata(MethodInfo method, EndpointBuilder builder)
    {
        builder.Metadata.Add(
            new ProducesResponseTypeMetadata(
                StatusCodes.Status400BadRequest, 
                typeof(HttpValidationProblemDetails), 
                ["application/problem+json"]
            )
        );
    }
}
