using System.Net.Mime;
using System.Reflection;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http.Metadata;

namespace Okane.Api.Shared.Exceptions;

public record ValidationErrorResult : IResult, IEndpointMetadataProvider
{
    public required string Property { get; init; }
    public required string Message { get; init; }

    public static void PopulateMetadata(MethodInfo method, EndpointBuilder builder)
    {
        builder.Metadata.Add(
            new ProducesResponseTypeMetadata(
                StatusCodes.Status400BadRequest,
                typeof(HttpValidationProblemDetails),
                [MediaTypeNames.Application.ProblemJson]
            )
        );
    }

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        ValidationProblem response = TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            [Property] = [Message]
        });

        await response.ExecuteAsync(httpContext);
    }
}
