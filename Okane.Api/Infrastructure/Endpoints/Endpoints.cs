using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Finances.Endpoints;

namespace Okane.Api.Infrastructure.Endpoints;

public interface IEndpoint
{
    static abstract void Map(IEndpointRouteBuilder builder);
}

public static class Endpoints
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder builder)
    {
        RouteGroupBuilder endpoints = builder.MapGroup("")
            .RequireAuthorization()
            .WithOpenApi();

        endpoints
            .MapGroup("/auth")
            .WithTags("Authentication")
            .MapEndpoint<Register>()
            .MapEndpoint<Login>()
            .MapEndpoint<Logout>()
            .MapEndpoint<SendResetPasswordEmail>()
            .MapEndpoint<ResetPassword>()
            .MapEndpoint<SendVerificationEmail>()
            .MapEndpoint<VerifyEmail>()
            .MapEndpoint<RotateRefreshToken>()
            .MapEndpoint<RevokeRefreshToken>()
            .MapEndpoint<GetPasswordRequirements>()
            .MapEndpoint<GetSelf>()
            .MapEndpoint<PatchSelf>()
            .MapEndpoint<DeleteSelf>();

        endpoints
            .MapGroup("/finance-records")
            .WithTags("Finance Records")
            .MapEndpoint<GetFinanceRecord>()
            .MapEndpoint<GetPaginatedFinanceRecords>()
            .MapEndpoint<GetFinanceRecordsStats>()
            .MapEndpoint<PostFinanceRecord>()
            .MapEndpoint<PatchFinanceRecord>()
            .MapEndpoint<DeleteFinanceRecord>();

        endpoints
            .MapGroup("/finance-user-tags")
            .WithTags("Finance User Tags")
            .MapEndpoint<GetFinanceUserTag>()
            .MapEndpoint<GetFinanceUserTags>()
            .MapEndpoint<PostFinanceUserTag>()
            .MapEndpoint<PutRenameFinanceUserTag>()
            .MapEndpoint<DeleteFinanceUserTag>();
    }

    private static IEndpointRouteBuilder MapEndpoint<TEndpoint>(this IEndpointRouteBuilder builder)
        where TEndpoint : IEndpoint
    {
        TEndpoint.Map(builder);

        return builder;
    }
}
