using Bogus;
using Okane.Api.Features.Auth.Config;

namespace Okane.Api.Tests.Testing.StubFactories;

public class JwtSettingsStubFactory
{
    public static JwtSettings Create()
    {
        return new Faker<JwtSettings>()
            .RuleFor(x => x.Audience, "https://client.philosocode.com")
            .RuleFor(x => x.Issuer, "https://api.philosocode.com")
            .RuleFor(x => x.IssuerSigningKey, new Faker().Random.String2(100))
            .RuleFor(x => x.MinutesToExpiration, 540)
            .RuleFor(x => x.RefreshTokenTtlDays, 3)
            .Generate();
    }
}
