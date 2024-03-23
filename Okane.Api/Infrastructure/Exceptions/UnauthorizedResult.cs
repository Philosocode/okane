using System.Reflection;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;

namespace Okane.Api.Infrastructure.Exceptions;

public record UnauthorizedResult : IResult, IEndpointMetadataProvider
{
    public async Task ExecuteAsync(HttpContext httpContext)
    {
        var response = TypedResults.Problem(new ProblemDetails
        {
            Status = StatusCodes.Status401Unauthorized,
            Detail = "Please authenticate to access this endpoint."
        });

        await response.ExecuteAsync(httpContext);
    }

    public static void PopulateMetadata(MethodInfo method, EndpointBuilder builder)
    {
        builder.Metadata.Add(
            new ProducesResponseTypeMetadata(
                StatusCodes.Status401Unauthorized, 
                typeof(ProblemDetails), 
                ["application/problem+json"]
            )
        );
    }
}
