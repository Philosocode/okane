using System.Net.Mime;
using System.Reflection;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;

namespace Okane.Api.Shared.Exceptions;

public record UnauthorizedResult : IResult, IEndpointMetadataProvider
{
    public static void PopulateMetadata(MethodInfo method, EndpointBuilder builder)
    {
        builder.Metadata.Add(
            new ProducesResponseTypeMetadata(
                StatusCodes.Status401Unauthorized,
                typeof(ProblemDetails),
                [MediaTypeNames.Application.ProblemJson]
            )
        );
    }

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        ProblemHttpResult response = TypedResults.Problem(new ProblemDetails
        {
            Status = StatusCodes.Status401Unauthorized,
            Detail = "Please authenticate to access this endpoint."
        });

        await response.ExecuteAsync(httpContext);
    }
}
