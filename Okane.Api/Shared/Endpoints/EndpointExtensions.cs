using Okane.Api.Features.Auth.Endpoints;

namespace Okane.Api.Shared.Endpoints;

public static class EndpointExtensions
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapAuthEndpoints();
    }
}
