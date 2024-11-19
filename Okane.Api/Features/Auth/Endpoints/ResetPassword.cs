using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Features.Auth.Endpoints;

public class ResetPassword : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/reset-password", HandleAsync)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.ResetPassword)
            .WithSummary("Reset password.");
    }

    public record Request(string Email, string Password, string Token);

    private static async Task<Results<BadRequest<ProblemDetails>, NoContent>>
        HandleAsync(
            HttpContext context,
            ApiDbContext db,
            ILogger<ResetPassword> logger,
            Request request,
            UserManager<ApiUser> userManager,
            CancellationToken cancellationToken)
    {
        var user = await db.Users.SingleOrDefaultAsync(
            u => u.Email == request.Email, cancellationToken
        );

        var resetPasswordError = TypedResults.BadRequest(
            new ApiException("Error resetting password").ToProblemDetails()
        );

        if (user is null)
        {
            return resetPasswordError;
        }

        var resetResult = await userManager.ResetPasswordAsync(user, request.Token, request.Password);
        if (!resetResult.Succeeded)
        {
            return resetPasswordError;
        }

        return TypedResults.NoContent();
    }
}
