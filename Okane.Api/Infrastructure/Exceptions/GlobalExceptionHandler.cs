using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Infrastructure.Exceptions;

/// <summary>
/// Handler for unhandled exceptions.
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
        
        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        
        var problemDetails = new ProblemDetails
        {
            Status = (int) HttpStatusCode.InternalServerError,
            Detail = exception.Message,
            Title = exception.GetType().Name,
        };

        if (exception is ApiException apiException)
        {
            httpContext.Response.StatusCode = (int)apiException.Status;
            problemDetails = apiException.ToProblemDetails();
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
