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

public class VerifyEmail : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/verify-email", HandleAsync)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.VerifyEmail)
            .WithSummary("Generate and send an email verification token.");
    }

    public record Request(string Email, string Token);

    private static async Task<Results<BadRequest<ProblemDetails>, NoContent>>
        HandleAsync(
            HttpContext context,
            ApiDbContext db,
            ILogger<VerifyEmail> logger,
            Request request,
            UserManager<ApiUser> userManager,
            CancellationToken cancellationToken)
    {
        var user = await db.Users.SingleOrDefaultAsync(
            u => u.Email == request.Email, cancellationToken
        );

        var validationError = TypedResults.BadRequest(
            new ApiException("Error validating email").ToProblemDetails()
        );

        if (user is null)
        {
            return validationError;
        }

        var validationResult = await userManager.ConfirmEmailAsync(user, request.Token);
        if (!validationResult.Succeeded)
        {
            return validationError;
        }

        return TypedResults.NoContent();
    }
}
