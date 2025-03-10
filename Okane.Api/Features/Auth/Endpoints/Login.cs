using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Shared.Wrappers;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace Okane.Api.Features.Auth.Endpoints;

public class Login : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/login", HandleAsync)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.Login)
            .WithSummary("Log in a new user.")
            .WithRequestValidation<Request>();
    }

    public record Request(string Email, string Password, string City = "")
        : HoneypotRequest(City);

    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            RuleFor(r => r.Email).NotEmpty().EmailAddress();
            RuleFor(r => r.Password).NotEmpty();
        }
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, BadRequest<ProblemDetails>>>
        HandleAsync(
            IDateTimeWrapper dateTime,
            HttpContext context,
            Request request,
            ApiDbContext db,
            IOptions<JwtSettings> jwtSettings,
            ILogger<Login> logger,
            SignInManager<ApiUser> signInManager,
            ITokenService tokenService,
            CancellationToken cancellationToken)
    {
        var errorAuthenticating = new ApiException("Error authenticating.");

        if (request.City.Length > 0)
        {
            logger.LogInformation("Spam login received: {Email}", request.Email);

            return TypedResults.BadRequest(errorAuthenticating.ToProblemDetails());
        }

        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;

        SignInResult signInResult = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, true, true
        );

        if (!signInResult.Succeeded)
        {
            logger.LogWarning("Login failure: {Email}", request.Email);

            return TypedResults.BadRequest(errorAuthenticating.ToProblemDetails());
        }

        ApiUser? user = await db.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null)
        {
            logger.LogError("Login succeeded but user not found");
            throw new InvalidOperationException();
        }

        var jwtToken = tokenService.GenerateJwtToken(user.Id);
        RefreshToken refreshToken = await tokenService.GenerateRefreshTokenAsync(true);

        user.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        TokenUtils.SetRefreshTokenCookie(dateTime, jwtSettings.Value, context.Response, refreshToken);

        var response = new AuthenticateResponse
        {
            User = user.ToUserResponse(),
            JwtToken = jwtToken,
            RefreshToken = refreshToken
        };

        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(response));
    }
}
