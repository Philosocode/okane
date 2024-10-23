using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Infrastructure.Endpoints;

namespace Okane.Api.Features.Auth.Endpoints;

public class SendVerificationEmail : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/send-verification-email", HandleAsync)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.SendVerificationEmail)
            .WithSummary("Send verification email to an unverified accounts.");
    }

    public record Request(string Email);

    private static async Task<Results<BadRequest<ProblemDetails>, NoContent>>
        HandleAsync(
            HttpContext context,
            ApiDbContext db,
            IEmailService emailService,
            ILogger<VerifyEmail> logger,
            Request request,
            UserManager<ApiUser> userManager,
            CancellationToken cancellationToken)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null)
        {
            return TypedResults.NoContent();
        }

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var emailContent = EmailGenerator.VerifyYourEmail(request.Email, token, context.Request.Headers.Origin);

        _ = emailService.SendAsync(
            request.Email,
            emailContent.Subject,
            emailContent.Body,
            cancellationToken
        );
        logger.LogInformation("Sent verification email to {Email}", user.Email);

        return TypedResults.NoContent();
    }
}
