using System.Net;

namespace Okane.Api.Shared.Exceptions;

public class ApiException : Exception
{
    public HttpStatusCode StatusCode { get; init; } = HttpStatusCode.BadRequest;
    
    public ApiException() : base() { }

    public ApiException(string message) : base(message) { }
    
    public ApiException(string message, Exception innerException) : base(message, innerException) { }
    
    public ApiException(string message, HttpStatusCode statusCode) : base(message)
    {
        StatusCode = statusCode;
    }
}
