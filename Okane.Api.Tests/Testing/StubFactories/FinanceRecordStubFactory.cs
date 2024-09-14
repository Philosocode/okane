using Bogus;
using Okane.Api.Features.Finances.Entities;

namespace Okane.Api.Tests.Testing.StubFactories;

public class FinanceRecordStubFactory
{
    public static FinanceRecord Create(string userId)
    {
        return new Faker<FinanceRecord>()
            .RuleFor(
                r => r.Amount,
                faker => faker.Finance.Amount((decimal)0.01)
            )
            .RuleFor(r => r.Description, faker => faker.Lorem.Sentence(4))
            .RuleFor(r => r.HappenedAt, DateTime.UtcNow)
            .RuleFor(r => r.Type, faker => faker.PickRandom<FinanceRecordType>())
            .RuleFor(r => r.UserId, userId);
    }
}
