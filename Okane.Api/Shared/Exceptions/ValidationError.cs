using System.Reflection;
using Microsoft.AspNetCore.Http.Metadata;

namespace Okane.Api.Shared.Exceptions;

public record ValidationError(string Property, string Message) : IResult, IEndpointMetadataProvider
{
    public static void PopulateMetadata(MethodInfo method, EndpointBuilder builder)
    {
        builder.Metadata.Add(new ProducesResponseTypeMetadata(StatusCodes.Status400BadRequest, typeof(HttpValidationProblemDetails), ["application/problem+json"]));
    }

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        var response = TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            [Property] = [Message]
        });

        await response.ExecuteAsync(httpContext);
    }
}
