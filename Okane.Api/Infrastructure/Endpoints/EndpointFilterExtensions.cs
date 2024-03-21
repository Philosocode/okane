using Okane.Api.Infrastructure.Endpoints.Filters;

namespace Okane.Api.Infrastructure.Endpoints;

public static class EndpointFilterExtensions
{
    public static void WithRequestValidation<TRequest>(this RouteHandlerBuilder builder)
    {
        builder
            .AddEndpointFilter<RequestValidationFilter<TRequest>>()
            .ProducesValidationProblem();
    }
}
