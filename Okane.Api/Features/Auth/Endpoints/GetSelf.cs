using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponse;

namespace Okane.Api.Features.Auth.Endpoints;

public class GetSelf : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
        => builder
            .MapGet("/self", Handle)
            .WithName(AuthEndpointNames.GetSelf)
            .WithSummary("Get user details for the currently-authenticated user.");

    private static async Task<Results<Ok<ApiResponse<UserResponse>>, UnauthorizedHttpResult>> Handle(
        ClaimsPrincipal claimsPrincipal,
        ApiDbContext db,
        CancellationToken cancellationToken)
    {
        string userId = claimsPrincipal.GetUserId();
        
        ApiUser? user = await db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        return TypedResults.Ok(new ApiResponse<UserResponse>(user.ToUserResponse()));

    }
}
