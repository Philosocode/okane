using System.Net.Mime;

namespace Okane.Api.Shared.Exceptions;

public class ProblemDetailsContentTypeMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        await next(context);
        
        if (context.Response.StatusCode >= StatusCodes.Status400BadRequest)
        {
            context.Response.ContentType = MediaTypeNames.Application.ProblemJson;
        }
    }
}
