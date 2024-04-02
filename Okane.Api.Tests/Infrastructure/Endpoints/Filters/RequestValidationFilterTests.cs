using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Okane.Api.Infrastructure.Endpoints.Filters;

namespace Okane.Api.Tests.Infrastructure.Endpoints.Filters;

public class RequestValidationFilterTests
{
    private const string ValidName = "Khurt";
    private readonly HttpContext _context = new DefaultHttpContext();

    private readonly ILogger<RequestValidationFilter<Person>> _logger = Substitute.For<ILogger<RequestValidationFilter<Person>>>();

    private readonly EndpointFilterDelegate _next = Substitute.For<EndpointFilterDelegate>();

    [Fact]
    public async Task CallsNext_WhenTheRequestIsValid()
    {
        var recordToValidate = new Person(ValidName);
        var context = new DefaultEndpointFilterInvocationContext(_context, recordToValidate);

        var validationFilter = new RequestValidationFilter<Person>(_logger, new Validator());
        await validationFilter.InvokeAsync(context, _next);
        await _next.Received()(Arg.Is(context));
    }

    [Fact]
    public async Task CallsNext_WhenValidatorIsMissing()
    {
        var recordToValidate = new Person(ValidName);
        var context = new DefaultEndpointFilterInvocationContext(_context, recordToValidate);

        var validationFilter = new RequestValidationFilter<Person>(_logger);
        await validationFilter.InvokeAsync(context, _next);
        await _next.Received()(Arg.Is(context));
    }

    [Fact]
    public async Task ThrowsAnError_WhenTheRequestIsInvalid()
    {
        var recordToValidate = new Person("Invalid");
        var context = new DefaultEndpointFilterInvocationContext(_context, recordToValidate);

        var validator = new Validator();
        ValidationResult? validationResult = await validator.ValidateAsync(recordToValidate);
        var validationFilter = new RequestValidationFilter<Person>(_logger, validator);

        var response = await validationFilter.InvokeAsync(context, _next);
        response.Should()
            .BeOfType<ValidationProblem>()
            .And.BeEquivalentTo(TypedResults.ValidationProblem(
                validationResult.ToDictionary())
            );
    }

    // This must be public or an "ArgumentException: Can not create proxy..." exception will occur.
    public record Person(string Name);

    private class Validator : AbstractValidator<Person>
    {
        public Validator()
        {
            RuleFor(r => r.Name).Matches(ValidName);
        }
    }
}
