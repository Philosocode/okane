using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Exceptions;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Mappings;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Dtos.ApiResponse;
using Okane.Api.Shared.Mappings;
using ValidationException = FluentValidation.ValidationException;

namespace Okane.Api.Features.Auth.Endpoints;

// A lot of code in this class has been heavily borrowed from:
// - https://github.com/dotnet/aspnetcore/blob/476e2aa0c7cb25d6a9c774228e5c549c77620108/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L57
// - https://jasonwatmore.com/net-6-jwt-authentication-with-refresh-tokens-tutorial-with-example-api#project-structure
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
        HandleRegister(
            IAuthService authService, 
            CancellationToken cancellationToken, 
            RegisterRequest request)
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

        return TypedResults.Ok(new ApiResponse<ApiUser>(createdUser));
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

        SetRefreshTokenCookie(jwtSettings, response, authenticateResponse.RefreshToken);

        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(authenticateResponse));
    }

    private static async Task<NoContent>HandleLogout(
        IAuthService authService,
        CancellationToken cancellationToken,
        ClaimsPrincipal claimsPrincipal,
        HttpContext context,
        HttpRequest request,
        ITokenService tokenService)
    {
        string? userId = claimsPrincipal.GetUserId();
        
        await context.SignOutAsync();

        string? refreshToken = GetRefreshTokenFromCookie(request);
        
        if (userId is not null && refreshToken is not null)
        {
            await tokenService.RevokeRefreshToken(refreshToken, userId, cancellationToken);
        }
        
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, UnauthorizedHttpResult>>
        HandleRefreshToken(
            CancellationToken cancellationToken,
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
            authenticateResponse = await tokenService.RotateRefreshToken(refreshToken, cancellationToken);
        }
        catch (Exception)
        {
            return TypedResults.Unauthorized();
        }

        SetRefreshTokenCookie(jwtSettings, response, authenticateResponse.RefreshToken);

        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(authenticateResponse));
    }
    
    private static async Task<Results<NoContent, BadRequest<ApiErrorsResponse>>> HandleRevokeRefreshToken(
        CancellationToken cancellationToken,
        ClaimsPrincipal claimsPrincipal,
        ApiDbContext db,
        RevokeRefreshTokenRequest tokenRequest,
        ITokenService tokenService,
        HttpRequest request)
    {
        string? refreshTokenToRevoke = tokenRequest.RefreshToken ?? GetRefreshTokenFromCookie(request);
        if (refreshTokenToRevoke is null)
        {
            return TypedResults.BadRequest(
                new ApiErrorsResponse("Refresh token to revoke is empty.")
            );
        }

        string? userId = claimsPrincipal.GetUserId();
        if (userId is not null)
        {
            await tokenService.RevokeRefreshToken(refreshTokenToRevoke, userId, cancellationToken);
        }

        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ApiResponse<UserResponse>>, UnauthorizedHttpResult>> 
        HandleGetSelf(
            CancellationToken cancellationToken,
            ClaimsPrincipal claimsPrincipal, 
            ApiDbContext db
        )
    {
        ApiUser? user = await db.Users.SingleOrDefaultAsync(
            u => u.Id == claimsPrincipal.GetUserId(),
            cancellationToken
        );
        
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        return TypedResults.Ok(new ApiResponse<UserResponse>(user.ToUserResponse()));
    }
    
    // Helpers.
    private static string? GetRefreshTokenFromCookie(HttpRequest request)
        => request.Cookies[CookieNames.RefreshToken];
    
    private static void SetRefreshTokenCookie(
        JwtSettings jwtSettings,
        HttpResponse response, 
        RefreshToken refreshToken)
    {
        
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays)
        };
        
        response.Cookies.Append(
            CookieNames.RefreshToken, 
            refreshToken.Token,
            cookieOptions
        );
    }
}
