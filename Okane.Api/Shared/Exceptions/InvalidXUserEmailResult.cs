using System.Net.Mime;
using System.Reflection;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;

namespace Okane.Api.Shared.Exceptions;

public record InvalidXUserEmailResult : IResult, IEndpointMetadataProvider
{
    public const string ErrorDetail = "X-User-Email must match email in request body.";

    public static void PopulateMetadata(MethodInfo method, EndpointBuilder builder)
    {
        builder.Metadata.Add(
            new ProducesResponseTypeMetadata(
                StatusCodes.Status400BadRequest,
                typeof(ProblemDetails),
                [MediaTypeNames.Application.ProblemJson]
            )
        );
    }

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        var response = TypedResults.Problem(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Detail = ErrorDetail
        });

        await response.ExecuteAsync(httpContext);
    }
}
