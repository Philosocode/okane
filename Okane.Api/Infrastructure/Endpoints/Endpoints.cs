using Okane.Api.Features.Auth.Endpoints;

namespace Okane.Api.Infrastructure.Endpoints;

public interface IEndpoint
{
    static abstract void Map(IEndpointRouteBuilder builder);
}

public static class Endpoints
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder builder)
    {
        var endpoints =
            builder.
                MapGroup("").
                RequireAuthorization();

        endpoints
            .MapGroup("/auth")
            .WithTags("Authentication")
            .MapEndpoint<Register>()
            .MapEndpoint<Login>()
            .MapEndpoint<Logout>()
            .MapEndpoint<RotateRefreshToken>()
            .MapEndpoint<RevokeRefreshToken>()
            .MapEndpoint<GetSelf>();
    }
    
    private static IEndpointRouteBuilder MapEndpoint<TEndpoint>(this IEndpointRouteBuilder builder) 
        where TEndpoint : IEndpoint
    {
        TEndpoint.Map(builder);
        
        return builder;
    }
}
