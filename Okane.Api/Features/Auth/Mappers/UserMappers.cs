using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Features.Auth.Mappers;

public static class UserMappers
{
    public static UserResponse ToUserResponse(this ApiUser apiUser)
    {
        return new UserResponse
        {
            Id = apiUser.Id,
            Email = apiUser.Email,
            EmailConfirmed = apiUser.EmailConfirmed,
            Name = apiUser.Name
        };
    }
}
