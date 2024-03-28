using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace Okane.Api.Shared.Exceptions;

public class ApiException : Exception
{
    public HttpStatusCode Status { get; init; } = HttpStatusCode.BadRequest;
    public string? Title { get; init; }
    public string? Instance { get; init; }

    public ApiException() : base()
    {
    }

    public ApiException(string detail) : base(detail)
    {
    }

    public ApiException(string detail, Exception innerException) : base(detail, innerException)
    {
    }
}

public static class ApiExceptionMappers
{
    public static ProblemDetails ToProblemDetails(this ApiException exception)
    {
        return new ProblemDetails
        {
            Detail = exception.Message,
            Status = (int)exception.Status,

            // Optional fields. If null, these will be replaced with the defaults provided by 
            // services.AddProblemDetails().
            Instance = exception.Instance,
            Title = exception.Title
        };
    }
}
