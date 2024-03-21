using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponse;

namespace Okane.Api.Features.Auth.Endpoints;

public class Login : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
        => builder
            .MapPost("/login", Handle)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.Login)
            .WithSummary("Log in a new user.")
            .WithRequestValidation<Request>();

    public record Request(string Email, string Password);
    
    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            RuleFor(r => r.Email).NotEmpty().EmailAddress();
            RuleFor(r => r.Password).NotEmpty();
        }
    }
    
    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, BadRequest<ApiErrorsResponse>>> 
        Handle(
            HttpContext context,
            Request request,
            ApiDbContext db,
            IOptions<JwtSettings> jwtSettings,
            ILogger<Login> logger,
            SignInManager<ApiUser> signInManager,
            ITokenService tokenService,
            CancellationToken cancellationToken)
    {
        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;
        
        var signInResult = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, true, true
        );
        
        var errorsResponse = new ApiErrorsResponse("Error logging in.");
        
        if (!signInResult.Succeeded)
        {
            logger.LogInformation("Login failure: {Email}", request.Email);
            
            return TypedResults.BadRequest(errorsResponse);
        }
 
        var user = await db.Users
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null)
        {
            logger.LogError("Login succeeded but user not found");
            
            return TypedResults.BadRequest(errorsResponse);
        }
        
        string jwtToken = tokenService.GenerateJwtToken(user.Id);
        RefreshToken refreshToken = await tokenService.GenerateRefreshToken();
        
        user.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        TokenUtils.SetRefreshTokenCookie(jwtSettings.Value, context.Response, refreshToken);

        AuthenticateResponse response = new AuthenticateResponse
        {
            User = user.ToUserResponse(),
            JwtToken = jwtToken,
            RefreshToken = refreshToken,
        };
        
        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(response));
    }
}
