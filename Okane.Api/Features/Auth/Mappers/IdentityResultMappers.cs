using Ardalis.GuardClauses;
using Microsoft.AspNetCore.Identity;
using Okane.Api.Shared.Guards;

namespace Okane.Api.Features.Auth.Mappers;

public static class IdentityResultMappers
{
    /// <summary>
    /// Map an IdentityResult to a dictionary that can be passed to TypedResults.ValidationProblem.
    /// </summary>
    /// <param name="result"></param>
    /// <see href="https://github.com/dotnet/aspnetcore/blob/main/src/Identity/Core/src/IdentityApiEndpointRouteBuilderExtensions.cs#L427C62-L427C76" />
    public static Dictionary<string, string[]> ToErrorDictionary(this IdentityResult result)
    {
        Guard.Against.True(result.Succeeded);
        
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

        return errorDictionary;
    }
}
