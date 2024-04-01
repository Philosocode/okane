using Bogus;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Tests.Testing.StubFactories;

public class RefreshTokenStubFactory
{
    public static Faker<RefreshToken> GetFactory(string userId)
    {
        return new Faker<RefreshToken>()
            .RuleFor(t => t.Token, faker => faker.Random.Guid().ToString())
            .RuleFor(t => t.UserId, userId)
            .RuleFor(t => t.CreatedAt, DateTime.UtcNow)
            .RuleFor(t => t.ExpiresAt, DateTime.UtcNow.AddMinutes(540));
    }

    public static RefreshToken Create(string userId) => GetFactory(userId).Generate();

}
