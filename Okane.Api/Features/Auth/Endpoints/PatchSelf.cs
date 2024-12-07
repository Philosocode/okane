using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Exceptions;

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

    public record Request(string Name, string CurrentPassword, string NewPassword);

    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            // If CurrentPassword is present, NewPassword should be present (and vice versa).
            RuleFor(r => r.CurrentPassword).NotEmpty().When(r => r.NewPassword.Length > 0);
            RuleFor(r => r.NewPassword).NotEmpty().When(r => r.CurrentPassword.Length > 0);
        }
    }

    private static async Task<Results<Ok<ApiResponse<UserResponse>>, ValidationProblem, UnauthorizedResult>>
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
        var user = await db.Users.SingleAsync(u => u.Id == userId, cancellationToken);

        if (!request.Name.IsNullOrEmpty())
        {
            user.Name = request.Name;
        }

        if (!request.CurrentPassword.IsNullOrEmpty() && !request.NewPassword.IsNullOrEmpty())
        {
            var changePasswordResult = await userManager.ChangePasswordAsync(
                user, request.CurrentPassword, request.NewPassword
            );

            if (!changePasswordResult.Succeeded)
            {
                logger.LogInformation("User failed to change password: {Email}", user.Email);
                return TypedResults.ValidationProblem(changePasswordResult.ToErrorDictionary());
            }
        }

        var response = new ApiResponse<UserResponse>(user.ToUserResponse());
        return TypedResults.Ok(response);
    }
}
