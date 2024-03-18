using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
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

/// <summary>
/// Endpoints for authentication.
/// </summary>
/// <see href="https://github.com/dotnet/aspnetcore/blob/476e2aa0c7cb25d6a9c774228e5c549c77620108/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L57" />
/// <see href="https://jasonwatmore.com/net-6-jwt-authentication-with-refresh-tokens-tutorial-with-example-api#project-structure" />
public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder routeGroup = app.MapGroup("/auth").WithTags("Auth");
        
        routeGroup.MapPost("/register", HandleRegister)
            .WithName(AuthEndpointNames.Register);

        routeGroup.MapPost("/login", HandleLogin)
            .WithName(AuthEndpointNames.Login);

        routeGroup.MapPost("/logout", HandleLogout)
            .WithName(AuthEndpointNames.Logout)
            .RequireAuthorization()
            .Produces(StatusCodes.Status401Unauthorized);

        routeGroup.MapPost("/refresh-token", HandleRefreshToken)
            .WithName(AuthEndpointNames.RefreshToken);

        routeGroup.MapPost("/revoke-token", HandleRevokeRefreshToken)
            .WithName(AuthEndpointNames.RevokeToken)
            .RequireAuthorization()
            .Produces(StatusCodes.Status401Unauthorized);

        routeGroup.MapGet("/self", HandleGetSelf)
            .WithName(AuthEndpointNames.GetSelf)
            .RequireAuthorization()
            .Produces(StatusCodes.Status401Unauthorized);
    }

    private static async Task<Results<NoContent, BadRequest<ApiErrorsResponse>>>
        HandleRegister(
            IAuthService authService, 
            RegisterRequest request,
            CancellationToken cancellationToken)
    {
        try
        {
            await authService.Register(request, cancellationToken);
        }
        catch (ValidationException exception)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse(exception.MapToApiResponseErrors()));
        }
        catch (IdentityException exception)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse(exception.MapToApiResponseErrors()));
        }

        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, BadRequest<ApiErrorsResponse>>> 
        HandleLogin(
            IAuthService authService,
            JwtSettings jwtSettings,
            LoginRequest request,
            HttpResponse response,
            CancellationToken cancellationToken)
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

    private static async Task<Results<NoContent, UnauthorizedHttpResult>>HandleLogout(
        ClaimsPrincipal claimsPrincipal,
        HttpContext context,
        HttpRequest request,
        ITokenService tokenService,
        CancellationToken cancellationToken)
    {
        string? userId = claimsPrincipal.GetUserId();
        string? refreshToken = GetRefreshTokenFromCookie(request);

        if (userId is null || refreshToken is null)
        {
            return TypedResults.Unauthorized();
        }

        try
        {
            await tokenService.RevokeRefreshToken(refreshToken, userId, cancellationToken);
        }
        catch (Exception)
        {
            return TypedResults.Unauthorized();
        }
        
        await context.SignOutAsync();
        
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, BadRequest<ApiErrorsResponse>>>
        HandleRefreshToken(
            JwtSettings jwtSettings,
            HttpRequest request,
            HttpResponse response,
            ITokenService tokenService,
            CancellationToken cancellationToken)
    {
        var refreshToken = GetRefreshTokenFromCookie(request);
        if (refreshToken is null)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse("Refresh token is required."));
        }

        AuthenticateResponse authenticateResponse;
        try
        {
            authenticateResponse = await tokenService.RotateRefreshToken(refreshToken, cancellationToken);
        }
        catch (Exception)
        {
            return TypedResults.BadRequest(new ApiErrorsResponse("Error rotating refresh token."));
        }

        SetRefreshTokenCookie(jwtSettings, response, authenticateResponse.RefreshToken);

        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(authenticateResponse));
    }
    
    private static async Task<Results<NoContent, UnauthorizedHttpResult>> HandleRevokeRefreshToken(
        ClaimsPrincipal claimsPrincipal,
        ApiDbContext db,
        RevokeRefreshTokenRequest tokenRequest,
        ITokenService tokenService,
        HttpRequest request,
        CancellationToken cancellationToken)
    {
        string? userId = claimsPrincipal.GetUserId();
        string? refreshTokenToRevoke = tokenRequest.RefreshToken ?? GetRefreshTokenFromCookie(request);
        if (userId is null || refreshTokenToRevoke is null)
        {
            return TypedResults.Unauthorized();
        }
        
        try
        {
            await tokenService.RevokeRefreshToken(refreshTokenToRevoke, userId, cancellationToken);
        }
        catch (Exception)
        {
            return TypedResults.Unauthorized();
        }
        
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ApiResponse<UserResponse>>, UnauthorizedHttpResult>> 
        HandleGetSelf(
            IAuthService authService,
            ClaimsPrincipal claimsPrincipal, 
            ApiDbContext db,
            CancellationToken cancellationToken
        )
    {
        string? userId = claimsPrincipal.GetUserId();
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }
        
        ApiUser? user = await authService.GetSelf(userId, cancellationToken);
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
