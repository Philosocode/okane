using FluentAssertions;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;

namespace Okane.Api.Tests.Features.Auth.Mappers;

public class UserMappersTests
{
    [Fact]
    public void ToUserResponse_ReturnsAUserResponse()
    {
        var apiUser = new ApiUser
        {
            Id = "okane-user-id",
            Name = "Okane",
            Email = "test@okane.com"
        };

        var actual = apiUser.ToUserResponse();
        var expected = new UserResponse
        {
            Id = apiUser.Id,
            Email = apiUser.Email,
            EmailConfirmed = apiUser.EmailConfirmed,
            Name = apiUser.Name
        };

        actual.Should().Be(expected);
    }
}
