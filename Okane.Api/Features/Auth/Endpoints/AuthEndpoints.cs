using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Features.Auth.Endpoints;

public static class AuthEndpointNames
{
    public const string GetSelf = "GetSelf";
    public const string Login = "Login";
    public const string Logout = "Logout";
    public const string Register = "Register";
    public const string RefreshToken = "RefreshToken";
    public const string RevokeToken = "RevokeToken";
}

// A lot of code in this class has been heavily borrowed from https://github.com/dotnet/aspnetcore/blob/476e2aa0c7cb25d6a9c774228e5c549c77620108/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L57
public static class AuthEndpoints
{
    // Validate the email address using DataAnnotations like the UserValidator does when RequireUniqueEmail = true.
    private static readonly EmailAddressAttribute EmailAddressAttribute = new();

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder routeGroup = app.MapGroup("/auth").WithTags("auth");

        routeGroup.MapPost("/register", HandleRegister)
            .WithName(AuthEndpointNames.Register);

        routeGroup.MapPost("/login", HandleLogin)
            .WithName(AuthEndpointNames.Login);

        routeGroup.MapPost("/logout", HandleLogout)
            .WithName(AuthEndpointNames.Logout)
            .RequireAuthorization();

        routeGroup.MapPost("/refresh-token", HandleRefreshToken)
            .WithName(AuthEndpointNames.RefreshToken);

        routeGroup.MapPost("/revoke-token", HandleRevokeRefreshToken)
            .WithName(AuthEndpointNames.RevokeToken)
            .RequireAuthorization();

        routeGroup.MapGet("/self", HandleGetSelf)
            .WithName(AuthEndpointNames.GetSelf)
            .RequireAuthorization();
    }

    // Handlers
    private static async Task<Results<Ok<string>, ValidationProblem>> HandleRegister(
        HttpContext context,
        [FromBody] RegisterRequest request,
        [FromServices] IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApiUser>>();
        if (!userManager.SupportsUserEmail)
        {
            throw new NotSupportedException(
                $"{nameof(HandleRegister)} requires a user store with email support."
            );
        }

        var userStore = serviceProvider.GetRequiredService<IUserStore<ApiUser>>();
        string email = request.Email;

        if (string.IsNullOrEmpty(email) || !EmailAddressAttribute.IsValid(email))
        {
            var error = IdentityResult.Failed(userManager.ErrorDescriber.InvalidEmail(email));
            return CreateValidationProblem(error);
        }

        if (string.IsNullOrEmpty(request.Name))
        {
            IdentityError[] errorResult =
            [
                new()
                {
                    Code = "EmptyName",
                    Description = "A name is required."
                }
            ];
            return CreateValidationProblem(IdentityResult.Failed(errorResult));
        }

        var user = new ApiUser { Email = email, Name = request.Name };
        await userStore.SetUserNameAsync(user, email, CancellationToken.None);

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return CreateValidationProblem(result);
        }

        return TypedResults.Ok("Successfully registered");
    }

    private static async Task<Results<Ok<LoginResponse>, EmptyHttpResult, ProblemHttpResult>>
        HandleLogin(
            ApiDbContext db,
            ITokenService tokenService,
            HttpResponse response,
            JwtSettings jwtSettings,
            [FromBody] LoginRequest request,
            [FromServices] IServiceProvider serviceProvider)
    {
        var signInManager = serviceProvider.GetRequiredService<SignInManager<ApiUser>>();
        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;

        var signIn = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, true, lockoutOnFailure: true
        );

        if (!signIn.Succeeded)
        {
            return TypedResults.Problem(signIn.ToString(),
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == request.Email);

        if (user is null)
        {
            return TypedResults.Problem(signIn.ToString(),
                statusCode: StatusCodes.Status500InternalServerError);
        }

        string email = user.Email ?? "";
        string jwtToken = tokenService.GenerateJwtToken(user.Id);
        RefreshToken refreshToken = await tokenService.GenerateRefreshToken();

        user.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays)
        };
        response.Cookies.Append("okane_refreshToken", refreshToken.Token, cookieOptions);
        
        var loginResponse = new LoginResponse
        {
            Email = email,
            JwtToken = jwtToken,
            Name = user.Name,
        };

        return TypedResults.Ok(loginResponse);
    }

    private static async Task<Results<NoContent, BadRequest<string>>> HandleLogout(
        HttpContext context,
        HttpRequest request,
        ApiDbContext db,
        SignInManager<ApiUser> signInManager)
    {
        await context.SignOutAsync();
        
        if (request.Cookies.TryGetValue("okane_refreshToken", out var refreshToken))
        {
            var user = await db.Users.SingleOrDefaultAsync(u => u.RefreshTokens.Any(
                t => t.Token == refreshToken
            ));
            
            if (user is null)
            {
                return TypedResults.BadRequest("Error removing refresh token");
            }
            
            // user.RefreshTokens.RemoveAll(t => t.Token == refreshToken);
            await db.SaveChangesAsync();
        }
        
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<string>, BadRequest>> HandleRefreshToken(
        ApiDbContext db,
        HttpContext context,
        HttpRequest request,
        ClaimsPrincipal claimsPrincipal,
        [FromServices] ITokenService tokenService,
        HttpResponse response,
        UserManager<ApiUser> userManager,
        JwtSettings jwtSettings)
    {
        if (!request.Cookies.TryGetValue("okane_refreshToken", out var refreshToken)
            || refreshToken.IsNullOrEmpty())
        {
            return TypedResults.BadRequest();
        }
        
        var user = await db.Users.
            Include(apiUser => apiUser.RefreshTokens).
            SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken)
        );
        
        if (user is null)
        {
            return TypedResults.BadRequest();
        }

        var foundToken = user.RefreshTokens.Single(t => t.Token == refreshToken);
        if (foundToken.IsRevoked)
        {
            // Someone's trying to authenticate with a revoked token. Revoke all their tokens.
            user.RefreshTokens = new List<RefreshToken>();
            await db.SaveChangesAsync();
        }

        if (!foundToken.IsActive) return TypedResults.BadRequest();
        string jwtToken = tokenService.GenerateJwtToken(user.Id);

        // Only rotate the refresh token if it's about to expire (e.g. within 24 hours).
        if (foundToken.ExpiresAt < DateTime.UtcNow.AddDays(-1))
        {
            var newRefreshToken = await tokenService.GenerateRefreshToken();
            foundToken.RevokedAt = DateTime.UtcNow;
            user.RefreshTokens.Add(newRefreshToken);

            await db.SaveChangesAsync();

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays)
            };
            response.Cookies.Append("okane_refreshToken", newRefreshToken.Token, cookieOptions);
        }

        return TypedResults.Ok(jwtToken);
    }

    private static async Task<Results<NoContent, BadRequest<string>>> HandleRevokeRefreshToken(
        ApiDbContext db,
        RevokeRefreshTokenRequest tokenRequest,
        HttpRequest request)
    {
        string tokenToRevoke = request.Cookies["okane_refreshToken"] ?? tokenRequest.RefreshToken;
        if (tokenToRevoke.IsNullOrEmpty())
        {
            return TypedResults.BadRequest("A token is required.");
        }

        var user = await db.Users.
            Include(apiUser => apiUser.RefreshTokens).
            SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == tokenToRevoke)
        );
        
        if (user is null)
        {
            return TypedResults.BadRequest("No user found for token.");
        }

        var refreshToken = user.RefreshTokens.Single(t => t.Token == tokenToRevoke);
        refreshToken.RevokedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<UserResponse>, ValidationProblem, NotFound>> HandleGetSelf(
        ClaimsPrincipal claimsPrincipal, ApiDbContext db)
    {
        ApiUser? user = await db.Users.SingleOrDefaultAsync(u => u.Id == claimsPrincipal.GetUserId());
        if (user is null)
        {
            throw new NotSupportedException("Users must have an email.");
        }

        return TypedResults.Ok(new UserResponse
        {
            Email = user.Email,
            Name = user.Name
        });
    }

    // Helpers
    private static ValidationProblem CreateValidationProblem(IdentityResult result)
    {
        // We expect a single error code and description in the normal case.
        // This could be golfed with GroupBy and ToDictionary, but perf! :P
        Debug.Assert(!result.Succeeded);
        var errorDictionary = new Dictionary<string, string[]>(1);

        foreach (var error in result.Errors)
        {
            string[] newDescriptions;

            if (errorDictionary.TryGetValue(error.Code, out var descriptions))
            {
                newDescriptions = new string[descriptions.Length + 1];
                Array.Copy(descriptions, newDescriptions, descriptions.Length);
                newDescriptions[descriptions.Length] = error.Description;
            }
            else
            {
                newDescriptions = [error.Description];
            }

            errorDictionary[error.Code] = newDescriptions;
        }

        return TypedResults.ValidationProblem(errorDictionary);
    }
}
