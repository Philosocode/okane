using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Okane.Api.Shared.Exceptions;

/// <summary>
///     Handler for unhandled exceptions.
/// </summary>
public class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetailsService,
    IWebHostEnvironment environment) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError("Exception occurred: {Message}", exception.Message);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Detail = exception.Message,
            Title = exception.GetType().Name
        };

        if (exception is ApiException apiException)
        {
            httpContext.Response.StatusCode = (int)apiException.Status;
            problemDetails = apiException.ToProblemDetails();
        }
        else if (exception is BadHttpRequestException)
        {
            problemDetails.Status = httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            problemDetails.Status = StatusCodes.Status400BadRequest;
        }

        if (environment.IsDevelopment())
        {
            problemDetails.Extensions.Add("stackTrace", exception.StackTrace);
        }

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }
}
