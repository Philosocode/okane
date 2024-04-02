using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Tests.Shared.Exceptions;

public class ApiExceptionTests
{
    [Fact]
    public void ToProblemDetails_ReturnsProblemDetails()
    {
        var message = "An error occurred";
        var exception = new ApiException(message)
        {
            Status = HttpStatusCode.Accepted,
            Instance = "Cool Instance",
            Title = "Cool Title"
        };

        var actual = exception.ToProblemDetails();
        var expected = new ProblemDetails
        {
            Detail = message,
            Instance = exception.Instance,
            Status = (int)exception.Status,
            Title = exception.Title
        };

        actual.Should().BeEquivalentTo(expected);
    }
}
