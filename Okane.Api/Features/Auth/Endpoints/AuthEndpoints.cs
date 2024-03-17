using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
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



// A lot of code in this class has been heavily borrowed from https://github.com/dotnet/aspnetcore/blob/476e2aa0c7cb25d6a9c774228e5c549c77620108/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L57
public static class AuthEndpoints
{
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

    private static async Task<Results<Ok<ApiResponse<ApiUser>>, BadRequest<ApiErrorsResponse>>>
        HandleRegister(IAuthService authService, CancellationToken cancellationToken, RegisterRequest request)
    {
        ApiUser createdUser;
        try
        {
            createdUser = await authService.Register(request, cancellationToken);
        }
        catch (ValidationException exception)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse(exception.MapToApiResponseErrors()));
        }
        catch (IdentityException exception)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse(exception.MapToApiResponseErrors()));
        }

        return TypedResults.Ok(new ApiResponse<ApiUser>
        {
            Items = new[] { createdUser }
        });
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, BadRequest<ApiErrorsResponse>>> 
        HandleLogin(
            IAuthService authService,
            CancellationToken cancellationToken,
            JwtSettings jwtSettings,
            LoginRequest request,
            HttpResponse response)
    {
        AuthenticateResponse authenticateResponse;
        try
        {
            authenticateResponse = await authService.Login(request, cancellationToken);
        }
        catch (Exception)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse("Failed to authenticate."));
        }
        
        response.Cookies.Append(
            CookieNames.RefreshToken,
            authenticateResponse.RefreshToken.Token, 
            new CookieOptions {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays)
            }
        );

        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>()
        {
            Items = new []{ authenticateResponse }
        });
    }

    private static async Task<NoContent> HandleLogout(
        IAuthService authService,
        ClaimsPrincipal claimsPrincipal,
        HttpContext context,
        HttpRequest request,
        ITokenService tokenService)
    {
        string? userId = claimsPrincipal.GetUserId();
        
        await context.SignOutAsync();
        
        if (userId is not null && request.Cookies.TryGetValue(CookieNames.RefreshToken, out string? refreshToken))
        {
            await tokenService.RevokeRefreshToken(refreshToken, userId);
        }
        
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, UnauthorizedHttpResult>> HandleRefreshToken(
        JwtSettings jwtSettings,
        HttpRequest request, 
        HttpResponse response, 
        ITokenService tokenService)
    {
        if (!request.Cookies.TryGetValue(CookieNames.RefreshToken, out string? refreshToken))
        {
            return TypedResults.Unauthorized();
        }

        AuthenticateResponse authenticateResponse;
        try
        {
            authenticateResponse = await tokenService.RotateRefreshToken(refreshToken);
        }
        catch (Exception)
        {
            return TypedResults.Unauthorized();
        }
        
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays)
        };
        
        response.Cookies.Append(
            CookieNames.RefreshToken, 
            authenticateResponse.RefreshToken.Token,
            cookieOptions
        );

        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>
        {
            Items = new[]{ authenticateResponse }
        });
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
