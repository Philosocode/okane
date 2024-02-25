using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Models;
using Okane.Api.Infrastructure.Database;
using RegisterRequest = Okane.Api.Features.Auth.Dtos.Requests.RegisterRequest;

namespace Okane.Api.Features.Auth.Endpoints;

public static class AuthEndpointNames
{
    public const string Register = "Register";
    public const string Login = "Login";
    public const string Logout = "Logout";
}

// The code in this class has been taken from https://github.com/dotnet/aspnetcore/blob/release/8.0/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs
// Currently (.NET 8.0), the endpoints exposed by MapIdentityApi are restrictive and can't be
// customized. For example, when registering a user, you can only provide an email and password and
// nothing else. Want to include a UserName? Nope, can't do that.
// 
// If / when the Identity endpoints have been updated to support the customization requirements by
// this API, this class should be removed.
public static class AuthEndpoints
{
    // Validate the email address using DataAnnotations like the UserValidator does when RequireUniqueEmail = true.
    private static readonly EmailAddressAttribute EmailAddressAttribute = new();
    
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder group = app.MapGroup($"/auth").WithTags("auth");

        group.MapPost("/register", HandleRegister)
            .WithName(AuthEndpointNames.Register);

        group.MapPost("/login", HandleLogin)
            .WithName(AuthEndpointNames.Login);

        group.MapPost("/logout", HandleLogout)
            .WithName(AuthEndpointNames.Logout)
            .RequireAuthorization();
    }
    
    // Handlers.
    private static async Task<Results<Ok<string>, ValidationProblem>> HandleRegister(
        HttpContext context,
        [FromBody] RegisterRequest request,
        [FromServices] IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApiUser>>();
        if (!userManager.SupportsUserEmail)
        {
            throw new NotSupportedException(
                $"{nameof(HandleRegister)} requires a user store with email support."
            );
        }

        var userStore = serviceProvider.GetRequiredService<IUserStore<ApiUser>>();
        string email = request.Email;

        if (string.IsNullOrEmpty(email) || !EmailAddressAttribute.IsValid(email))
        {
            var error = IdentityResult.Failed(userManager.ErrorDescriber.InvalidEmail(email));
            return CreateValidationProblem(error);
        }

        if (string.IsNullOrEmpty(request.Name))
        {
            IdentityError[] errorResult = [new()
            {
                Code = "EmptyName",
                Description = "A name is required."
            }];
            return CreateValidationProblem(IdentityResult.Failed(errorResult));
        }

        var user = new ApiUser { Email = email, Name = request.Name };
        await userStore.SetUserNameAsync(user, email, CancellationToken.None);
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return CreateValidationProblem(result);
        }

        return TypedResults.Ok("Successfully registered");
    }

    private static async Task<Results<Ok<ApiUser>, EmptyHttpResult, ProblemHttpResult>> HandleLogin(
        ApiDbContext db,
        [FromBody] LoginRequest request, 
        [FromServices] IServiceProvider serviceProvider)
    {
        var signInManager = serviceProvider.GetRequiredService<SignInManager<ApiUser>>();
        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;

        var result = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, true, lockoutOnFailure: true
        );

        if (!result.Succeeded)
        {
            return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await db.
            Users.
            Where(u => u.Email == request.Email).
            AsNoTracking().
            SingleOrDefaultAsync();

        return TypedResults.Ok(user);
    }

    private static async Task<NoContent> HandleLogout(
        HttpContext context,
        SignInManager<ApiUser> signInManager)
    {
        await context.SignOutAsync();
        return TypedResults.NoContent();
    }
    
    // Helpers.
    private static ValidationProblem CreateValidationProblem(IdentityResult result)
    {
        // We expect a single error code and description in the normal case.
        // This could be golfed with GroupBy and ToDictionary, but perf! :P
        Debug.Assert(!result.Succeeded);
        var errorDictionary = new Dictionary<string, string[]>(1);

        foreach (var error in result.Errors)
        {
            string[] newDescriptions;

            if (errorDictionary.TryGetValue(error.Code, out var descriptions))
            {
                newDescriptions = new string[descriptions.Length + 1];
                Array.Copy(descriptions, newDescriptions, descriptions.Length);
                newDescriptions[descriptions.Length] = error.Description;
            }
            else
            {
                newDescriptions = [error.Description];
            }

            errorDictionary[error.Code] = newDescriptions;
        }

        return TypedResults.ValidationProblem(errorDictionary);
    }
}
