using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Auth.Endpoints;

public class PatchSelf : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPatch("/self", HandleAsync)
            .WithName(AuthEndpointNames.PatchSelf)
            .WithSummary("Update the currently-authenticated user's name and/or password.");
    }

    public record Request(string? Name, string? CurrentPassword, string? NewPassword);

    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            // If CurrentPassword is present, NewPassword should be present (and vice versa).
            RuleFor(r => r.CurrentPassword).NotEmpty().When(r => r.NewPassword?.Length > 0);
            RuleFor(r => r.NewPassword).NotEmpty().When(r => r.CurrentPassword?.Length > 0);
        }
    }

    private static async Task<Results<Ok<ApiResponse<UserResponse>>, UnauthorizedHttpResult, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            ApiDbContext db,
            ILogger<PatchSelf> logger,
            Request request,
            UserManager<ApiUser> userManager,
            IValidator<Request> validator,
            CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.ToDictionary());
        }

        var userId = claimsPrincipal.GetUserId();
        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        if (!string.IsNullOrEmpty(request.Name))
        {
            user.Name = request.Name;
            var changeNameResult = await userManager.UpdateAsync(user);
            if (!changeNameResult.Succeeded)
            {
                logger.LogInformation("Failed to update name for user: {UserId}", user.Id);
                return TypedResults.ValidationProblem(changeNameResult.ToErrorDictionary());
            }
        }

        if (!string.IsNullOrEmpty(request.CurrentPassword) && !string.IsNullOrEmpty(request.NewPassword))
        {
            var changePasswordResult = await userManager.ChangePasswordAsync(
                user, request.CurrentPassword, request.NewPassword
            );

            if (!changePasswordResult.Succeeded)
            {
                logger.LogInformation("User failed to change password: {UserId}", user.Id);
                return TypedResults.ValidationProblem(changePasswordResult.ToErrorDictionary());
            }
        }

        var response = new ApiResponse<UserResponse>(user.ToUserResponse());
        return TypedResults.Ok(response);
    }
}
