using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Infrastructure.Endpoints;

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
    
    // See: https://github.com/dotnet/aspnetcore/blob/e737c6fe54fa596289268140864c127957c0b1a1/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L57
    private static async Task<Results<Created<UserResponse>, BadRequest<ProblemDetails>, ValidationProblem>>
        Handle(
            Request request, 
            LinkGenerator linkGenerator,
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
            logger.LogInformation("Error registering user: {User}", userToCreate);

            return TypedResults.ValidationProblem(registerResult.ToErrorDictionary());
        }

        logger.LogInformation("New user registered: {User}", userToCreate);

        var location = linkGenerator.GetPathByName(AuthEndpointNames.GetSelf);
        return TypedResults.Created(location, userToCreate.ToUserResponse());
    }
}
