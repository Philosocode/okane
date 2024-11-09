using Microsoft.AspNetCore.Identity;
using Okane.Api.Features.Auth.Dtos.Responses;

namespace Okane.Api.Features.Auth.Mappers;

public static class PasswordOptionsMappers
{
    /// <summary>
    ///     Map a PasswordOptions to a PasswordRequirementsResponse.
    /// </summary>
    /// <param name="options"></param>
    public static PasswordRequirementsResponse ToPasswordRequirementsResponse(this PasswordOptions options)
    {
        return new PasswordRequirementsResponse
        {
            MinLength = options.RequiredLength,
            RequireDigit = options.RequireDigit,
            RequireLowercase = options.RequireLowercase,
            RequireUppercase = options.RequireUppercase,
            RequireNonAlphanumeric = options.RequireNonAlphanumeric
        };
    }
}
