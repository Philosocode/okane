using Bogus;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Tests.Testing.StubFactories;

public class ApiUserStubFactory
{
    public static ApiUser Create()
    {
        return new Faker<ApiUser>()
            .RuleFor(u => u.Name, "Okane User")
            .RuleFor(u => u.Email, faker => faker.Internet.Email("Okane", "User"))
            .RuleFor(u => u.EmailConfirmed, true)
            .RuleFor(u => u.PhoneNumberConfirmed, true)
            .RuleFor(u => u.TwoFactorEnabled, false)
            .RuleFor(u => u.LockoutEnabled, false)
            .RuleFor(u => u.AccessFailedCount, 0)
            .Generate();
    }
}
