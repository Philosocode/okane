using System.ComponentModel.DataAnnotations;
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
using Okane.Api.Features.Auth.Exceptions;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Dtos.ApiResponse;
using Okane.Api.Shared.Mappings;
using ValidationException = FluentValidation.ValidationException;

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

    private static async Task<Results<Ok<ApiResponse<ApiUser>>, BadRequest<ValidationErrorsApiResponse>>> HandleRegister(
        IAuthService authService, 
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        ApiUser createdUser;
        try
        {
            createdUser = await authService.Register(request, cancellationToken);
        }
        catch (ValidationException ex)
        {
            return TypedResults.BadRequest(ex.MapToErrorResponse());
        }
        catch (IdentityException ex)
        {
            return TypedResults.BadRequest(ex.MapToErrorResponse());
        }
        
        var apiResponse = new ApiResponse<ApiUser>
        {
            Items = new [] { createdUser }
        };
        
        return TypedResults.Ok(apiResponse);
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
}
