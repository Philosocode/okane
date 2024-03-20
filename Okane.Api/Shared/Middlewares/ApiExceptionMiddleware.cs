using System.Net;
using System.Net.Mime;
using System.Text.Json;
using Okane.Api.Shared.Dtos.ApiResponse;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Shared.Middlewares;

public class ApiExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(httpContext, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = MediaTypeNames.Application.Json;

        switch (exception)
        {
            case ApiException ex:
                response.StatusCode = (int)ex.StatusCode;
                break;
            case KeyNotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                break;
            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var errorsResponse = new ApiErrorsResponse(exception.Message);
        string serializedResponse = JsonSerializer.Serialize(errorsResponse);
        
        await response.WriteAsync(serializedResponse);
    }
}
