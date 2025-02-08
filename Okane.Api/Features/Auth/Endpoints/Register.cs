using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Infrastructure.Endpoints;

namespace Okane.Api.Features.Auth.Endpoints;

public class Register : IEndpoint
{
    public static readonly string DuplicateEmailCode = "DuplicateEmail";

    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/register", HandleAsync)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.Register)
            .WithSummary("Register a new user.")
            .WithRequestValidation<Request>();
    }

    public record Request(string Name, string Email, string Password, string City = "")
        : HoneypotRequest(City);

    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            RuleFor(r => r.Email).NotEmpty().EmailAddress();
            RuleFor(r => r.Name).NotEmpty();
            RuleFor(r => r.Password).NotEmpty();
        }
    }

    // See: https://github.com/dotnet/aspnetcore/blob/e737c6fe54fa596289268140864c127957c0b1a1/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L57
    private static async Task<Results<NoContent, BadRequest<ProblemDetails>, ValidationProblem>>
        HandleAsync(
            HttpContext context,
            ApiDbContext db,
            Request request,
            LinkGenerator linkGenerator,
            ILogger<Register> logger,
            IEmailService emailService,
            ITokenService tokenService,
            UserManager<ApiUser> userManager,
            IUserStore<ApiUser> userStore,
            CancellationToken cancellationToken)
    {
        if (request.City.Length > 0)
        {
            logger.LogInformation("Spam registration received: {Request}", request);

            return TypedResults.NoContent();
        }

        var userToCreate = new ApiUser
        {
            Name = request.Name,
            Email = request.Email
        };

        await userStore.SetUserNameAsync(userToCreate, userToCreate.Email, cancellationToken);

        IdentityResult registerResult = await userManager.CreateAsync(userToCreate, request.Password);
        if (registerResult.Succeeded)
        {
            logger.LogInformation("New user successfully registered: {Email}", request.Email);

            return await SendVerificationEmail(userToCreate);
        }

        var registrationErrors = registerResult.ToErrorDictionary();
        ApiUser? existingUser = null;
        if (registrationErrors.ContainsKey(DuplicateEmailCode))
        {
            existingUser = await db.Users.Where(u => u.Email == request.Email).SingleAsync(cancellationToken);
        }

        if (existingUser is not null && !existingUser.EmailConfirmed)
        {
            logger.LogInformation("Existing unverified user registered again: {Email}", request.Email);

            return await SendVerificationEmail(existingUser);
        }

        if (existingUser is not null)
        {
            logger.LogInformation("Already-verified user registered again: {Email}", request.Email);

            return SendAlreadyRegisteredEmail(
                request.Email,
                emailService,
                context.Request.Headers.Origin,
                cancellationToken
            );
        }

        // Some other error.
        logger.LogInformation("Error registering user: {User}", userToCreate);

        return TypedResults.ValidationProblem(registerResult.ToErrorDictionary());

        async Task<NoContent> SendVerificationEmail(ApiUser user)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var emailContent = EmailGenerator.VerifyYourEmail(
                request.Email,
                token,
                context.Request.Headers.Origin
            );

            _ = emailService.SendAsync(
                request.Email,
                emailContent.Subject,
                emailContent.Body,
                cancellationToken
            );

            logger.LogInformation("Sent verification email to {Email}", request.Email);

            return TypedResults.NoContent();
        }
    }

    private static NoContent SendAlreadyRegisteredEmail(
        string email,
        IEmailService emailService,
        string? origin,
        CancellationToken cancellationToken)
    {
        var emailContent = EmailGenerator.AccountAlreadyRegistered(origin);

        _ = emailService.SendAsync(
            email,
            emailContent.Subject,
            emailContent.Body,
            cancellationToken
        );

        return TypedResults.NoContent();
    }
}
