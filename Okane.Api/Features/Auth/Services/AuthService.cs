using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Exceptions;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Features.Auth.Services;

/// <summary>
/// Service for registering and authenticating users.
/// </summary>
interface IAuthService
{
    Task<ApiUser> Register(RegisterRequest request, CancellationToken cancellationToken);
    Task<LoginResponse> Login(LoginRequest request, CancellationToken cancellationToken);
}

public class AuthService(
    ApiDbContext db,
    SignInManager<ApiUser> signInManager,
    ITokenService tokenService,
    UserManager<ApiUser> userManager,
    IUserStore<ApiUser> userStore,
    IValidator<ApiUser> userValidator) : IAuthService
{
    public async Task<ApiUser> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var userToCreate = new ApiUser
        {
            Name = request.Name,
            Email = request.Email,
        };
        await userValidator.ValidateAndThrowAsync(userToCreate, cancellationToken);
        
        await userStore.SetUserNameAsync(userToCreate, userToCreate.Email, cancellationToken);

        var registerResult = await userManager.CreateAsync(userToCreate, request.Password);
        if (!registerResult.Succeeded)
        {
            throw new IdentityException("Error creating user.", registerResult.Errors);
        }

        return userToCreate;
    }

    public async Task<LoginResponse> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;
        
        var signInResult = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, true, true
        );

        var signInError = "Error signing in.";
        
        if (!signInResult.Succeeded)
        {
            throw new Exception(signInError);
        }

        var user = await db.Users.
            Include(u => u.RefreshTokens).
            SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        
        if (user is null)
        {
            throw new Exception(signInError);
        }

        string jwtToken = tokenService.GenerateJwtToken(user.Id);
        RefreshToken refreshToken = await tokenService.GenerateRefreshToken();

        user.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        return new LoginResponse
        {
            Email = user.Email!,
            Name = user.Name,
            JwtToken = jwtToken,
            RefreshToken = refreshToken,
        };
    }
}
