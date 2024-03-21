using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponse;

namespace Okane.Api.Features.Auth.Endpoints;

public class Register : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
        => builder
            .MapPost("/register", Handle)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.Register)
            .WithSummary("Register a new user.")
            .WithRequestValidation<Request>();

    public record Request(string Name, string Email, string Password);
    
    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            RuleFor(r => r.Email).NotEmpty().EmailAddress();
            RuleFor(r => r.Name).NotEmpty();
            RuleFor(r => r.Password).NotEmpty();
        }
    }
    
    private static async Task<Results<NoContent, BadRequest<ApiErrorsResponse>>>
        Handle(
            Request request, 
            ILogger<Register> logger,
            ITokenService tokenService,
            UserManager<ApiUser> userManager,
            IUserStore<ApiUser> userStore,
            CancellationToken cancellationToken)
    {
        var userToCreate = new ApiUser
        {
            Name = request.Name,
            Email = request.Email,
        };

        await userStore.SetUserNameAsync(userToCreate, userToCreate.Email, cancellationToken);

        var registerResult = await userManager.CreateAsync(userToCreate, request.Password);
        if (!registerResult.Succeeded)
        {
            logger.LogInformation("Error registering user: {Request}", request);
            
            return TypedResults.BadRequest(new ApiErrorsResponse("Failed to register."));
        }

        logger.LogInformation("New user registered: {Request}", request);

        return TypedResults.NoContent();
    }
}
