using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Shared.Exceptions;

public class GlobalExceptionHandlerTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private const string Endpoint = "/testing-endpoint";
    private const string ErrorMessage = "Prod blew up.";
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    private WebApplicationFactory<IApiMarker> SetUpApiFactory(
        ITestService testService,
        string environment = "")
    {
        return _apiFactory.WithWebHostBuilder(builder =>
        {
            if (environment != "")
            {
                builder.UseEnvironment(environment);
            }

            builder.ConfigureTestServices(services =>
            {
                services.AddProblemDetails();
                services.AddExceptionHandler<GlobalExceptionHandler>();
                services.AddSingleton(testService);
            });

            builder.Configure(app =>
            {
                app.UseRouting();
                app.UseExceptionHandler();
                app.UseEndpoints(endpoints =>
                {
                    endpoints.MapGet(Endpoint, async (
                        HttpContext context,
                        ITestService testServ) =>
                    {
                        await testServ.DoSomethingAsync();
                        await context.Response.WriteAsJsonAsync(new { Message = "Test" });
                    });
                });
            });
        });
    }

    [Fact]
    public async Task HandlesAnApiException()
    {
        var testService = Substitute.For<ITestService>();
        var exception = new ApiException(ErrorMessage);
        testService.DoSomethingAsync().Throws(exception);

        WebApplicationFactory<IApiMarker> apiFactory = SetUpApiFactory(testService);
        HttpClient client = apiFactory.CreateClient();

        HttpResponseMessage response = await client.GetAsync(Endpoint);
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().BeEquivalentTo(new ProblemDetails
        {
            Detail = ErrorMessage,
            Status = StatusCodes.Status400BadRequest,
            Title = "Bad Request",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
        }, options => options.Excluding(pd => pd.Extensions));

        problemDetails?.Extensions.Should()
            .NotBeNull()
            .And.ContainKey("stackTrace");
    }

    [Fact]
    public async Task HandlesABadHttpRequestException()
    {
        var testService = Substitute.For<ITestService>();
        var exception = new BadHttpRequestException(ErrorMessage);
        testService.DoSomethingAsync().Throws(exception);

        var apiFactory = SetUpApiFactory(testService);
        var client = apiFactory.CreateClient();

        var response = await client.GetAsync(Endpoint);
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().BeEquivalentTo(new ProblemDetails
        {
            Detail = ErrorMessage,
            Status = StatusCodes.Status400BadRequest,
            Title = "BadHttpRequestException",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
        }, options => options.Excluding(pd => pd.Extensions));

        problemDetails?.Extensions.Should()
            .NotBeNull()
            .And.ContainKey("stackTrace");
    }

    [Fact]
    public async Task HandlesADifferentException()
    {
        var testService = Substitute.For<ITestService>();
        var exception = new InvalidOperationException(ErrorMessage);
        testService.DoSomethingAsync().Throws(exception);

        WebApplicationFactory<IApiMarker> apiFactory = SetUpApiFactory(testService);
        HttpClient client = apiFactory.CreateClient();

        HttpResponseMessage response = await client.GetAsync(Endpoint);
        response.Should().HaveStatusCode(HttpStatusCode.InternalServerError);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().BeEquivalentTo(new ProblemDetails
        {
            Detail = ErrorMessage,
            Status = StatusCodes.Status500InternalServerError,
            Title = nameof(InvalidOperationException),
            Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1"
        }, options => options.Excluding(pd => pd.Extensions));

        problemDetails?.Extensions.Should()
            .NotBeNull()
            .And.ContainKey("stackTrace");
    }

    [Fact]
    public async Task ExcludesStackTraceDetails_WhenNotInDevelopment()
    {
        var testService = Substitute.For<ITestService>();
        var exception = new InvalidOperationException(ErrorMessage);
        testService.DoSomethingAsync().Throws(exception);

        var apiFactory = SetUpApiFactory(testService, Environments.Staging);
        HttpClient client = apiFactory.CreateClient();

        HttpResponseMessage response = await client.GetAsync(Endpoint);
        response.Should().HaveStatusCode(HttpStatusCode.InternalServerError);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().BeEquivalentTo(new ProblemDetails
        {
            Detail = ErrorMessage,
            Extensions = new Dictionary<string, object?>(),
            Status = StatusCodes.Status500InternalServerError,
            Title = nameof(InvalidOperationException),
            Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1"
        });
    }
}
