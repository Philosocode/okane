using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Okane.Api.Features.Auth.Dtos.Requests;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Exceptions;

namespace Okane.Api.Features.Auth.Services;

/// <summary>
/// Service for registering and authenticating users.
/// </summary>
interface IAuthService
{
    Task<ApiUser> Register(RegisterRequest request, CancellationToken cancellationToken);
}

public class AuthService(
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
}
