using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Infrastructure.Endpoints;

namespace Okane.Api.Features.Auth.Endpoints;

public class SendResetPasswordEmail : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/send-reset-password-email", HandleAsync)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.SendResetPasswordEmail)
            .WithSummary("Send reset password email.");
    }

    public record Request(string Email, string City = "") : HoneypotRequest(City);

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
        if (request.City.Length > 0)
        {
            return TypedResults.NoContent();
        }

        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null)
        {
            return TypedResults.NoContent();
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var emailContent = EmailGenerator.ResetYourPassword(request.Email, token, context.Request.Headers.Origin);

        _ = emailService.SendAsync(
            request.Email,
            emailContent.Subject,
            emailContent.Body,
            cancellationToken
        );
        logger.LogInformation("Sent reset password email to {Email}", user.Email);

        return TypedResults.NoContent();
    }
}
