using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Auth.Endpoints;

public class GetPasswordRequirements : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("/password-requirements", Handle)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.GetPasswordRequirements)
            .WithSummary("Get the configured password requirements.");
    }

    private static Ok<ApiResponse<PasswordRequirementsResponse>> Handle(IOptions<IdentityOptions> identityOptions)
    {
        return TypedResults.Ok(new ApiResponse<PasswordRequirementsResponse>(
            identityOptions.Value.Password.ToPasswordRequirementsResponse()
        ));
    }
}
